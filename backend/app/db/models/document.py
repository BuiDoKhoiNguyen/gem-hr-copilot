from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kb_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("knowledge_bases.id"), index=True, nullable=False
    )  # FK → knowledge_bases.id (set by KnowledgeBase relationship)

    # Source identification
    name: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(
        String(32), nullable=False, index=True
    )  # "pdf" | "confluence" | "docx" | "url"
    location: Mapped[Optional[str]] = mapped_column(String(1000))  # S3 path / Confluence URL

    # File metadata
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    content_hash: Mapped[Optional[str]] = mapped_column(
        String(64), index=True
    )  # xxhash128 — skip re-index if hash unchanged

    # Parser config
    parser_id: Mapped[str] = mapped_column(
        String(32), default="docling", index=True
    )  # "docling" | "pdfplumber" | "html"

    # Processing results
    chunk_num: Mapped[int] = mapped_column(Integer, default=0, index=True)
    token_num: Mapped[int] = mapped_column(Integer, default=0)

    # Processing state machine (RAGFlow pattern)
    progress: Mapped[float] = mapped_column(
        Float, default=0.0, index=True
    )  # 0.0→1.0 → frontend progress bar
    progress_msg: Mapped[str] = mapped_column(Text, default="")
    run: Mapped[str] = mapped_column(
        String(20), default="pending", index=True
    )  # "pending"|"running"|"done"|"cancel"|"failed"
    process_begin_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    process_duration_s: Mapped[float] = mapped_column(Float, default=0.0)

    created_by: Mapped[Optional[str]] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)  # "active"|"deleted"
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    knowledge_base: Mapped["KnowledgeBase"] = relationship("KnowledgeBase", back_populates="documents")  # type: ignore[name-defined]
    ingest_tasks: Mapped[list["IngestTask"]] = relationship(  # type: ignore[name-defined]
        "IngestTask", back_populates="document", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Document name={self.name} run={self.run} progress={self.progress:.0%}>"
