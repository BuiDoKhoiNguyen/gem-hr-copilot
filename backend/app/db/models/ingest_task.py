from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class IngestTask(Base):
    __tablename__ = "ingest_tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id"), index=True, nullable=False
    )  # FK → documents.id

    # Page range splitting (RAGFlow pattern: large PDFs split across workers)
    from_page: Mapped[int] = mapped_column(Integer, default=0)
    to_page: Mapped[int] = mapped_column(Integer, default=999999)

    # Queue management
    priority: Mapped[int] = mapped_column(Integer, default=0, index=True)  # Higher = sooner

    # Execution tracking
    begin_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), index=True)
    process_duration_s: Mapped[float] = mapped_column(Float, default=0.0)
    progress: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    progress_msg: Mapped[str] = mapped_column(Text, default="")
    retry_count: Mapped[int] = mapped_column(Integer, default=0)

    # Results
    chunk_ids: Mapped[Optional[list]] = mapped_column(
        JSONB, default=list
    )  # ES chunk IDs → used for cleanup on reindex

    status: Mapped[str] = mapped_column(
        String(20), default="pending", index=True
    )  # "pending"|"running"|"done"|"failed"
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    document: Mapped["Document"] = relationship("Document", back_populates="ingest_tasks")  # type: ignore[name-defined]

    def __repr__(self) -> str:
        return f"<IngestTask doc={self.document_id} status={self.status} retry={self.retry_count}>"
