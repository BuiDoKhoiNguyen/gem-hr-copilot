"""
ORM models — chỉ giữ phần RAG + hội thoại + ingest đang dùng.

Import thứ tự: base → knowledge → document/task → conversation.
"""
from app.db.models.knowledge_base import KnowledgeBase
from app.db.models.document import Document
from app.db.models.ingest_task import IngestTask
from app.db.models.conversation import Conversation, Message, Feedback

__all__ = [
    "KnowledgeBase",
    "Document",
    "IngestTask",
    "Conversation",
    "Message",
    "Feedback",
]
