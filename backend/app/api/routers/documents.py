from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.repositories.document_repo import DocumentRepository

router = APIRouter(prefix="/api/documents", tags=["documents"])


def _stored_pdf_path(doc_id: str) -> Path:
    root = Path(settings.DOCUMENT_STORAGE_DIR)
    for ext in (".pdf", ".PDF"):
        p = root / f"{doc_id}{ext}"
        if p.is_file():
            return p
    return root / f"{doc_id}.pdf"


@router.get("/{document_id}/file")
async def download_document_file(
    document_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document id")

    repo = DocumentRepository(db)
    doc = await repo.get_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.source_type != "pdf":
        raise HTTPException(status_code=404, detail="No downloadable file for this source type")

    path = _stored_pdf_path(document_id)
    if not path.is_file():
        raise HTTPException(
            status_code=404,
            detail="File not on disk (ingested before file storage was enabled — re-upload PDF)",
        )

    return FileResponse(
        path,
        media_type="application/pdf",
        filename=doc.name if doc.name.lower().endswith(".pdf") else f"{doc.name}.pdf",
    )
