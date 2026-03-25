from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.chat_service import ChatService
from app.services.ingest_service import IngestService
from app.repositories.kb_repo import KnowledgeBaseRepository


def get_chat_service(db: AsyncSession = Depends(get_db)) -> ChatService:
    return ChatService(db)


def get_ingest_service(db: AsyncSession = Depends(get_db)) -> IngestService:
    return IngestService(db)

def get_kb_repo(db: AsyncSession = Depends(get_db)) -> KnowledgeBaseRepository:
    return KnowledgeBaseRepository(db)
