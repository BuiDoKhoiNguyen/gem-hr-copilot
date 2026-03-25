
from __future__ import annotations

import logging
import time
from typing import Any

from arq import create_pool
from arq.connections import ArqRedis, RedisSettings

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_redis_settings() -> RedisSettings:
    """Parse REDIS_URL into RedisSettings."""
    # redis://localhost:6379 -> host, port
    url = settings.REDIS_URL
    if url.startswith("redis://"):
        url = url[8:]
    host, port = url.split(":") if ":" in url else (url, 6379)
    return RedisSettings(host=host, port=int(port))


async def process_pdf_task(
    ctx: dict[str, Any],
    task_id: str,
    doc_id: str,
    file_bytes: bytes,
    filename: str,
    language: str,
) -> dict[str, Any]:
    """
    Process a single PDF file.
    This runs in the worker process, not the API server.
    """
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    from app.repositories.document_repo import DocumentRepository, IngestTaskRepository

    engine = create_async_engine(settings.DATABASE_URL)
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    t_start = time.perf_counter()

    async with SessionLocal() as db:
        doc_repo = DocumentRepository(db)
        task_repo = IngestTaskRepository(db)

        async def _update(progress: float, msg: str, status: str = "running"):
            await task_repo.update_task_status(task_id, status, progress=progress, progress_msg=msg)
            await doc_repo.update_progress(doc_id, progress, progress_msg=msg, run=status if status != "running" else None)
            await db.commit()

        try:
            await _update(0.05, "Saving PDF & parsing...")

            from pathlib import Path
            storage = Path(settings.DOCUMENT_STORAGE_DIR)
            storage.mkdir(parents=True, exist_ok=True)
            suffix = Path(filename).suffix
            if not suffix or suffix.lower() != ".pdf":
                suffix = ".pdf"
            dest = storage / f"{doc_id}{suffix}"
            dest.write_bytes(file_bytes)

            # 1. Parse
            from app.ingestion.pdf_processor import PDFLoader
            loader = PDFLoader(file_bytes, filename, language)
            sections = await loader.load()

            if not sections:
                raise ValueError("PDF produced no parseable content")

            await _update(0.35, f"Parsed {len(sections)} sections. Chunking...")

            # 2. Chunk
            from app.ingestion.chunker import chunk_sections_from_loader
            chunks = chunk_sections_from_loader(
                sections=sections,
                source_title=filename,
                source_url=f"local://uploads/{filename}",
                language=language,
                source_type="pdf",
            )

            await _update(0.55, f"{len(chunks)} chunks. Embedding...")

            # 3. Embed
            from app.ingestion.embedder import embed_chunks
            chunks_with_vectors = await embed_chunks(chunks)

            await _update(0.80, "Indexing to Elasticsearch...")

            # 4. ES Index
            from app.rag.retriever import ensure_index, bulk_index_chunks
            await ensure_index()
            chunk_ids = await bulk_index_chunks(chunks_with_vectors, kb_id=None, doc_id=doc_id)

            # 5. Finalize
            duration = time.perf_counter() - t_start
            await task_repo.update_task_status(
                task_id, "done", progress=1.0,
                progress_msg=f"Done: {len(chunks)} chunks in {duration:.1f}s",
                chunk_ids=chunk_ids, duration_s=duration,
            )
            await doc_repo.mark_done(doc_id, chunk_num=len(chunks), token_num=0, duration_s=duration)
            await db.commit()
            logger.info(f"[Worker] PDF done: {filename} → {len(chunks)} chunks in {duration:.1f}s")

            return {"status": "done", "chunks": len(chunks), "duration": duration}

        except Exception as e:
            logger.error(f"[Worker] PDF pipeline failed: {e}", exc_info=True)
            await task_repo.update_task_status(task_id, "failed", progress_msg=str(e))
            await doc_repo.mark_failed(doc_id, error=str(e))
            await db.commit()
            return {"status": "failed", "error": str(e)}

    await engine.dispose()


class WorkerSettings:
    """ARQ worker settings."""
    functions = [process_pdf_task]
    redis_settings = get_redis_settings()
    max_jobs = 5  # Process up to 5 PDFs concurrently
    job_timeout = 600  # 10 minutes max per PDF
    queue_name = "hr_copilot_ingest"
