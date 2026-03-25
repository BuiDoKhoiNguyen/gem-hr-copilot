
from __future__ import annotations

import logging
from typing import Optional

from arq import create_pool
from arq.connections import ArqRedis

from app.core.config import settings
from app.worker.tasks import get_redis_settings

logger = logging.getLogger(__name__)

_pool: Optional[ArqRedis] = None


async def get_redis_pool() -> ArqRedis:
    """Get or create Redis connection pool."""
    global _pool
    if _pool is None:
        _pool = await create_pool(get_redis_settings())
    return _pool


async def close_redis_pool() -> None:
    """Close Redis pool on shutdown."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def enqueue_pdf_task(
    task_id: str,
    doc_id: str,
    file_bytes: bytes,
    filename: str,
    language: str,
) -> str:
    """
    Enqueue a PDF processing task to Redis.
    Returns the ARQ job ID.
    """
    pool = await get_redis_pool()
    job = await pool.enqueue_job(
        "process_pdf_task",
        task_id,
        doc_id,
        file_bytes,
        filename,
        language,
        _queue_name="hr_copilot_ingest",
    )
    logger.info(f"[Queue] Enqueued PDF task: {filename} → job_id={job.job_id}")
    return job.job_id


async def get_queue_stats() -> dict:
    """Get queue statistics."""
    pool = await get_redis_pool()
    # ARQ stores jobs in redis keys
    queued = await pool.zcard(b"arq:queue:hr_copilot_ingest")
    return {
        "queued_jobs": queued,
        "queue_name": "hr_copilot_ingest",
    }
