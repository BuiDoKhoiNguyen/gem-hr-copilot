from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.document import Document
from app.repositories.base import BaseRepository


class KnowledgeBaseRepository(BaseRepository[KnowledgeBase]):
    def __init__(self, db: AsyncSession):
        super().__init__(model=KnowledgeBase, db=db)

    async def get_by_id(self, kb_id: str | UUID) -> Optional[KnowledgeBase]:
        result = await self.db.execute(select(KnowledgeBase).where(KnowledgeBase.id == kb_id, KnowledgeBase.status == "active"))
        return result.scalar_one_or_none()

    async def list_active(self) -> List[KnowledgeBase]:
        result = await self.db.execute(select(KnowledgeBase).where(KnowledgeBase.status == "active").order_by(KnowledgeBase.created_at.desc()))
        return list(result.scalars().all())

    async def create(self, name: str, language: str, embed_model: str, description: Optional[str] = None) -> KnowledgeBase:
        kb = KnowledgeBase(
            name=name,
            language=language,
            embed_model=embed_model,
            description=description,
            status="active"
        )
        self.db.add(kb)
        await self.db.flush()
        return kb

    async def delete_soft(self, kb_id: str | UUID) -> bool:
        kb = await self.get_by_id(kb_id)
        if kb:
            kb.status = "deleted"
            # Soft delete associated docs
            docs = await self.db.execute(select(Document).where(Document.kb_id == kb_id, Document.status == "active"))
            for doc in docs.scalars().all():
                doc.status = "deleted"
            return True
        return False

    async def list_documents(self, kb_id: str | UUID) -> List[Document]:
        result = await self.db.execute(
            select(Document).where(Document.kb_id == kb_id, Document.status == "active").order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())
