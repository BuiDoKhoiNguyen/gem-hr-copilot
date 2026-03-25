from __future__ import annotations

from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.conversation import Message
from app.repositories.base import BaseRepository


class MessageRepository(BaseRepository[Message]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, Message)

    async def save_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        citations: Optional[list] = None,
        confidence: Optional[float] = None,
        process_steps: Optional[list] = None,
        workflow_id: Optional[str] = None,
        current_step: Optional[int] = None,
        language: Optional[str] = None,
        tokens_used: Optional[int] = None,
        latency_ms: Optional[int] = None,    # NEW: perf tracking
    ) -> Message:
        return await self.create(
            conversation_id=uuid.UUID(conversation_id),
            role=role,
            content=content,
            citations=citations,
            confidence=confidence,
            process_steps=process_steps,
            workflow_id=workflow_id,
            current_step=current_step,
            language=language,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
        )

    async def list_by_conversation(self, conversation_id: str, limit: int = 50) -> List[Message]:
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == uuid.UUID(conversation_id))
            .order_by(Message.created_at)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_recent(self, conversation_id: str, limit: int = 4) -> List[Message]:
        """Get most recent messages (ordered newest first, for query rewrite)."""
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == uuid.UUID(conversation_id))
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
