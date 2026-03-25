from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(5), default="vi", index=True)  # "vi" | "ja" | "all"

    # Model config — allows different KBs to use different embedding models
    embed_model: Mapped[str] = mapped_column(String(128), default="bge-m3")

    # Denormalized counters (RAGFlow pattern: fast count queries without JOIN)
    doc_num: Mapped[int] = mapped_column(Integer, default=0, index=True)
    chunk_num: Mapped[int] = mapped_column(Integer, default=0)
    token_num: Mapped[int] = mapped_column(Integer, default=0)

    # Retrieval tuning defaults (ứng dụng có thể đọc từ đây sau này)
    similarity_threshold: Mapped[float] = mapped_column(Float, default=0.2)
    vector_similarity_weight: Mapped[float] = mapped_column(Float, default=0.3)

    created_by: Mapped[Optional[str]] = mapped_column(String(255))  # user email
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    documents: Mapped[list["Document"]] = relationship(  # type: ignore[name-defined]
        "Document", back_populates="knowledge_base", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<KnowledgeBase name={self.name} lang={self.language}>"
