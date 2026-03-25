from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID

from app.core.dependencies import get_kb_repo
from app.repositories.kb_repo import KnowledgeBaseRepository

router = APIRouter(prefix="/api/kb", tags=["knowledge-base"])

class KBCreate(BaseModel):
    name: str
    language: str = "vi"
    embed_model: str
    description: Optional[str] = None

@router.post("/")
async def create_kb(request: KBCreate, repo: KnowledgeBaseRepository = Depends(get_kb_repo)):
    kb = await repo.create(**request.model_dump())
    await repo.db.commit()
    return kb

@router.get("/")
async def list_kbs(repo: KnowledgeBaseRepository = Depends(get_kb_repo)):
    return await repo.list_active()

@router.delete("/{kb_id}")
async def delete_kb(kb_id: UUID, repo: KnowledgeBaseRepository = Depends(get_kb_repo)):
    success = await repo.delete_soft(kb_id)
    if not success:
        raise HTTPException(status_code=404, detail="KB not found")
    await repo.db.commit()
    return {"status": "deleted", "kb_id": str(kb_id)}

@router.get("/{kb_id}/documents")
async def list_documents(kb_id: UUID, repo: KnowledgeBaseRepository = Depends(get_kb_repo)):
    # Returns docs directly; they'll be serialized to JSON automatically.
    return await repo.list_documents(kb_id)
