from __future__ import annotations

from typing import List, Optional
import uuid
from sqlalchemy import select, update as sql_update
from sqlalchemy.sql import func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.conversation import Conversation
from app.repositories.base import BaseRepository


class ConversationRepository(BaseRepository[Conversation]):
    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db, Conversation)

    async def create_conversation(
        self,
        title: Optional[str] = None,
    ) -> Conversation:
        return await self.create(title=title)

    async def get_with_messages(self, conversation_id: str) -> Optional[Conversation]:
        """Eager-load messages alongside the conversation."""
        result = await self.db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.id == uuid.UUID(conversation_id))
        )
        return result.scalar_one_or_none()

    async def list_recent(
        self,
        limit: int = 50,
    ) -> List[Conversation]:
        """Recent conversations, newest first."""
        stmt = select(Conversation).order_by(Conversation.updated_at.desc()).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def increment_message_count(self, conversation_id: str, delta: int = 1) -> None:
        await self.db.execute(
            sql_update(Conversation)
            .where(Conversation.id == uuid.UUID(conversation_id))
            .values(
                message_count=Conversation.message_count + delta,
                updated_at=func.now(),
            )
        )

    async def increment_counters(self, conversation_id: str, tokens: int = 0) -> None:
        """Update message_count and total_tokens after each assistant message."""
        stmt = (
            sql_update(Conversation)
            .where(Conversation.id == uuid.UUID(conversation_id))
            .values(
                message_count=Conversation.message_count + 1,
                total_tokens=Conversation.total_tokens + tokens,
            )
        )
        await self.db.execute(stmt)
