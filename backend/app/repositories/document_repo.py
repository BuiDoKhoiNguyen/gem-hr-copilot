from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, update as sql_update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.document import Document
from app.db.models.ingest_task import IngestTask
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, Document)

    async def create_document(
        self,
        kb_id: str,
        name: str,
        source_type: str,
        location: Optional[str] = None,
        language: Optional[str] = None,
        size_bytes: int = 0,
        content_hash: Optional[str] = None,
        parser_id: str = "docling",
        created_by: Optional[str] = None,
    ) -> Document:
        return await self.create(
            kb_id=uuid.UUID(kb_id),
            name=name,
            source_type=source_type,
            location=location,
            size_bytes=size_bytes,
            content_hash=content_hash,
            parser_id=parser_id,
            created_by=created_by,
            run="pending",
            progress=0.0,
        )

    async def update_progress(
        self,
        doc_id: str,
        progress: float,
        progress_msg: str = "",
        run: Optional[str] = None,
    ) -> None:
        values: dict = {"progress": progress, "progress_msg": progress_msg}
        if run:
            values["run"] = run
        if run == "running" and progress == 0.0:
            values["process_begin_at"] = datetime.now(timezone.utc)
        stmt = sql_update(Document).where(Document.id == uuid.UUID(doc_id)).values(**values)
        await self.db.execute(stmt)

    async def mark_done(self, doc_id: str, chunk_num: int, token_num: int, duration_s: float) -> None:
        stmt = sql_update(Document).where(Document.id == uuid.UUID(doc_id)).values(
            run="done",
            progress=1.0,
            progress_msg="Ingestion complete",
            chunk_num=chunk_num,
            token_num=token_num,
            process_duration_s=duration_s,
        )
        await self.db.execute(stmt)

    async def mark_failed(self, doc_id: str, error: str) -> None:
        stmt = sql_update(Document).where(Document.id == uuid.UUID(doc_id)).values(
            run="failed",
            progress_msg=error,
        )
        await self.db.execute(stmt)

    async def get_by_id(self, doc_id: str) -> Optional[Document]:
        result = await self.db.execute(
            select(Document).where(
                Document.id == uuid.UUID(doc_id),
                Document.status == "active",
            )
        )
        return result.scalar_one_or_none()

    async def find_by_hash(self, content_hash: str) -> Optional[Document]:
        """Check if document already indexed (dedup by content hash)."""
        from sqlalchemy import select
        result = await self.db.execute(
            select(Document).where(Document.content_hash == content_hash, Document.status == "active")
        )
        return result.scalar_one_or_none()


class IngestTaskRepository(BaseRepository[IngestTask]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, IngestTask)

    async def create_task(
        self,
        document_id: str,
        from_page: int = 0,
        to_page: int = 999999,
        priority: int = 0,
    ) -> IngestTask:
        return await self.create(
            document_id=uuid.UUID(document_id),
            from_page=from_page,
            to_page=to_page,
            priority=priority,
            status="pending",
        )

    async def update_task_status(
        self,
        task_id: str,
        status: str,
        progress: float = 0.0,
        progress_msg: str = "",
        chunk_ids: Optional[list] = None,
        duration_s: float = 0.0,
    ) -> None:
        values: dict = {"status": status, "progress": progress, "progress_msg": progress_msg}
        if chunk_ids is not None:
            values["chunk_ids"] = chunk_ids
        if status == "done":
            values["process_duration_s"] = duration_s
        stmt = sql_update(IngestTask).where(IngestTask.id == uuid.UUID(task_id)).values(**values)
        await self.db.execute(stmt)
