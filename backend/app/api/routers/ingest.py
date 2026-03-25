from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from typing import List, Optional

from app.core.config import settings
from app.core.dependencies import get_ingest_service
from app.models.ingest import IngestStatusResponse, BatchIngestResponse, BatchFileStatus
from app.services.ingest_service import IngestService

router = APIRouter(prefix="/api/ingest", tags=["ingest"])


# ─── Request schemas ──────────────────────────────────────────────────────────

class ConfluenceSyncRequest(BaseModel):
    space_key: str
    language: str = "vi"
    kb_id: Optional[str] = None


class URLIngestRequest(BaseModel):
    url: str
    language: str = "vi"
    kb_id: Optional[str] = None


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/pdf", response_model=IngestStatusResponse)
async def ingest_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: str = Form("vi"),
    kb_id: Optional[str] = Form(None),
    service: IngestService = Depends(get_ingest_service),
):
    """Upload a PDF file and start ingestion pipeline in background."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    file_bytes = await file.read()
    if len(file_bytes) > 50 * 1024 * 1024:  # 50 MB limit
        raise HTTPException(status_code=400, detail="File too large (max 50 MB)")

    task_id, doc_id = await service.start_pdf_ingest(
        file_bytes=file_bytes,
        filename=file.filename,
        language=language,
        kb_id=kb_id,
    )

    background_tasks.add_task(
        IngestService.run_pdf_pipeline,
        task_id, doc_id, file_bytes, file.filename, language, settings.DATABASE_URL,
    )

    return IngestStatusResponse(
        job_id=task_id,
        status="pending",
        progress=0.0,
        message="PDF ingestion queued",
        chunk_count=0,
    )


@router.post("/pdf/batch", response_model=BatchIngestResponse)
async def ingest_pdf_batch(
    files: List[UploadFile] = File(...),
    language: str = Form("vi"),
    kb_id: Optional[str] = Form(None),
    service: IngestService = Depends(get_ingest_service),
):
    """
    Upload multiple PDF files and queue them for processing via Redis.
    Files are processed in parallel by worker processes.
    """
    from app.worker.queue import enqueue_pdf_task

    results: List[BatchFileStatus] = []
    queued = 0
    skipped = 0

    for file in files:
        filename = file.filename or "unknown.pdf"

        # Validate file
        if not filename.lower().endswith(".pdf"):
            results.append(BatchFileStatus(
                filename=filename,
                job_id="",
                status="skipped",
                message="Not a PDF file",
            ))
            skipped += 1
            continue

        file_bytes = await file.read()

        if len(file_bytes) > 50 * 1024 * 1024:
            results.append(BatchFileStatus(
                filename=filename,
                job_id="",
                status="skipped",
                message="File too large (max 50 MB)",
            ))
            skipped += 1
            continue

        # Register in DB
        task_id, doc_id = await service.start_pdf_ingest(
            file_bytes=file_bytes,
            filename=filename,
            language=language,
            kb_id=kb_id,
        )

        # Enqueue to Redis
        try:
            await enqueue_pdf_task(
                task_id=task_id,
                doc_id=doc_id,
                file_bytes=file_bytes,
                filename=filename,
                language=language,
            )
            results.append(BatchFileStatus(
                filename=filename,
                job_id=task_id,
                status="queued",
                message="Queued for processing",
            ))
            queued += 1
        except Exception as e:
            results.append(BatchFileStatus(
                filename=filename,
                job_id=task_id,
                status="failed",
                message=f"Failed to queue: {str(e)}",
            ))

    return BatchIngestResponse(
        total_files=len(files),
        queued=queued,
        skipped=skipped,
        files=results,
    )


@router.get("/queue/stats")
async def queue_stats():
    """Get Redis queue statistics."""
    try:
        from app.worker.queue import get_queue_stats
        stats = await get_queue_stats()
        return stats
    except Exception as e:
        return {"error": str(e), "queued_jobs": 0}


@router.post("/confluence", response_model=IngestStatusResponse)
async def sync_confluence(
    body: ConfluenceSyncRequest,
    background_tasks: BackgroundTasks,
    service: IngestService = Depends(get_ingest_service),
):
    """Trigger a full sync of a Confluence space."""
    if not settings.CONFLUENCE_URL:
        raise HTTPException(status_code=503, detail="Confluence not configured. Set CONFLUENCE_URL in .env")
    if not settings.CONFLUENCE_USER.strip():
        raise HTTPException(status_code=503, detail="Set CONFLUENCE_USER in .env")
    if not (settings.CONFLUENCE_TOKEN.strip() or settings.CONFLUENCE_PASSWORD.strip()):
        raise HTTPException(
            status_code=503,
            detail="Set CONFLUENCE_TOKEN (Cloud token / Server PAT) hoặc CONFLUENCE_PASSWORD (Server)",
        )

    task_id, doc_id = await service.start_confluence_sync(
        space_key=body.space_key,
        language=body.language,
        kb_id=body.kb_id,
    )

    background_tasks.add_task(
        IngestService.run_confluence_pipeline,
        task_id,
        doc_id,
        body.space_key,
        body.language,
        settings.DATABASE_URL,
    )

    return IngestStatusResponse(
        job_id=task_id,
        status="pending",
        progress=0.0,
        message=f"Confluence sync queued for space: {body.space_key}",
        chunk_count=0,
    )


@router.post("/url", response_model=IngestStatusResponse)
async def ingest_url(
    body: URLIngestRequest,
    background_tasks: BackgroundTasks,
    service: IngestService = Depends(get_ingest_service),
):
    """Crawl a URL and ingest its content."""
    task_id = await service.start_url_ingest(
        url=body.url,
        language=body.language,
        kb_id=body.kb_id,
    )

    background_tasks.add_task(
        _run_url_pipeline,
        task_id, body.url, body.language, settings.DATABASE_URL,
    )

    return IngestStatusResponse(
        job_id=task_id,
        status="pending",
        progress=0.0,
        message=f"URL ingestion queued: {body.url}",
        chunk_count=0,
    )


@router.get("/status/{job_id}", response_model=IngestStatusResponse)
async def ingest_status(
    job_id: str,
    service: IngestService = Depends(get_ingest_service),
):
    """Poll ingestion progress from DB."""
    job = await service.get_job_status(job_id)
    if job["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Job not found")
    return IngestStatusResponse(
        job_id=job_id,
        status=job["status"],
        progress=job.get("progress", 0.0),
        message=job.get("message", ""),
        chunk_count=job.get("chunk_count", 0),
    )


@router.get("/stats")
async def ingest_stats():
    """ES index statistics."""
    from app.rag.retriever import get_es_client
    es = get_es_client()
    try:
        count = await es.count(index=settings.ES_INDEX)
        return {
            "total_chunks": count["count"],
            "index": settings.ES_INDEX,
        }
    except Exception:
        return {"total_chunks": 0, "index": settings.ES_INDEX, "error": "ES not reachable"}


# ─── URL background task ──────────────────────────────────────────────────────

async def _run_url_pipeline(task_id: str, url: str, language: str, db_url: str) -> None:
    """URL crawl pipeline — runs as background task."""
    import time
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    from app.repositories.document_repo import DocumentRepository, IngestTaskRepository

    engine = create_async_engine(db_url)
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with SessionLocal() as db:
        task_repo = IngestTaskRepository(db)
        # Find doc_id from task
        from sqlalchemy import select
        from app.db.models.ingest_task import IngestTask
        result = await db.execute(select(IngestTask).where(IngestTask.id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            return
        doc_id = str(task.document_id)
        doc_repo = DocumentRepository(db)

        try:
            from app.ingestion.url_crawler import URLLoader
            loader = URLLoader(url=url, language=language)
            sections = await loader.load()

            from app.ingestion.chunker import chunk_sections_from_loader
            chunks = chunk_sections_from_loader(sections, url, url, language, "url")

            from app.ingestion.embedder import embed_chunks
            chunks_with_vectors = await embed_chunks(chunks)

            from app.rag.retriever import ensure_index, bulk_index_chunks
            await ensure_index()
            chunk_ids = await bulk_index_chunks(chunks_with_vectors, kb_id=None, doc_id=doc_id)

            await task_repo.update_task_status(task_id, "done", 1.0, f"Done: {len(chunks)} chunks", chunk_ids=chunk_ids)
            await doc_repo.mark_done(doc_id, chunk_num=len(chunks), token_num=0, duration_s=0)
            await db.commit()
        except Exception as e:
            await task_repo.update_task_status(task_id, "failed", progress_msg=str(e))
            await doc_repo.mark_failed(doc_id, error=str(e))
            await db.commit()

    await engine.dispose()
