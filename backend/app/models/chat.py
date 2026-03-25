"""Chat domain Pydantic schemas."""
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class Citation(BaseModel):
    """Citation từ RAG; id trong JSONB có thể là int hoặc str."""
    id: int | str = 0
    title: str = ""
    url: str = ""
    excerpt: str = ""
    page_number: Optional[int] = None
    source_type: str = "pdf"
    relevance_score: float = 0.0


class ProcessStep(BaseModel):
    step: int
    action: str
    url: Optional[str] = None
    note: Optional[str] = None
    completed: bool = False


class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    language: Optional[str] = None  # Auto-detect if None
    search_all_languages: bool = Field(
        default=False,
        description="If True, search both VI and JA knowledge bases simultaneously"
    )


class ChatResponse(BaseModel):
    session_id: str
    message_id: str
    answer: str
    citations: List[Citation] = []
    confidence: float
    language: str
    intent: str     # "question" | "process_guide" | "policy_search"
    process_steps: Optional[List[ProcessStep]] = None
    workflow_id: Optional[str] = None
    current_step: Optional[int] = None


class SessionResponse(BaseModel):
    session_id: str
    title: Optional[str]
    message_count: int
    created_at: str
    updated_at: str


class SessionUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)


class MessageResponse(BaseModel):
    message_id: str
    role: str
    content: str
    citations: List[Any] = []
    confidence: Optional[float] = None
    created_at: str
    process_steps: Optional[List[Any]] = None


class FeedbackRequest(BaseModel):
    """User feedback on an assistant message."""
    message_id: str
    session_id: str
    rating: int = Field(..., ge=-1, le=1, description="-1=thumbs down, 0=neutral, 1=thumbs up")
    reason: Optional[str] = Field(None, max_length=500, description="Why the user gave this rating")
    additional_comment: Optional[str] = Field(None, max_length=2000)


class FeedbackResponse(BaseModel):
    """Response after submitting feedback."""
    feedback_id: str
    message_id: str
    rating: int
    created_at: str
