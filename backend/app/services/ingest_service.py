from __future__ import annotations

import asyncio
import logging
import time
import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.repositories.document_repo import DocumentRepository, IngestTaskRepository
from app.repositories.session_repo import ConversationRepository

logger = logging.getLogger(__name__)


class IngestService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.doc_repo = DocumentRepository(db)
        self.task_repo = IngestTaskRepository(db)

    # ─── Start ingestion jobs ─────────────────────────────────────────────────

    async def start_pdf_ingest(
        self,
        file_bytes: bytes,
        filename: str,
        language: str,
        kb_id: Optional[str] = None,
    ) -> tuple[str, str]:
        """
        Register PDF document in DB and return (job_id, doc_id).
        Caller adds run_pdf_pipeline to BackgroundTasks.
        """
        from app.ingestion.base_loader import compute_bytes_hash

        # Dedup check
        content_hash = compute_bytes_hash(file_bytes)
        existing = await self.doc_repo.find_by_hash(content_hash)
        if existing and existing.run == "done":
            logger.info(f"[IngestService] Skip duplicate PDF: {filename} (hash match)")
            # Still return a "done" task so frontend shows success
            task = await self.task_repo.create_task(
                document_id=str(existing.id),
                priority=0,
            )
            await self.task_repo.update_task_status(
                str(task.id), "done", progress=1.0,
                progress_msg="Document already indexed (duplicate detected)",
                chunk_ids=[]
            )
            await self.db.commit()
            return str(task.id), str(existing.id)

        # Use default KB if not specified
        resolved_kb_id = kb_id or await self._get_or_create_default_kb(language)

        doc = await self.doc_repo.create_document(
            kb_id=resolved_kb_id,
            name=filename,
            source_type="pdf",
            location=f"local://uploads/{filename}",
            language=language,
            size_bytes=len(file_bytes),
            content_hash=content_hash,
            parser_id="docling",
        )
        task = await self.task_repo.create_task(document_id=str(doc.id))
        await self.db.commit()
        return str(task.id), str(doc.id)

    async def start_confluence_sync(
        self,
        space_key: str,
        language: str,
        kb_id: Optional[str] = None,
    ) -> tuple[str, str]:
        """Register a Confluence sync job. Returns (task_id, document_id)."""
        resolved_kb_id = kb_id or await self._get_or_create_default_kb(language)
        # Create a placeholder doc to track the sync job
        doc = await self.doc_repo.create_document(
            kb_id=resolved_kb_id,
            name=f"Confluence space: {space_key}",
            source_type="confluence",
            location=f"confluence://{space_key}",
            language=language,
        )
        task = await self.task_repo.create_task(document_id=str(doc.id))
        await self.db.commit()
        return str(task.id), str(doc.id)

    async def start_url_ingest(
        self,
        url: str,
        language: str,
        kb_id: Optional[str] = None,
    ) -> str:
        """Register a URL crawl job. Returns job_id."""
        resolved_kb_id = kb_id or await self._get_or_create_default_kb(language)
        doc = await self.doc_repo.create_document(
            kb_id=resolved_kb_id,
            name=url,
            source_type="url",
            location=f"url://{url}",
            language=language,
        )
        task = await self.task_repo.create_task(document_id=str(doc.id))
        await self.db.commit()
        return str(task.id)

    # ─── Status ───────────────────────────────────────────────────────────────

    async def get_job_status(self, task_id: str) -> dict:
        """Read status from IngestTask DB record."""
        from sqlalchemy import select
        from app.db.models.ingest_task import IngestTask
        result = await self.db.execute(
            select(IngestTask).where(IngestTask.id == uuid.UUID(task_id))
        )
        task = result.scalar_one_or_none()
        if not task:
            return {"status": "not_found", "progress": 0.0, "message": "Task not found", "chunk_count": 0}
        return {
            "status": task.status,
            "progress": task.progress,
            "message": task.progress_msg,
            "chunk_count": len(task.chunk_ids or []),
        }

    # ─── Background pipeline ──────────────────────────────────────────────────

    @staticmethod
    async def run_pdf_pipeline(
        task_id: str,
        doc_id: str,
        file_bytes: bytes,
        filename: str,
        language: str,
        db_url: str,
    ) -> None:
        """Full PDF ingestion pipeline — runs as a background task."""
        from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

        engine = create_async_engine(db_url)
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

                from app.core.config import settings

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
                logger.info(f"[IngestService] PDF done: {filename} → {len(chunks)} chunks in {duration:.1f}s")

            except Exception as e:
                logger.error(f"[IngestService] PDF pipeline failed: {e}", exc_info=True)
                await task_repo.update_task_status(task_id, "failed", progress_msg=str(e))
                await doc_repo.mark_failed(doc_id, error=str(e))
                await db.commit()

        await engine.dispose()

    @staticmethod
    async def run_confluence_pipeline(
        task_id: str,
        doc_id: str,
        space_key: str,
        language: str,
        db_url: str,
    ) -> None:
        """Crawl entire Confluence space — runs as background task."""
        from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

        engine = create_async_engine(db_url)
        SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

        async with SessionLocal() as db:
            doc_repo = DocumentRepository(db)
            task_repo = IngestTaskRepository(db)

            try:
                await task_repo.update_task_status(task_id, "running", progress=0.05, progress_msg="Fetching Confluence pages...")
                await db.commit()

                from app.ingestion.confluence import ConfluenceSpaceLoader
                auth_secret = (
                    settings.CONFLUENCE_PASSWORD.strip()
                    or settings.CONFLUENCE_TOKEN.strip()
                )
                if not auth_secret:
                    raise ValueError(
                        "Thiếu CONFLUENCE_TOKEN hoặc CONFLUENCE_PASSWORD (Server/DC thường dùng mật khẩu hoặc PAT)"
                    )
                space_loader = ConfluenceSpaceLoader(
                    space_key=space_key,
                    confluence_url=settings.CONFLUENCE_URL,
                    username=settings.CONFLUENCE_USER,
                    password=auth_secret,
                    language=language,
                    cloud=settings.CONFLUENCE_CLOUD,
                )
                page_loaders = await space_loader.get_pages()

                total = len(page_loaders)
                all_chunks = []

                for i, page_loader in enumerate(page_loaders):
                    progress = 0.1 + 0.7 * (i / max(total, 1))
                    await task_repo.update_task_status(
                        task_id, "running", progress=progress,
                        progress_msg=f"Processing page {i+1}/{total}..."
                    )
                    await db.commit()

                    sections = await page_loader.load()
                    meta = await page_loader.get_metadata()

                    from app.ingestion.chunker import chunk_sections_from_loader
                    chunks = chunk_sections_from_loader(
                        sections=sections,
                        source_title=meta.name,
                        source_url=meta.extra.get("page_url", ""),
                        language=language,
                        source_type="confluence",
                    )
                    all_chunks.extend(chunks)

                await task_repo.update_task_status(task_id, "running", progress=0.82, progress_msg=f"{len(all_chunks)} chunks. Embedding...")
                await db.commit()

                from app.ingestion.embedder import embed_chunks
                chunks_with_vectors = await embed_chunks(all_chunks)

                from app.rag.retriever import ensure_index, bulk_index_chunks
                await ensure_index()
                chunk_ids = await bulk_index_chunks(chunks_with_vectors, kb_id=None, doc_id=doc_id)

                await task_repo.update_task_status(
                    task_id, "done", progress=1.0,
                    progress_msg=f"Done: {len(all_chunks)} chunks from {total} pages",
                    chunk_ids=chunk_ids,
                )
                await doc_repo.mark_done(doc_id, chunk_num=len(all_chunks), token_num=0, duration_s=0)
                await db.commit()

            except Exception as e:
                logger.error(f"[IngestService] Confluence pipeline failed: {e}", exc_info=True)
                await task_repo.update_task_status(task_id, "failed", progress_msg=str(e))
                await doc_repo.mark_failed(doc_id, error=str(e))
                await db.commit()

        await engine.dispose()

    # ─── Private helpers ──────────────────────────────────────────────────────

    async def _get_or_create_default_kb(self, language: str) -> str:
        """Get or create a default KnowledgeBase for the given language."""
        from sqlalchemy import select
        from app.db.models.knowledge_base import KnowledgeBase

        name = "Vietnam HR Policies" if language == "vi" else "Japan HR Policies"
        result = await self.db.execute(
            select(KnowledgeBase).where(KnowledgeBase.language == language, KnowledgeBase.status == "active")
        )
        kb = result.scalar_one_or_none()
        if kb:
            return str(kb.id)

        # Auto-create default KB
        kb = KnowledgeBase(
            id=uuid.uuid4(),
            name=name,
            language=language,
            embed_model=settings.EMBED_MODEL,
            status="active",
        )
        self.db.add(kb)
        await self.db.flush()
        logger.info(f"[IngestService] Auto-created default KB: {name}")
        return str(kb.id)
