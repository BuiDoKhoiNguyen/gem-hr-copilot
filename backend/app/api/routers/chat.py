from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_chat_service, get_db
from app.models.chat import (
    ChatRequest, MessageResponse, SessionResponse, SessionUpdate,
    FeedbackRequest, FeedbackResponse
)
from app.services.chat_service import ChatService
from app.db.models.conversation import Feedback

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions(
    limit: int = Query(50, ge=1, le=200),
    service: ChatService = Depends(get_chat_service),
):
    """Danh sách conversation gần đây (đồng bộ với frontend / thiết bị khác)."""
    rows = await service.list_conversations(limit=limit)
    return [
        SessionResponse(
            session_id=str(c.id),
            title=c.title,
            message_count=c.message_count,
            created_at=c.created_at.isoformat(),
            updated_at=c.updated_at.isoformat(),
        )
        for c in rows
    ]


@router.patch("/sessions/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    body: SessionUpdate,
    service: ChatService = Depends(get_chat_service),
):
    updated = await service.update_conversation_title(session_id, body.title)
    if not updated:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return SessionResponse(
        session_id=str(updated.id),
        title=updated.title,
        message_count=updated.message_count,
        created_at=updated.created_at.isoformat(),
        updated_at=updated.updated_at.isoformat(),
    )


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    service: ChatService = Depends(get_chat_service),
):
    ok = await service.delete_conversation(session_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "deleted", "session_id": session_id}


@router.post("/")
async def chat(
    request: ChatRequest,
    service: ChatService = Depends(get_chat_service),
):
    """SSE streaming chat endpoint."""
    return StreamingResponse(
        service.stream(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    service: ChatService = Depends(get_chat_service),
):
    messages = await service.get_messages(session_id)
    return {
        "messages": [
            MessageResponse(
                message_id=str(m.id),
                role=m.role,
                content=m.content,
                citations=m.citations or [],
                confidence=m.confidence,
                created_at=m.created_at.isoformat(),
                process_steps=m.process_steps or None,
            )
            for m in messages
        ]
    }


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    request: FeedbackRequest,
    service: ChatService = Depends(get_chat_service),
):
    """
    Submit user feedback on an assistant message.
    Used for measuring HR deflection rate and improving responses.

    Rating scale:
    - -1: thumbs down (not helpful)
    - 0: neutral
    - 1: thumbs up (helpful)
    """
    feedback = await service.save_feedback(
        message_id=request.message_id,
        session_id=request.session_id,
        rating=request.rating,
        reason=request.reason,
        additional_comment=request.additional_comment,
    )
    if not feedback:
        raise HTTPException(status_code=404, detail="Message not found")

    return FeedbackResponse(
        feedback_id=str(feedback.id),
        message_id=str(feedback.message_id),
        rating=feedback.rating,
        created_at=feedback.created_at.isoformat(),
    )


@router.get("/feedback/stats")
async def get_feedback_stats(
    service: ChatService = Depends(get_chat_service),
):
    """
    Get feedback statistics for measuring HR deflection rate.
    """
    stats = await service.get_feedback_stats()
    return stats
