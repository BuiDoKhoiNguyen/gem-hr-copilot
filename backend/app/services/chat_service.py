from __future__ import annotations

import json
from typing import Any, AsyncIterator, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models.conversation import Conversation, Feedback
from app.models.chat import ChatRequest
from app.repositories.session_repo import ConversationRepository
from app.repositories.message_repo import MessageRepository


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _steps_for_db(workflow_event: Optional[dict]) -> Optional[List[dict[str, Any]]]:
    if not workflow_event or not workflow_event.get("steps"):
        return None
    out: List[dict[str, Any]] = []
    for s in workflow_event["steps"]:
        if isinstance(s, dict):
            row = dict(s)
            row.setdefault("completed", False)
            out.append(row)
    return out or None


class ChatService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.session_repo = ConversationRepository(db)
        self.message_repo = MessageRepository(db)

    async def stream(self, request: ChatRequest) -> AsyncIterator[str]:
        """
        Full RAG pipeline yielded as SSE events:
        session → language → workflow → embed → retrieve → rerank → tokens → citations → done
        """
        # 1. Session
        session_id = request.session_id
        if not session_id:
            session = await self.session_repo.create_conversation(title=request.query[:80])
            session_id = str(session.id)

        yield _sse("session", {"session_id": session_id})

        # 2. Save user turn
        await self.message_repo.save_message(conversation_id=session_id, role="user", content=request.query)
        await self.session_repo.increment_message_count(session_id, 1)

        # 3. Language detection
        language = await self._detect_language(request.query, request.language)
        yield _sse("language", {"language": language})

        # 3.5 Query rewrite for follow-up questions
        history_for_rewrite = await self._get_recent_history(session_id)
        rewritten_query = await self._rewrite_query(request.query, history_for_rewrite, language)
        if rewritten_query != request.query:
            yield _sse("query_rewrite", {"original": request.query, "rewritten": rewritten_query})

        # 4. Checklist quy trình (process_guide): always | rag_fallback | off
        guide_mode = settings.PROCESS_GUIDE_MODE
        workflow_event: Optional[dict] = None
        workflow_id: Optional[str] = None
        process_steps_db: Optional[List[dict[str, Any]]] = None

        if guide_mode == "always":
            workflow_event, workflow_id, process_steps_db = await self._workflow_panel_state(
                rewritten_query, language
            )
            if workflow_event:
                yield _sse("process_guide", workflow_event)

        # 5. Embed query (use rewritten for better retrieval)
        query_embedding = await self._embed(rewritten_query)

        # 6. Hybrid retrieve (use rewritten query)
        from app.rag.retriever import hybrid_retrieve, build_corpus_filter

        corpus_filter = build_corpus_filter(
            language,
            rewritten_query,
            search_all_languages=request.search_all_languages
        )
        chunks = await hybrid_retrieve(
            query=rewritten_query,
            query_embedding=query_embedding,
            corpus_filter=corpus_filter,
            top_k=settings.RETRIEVAL_TOP_K,
        )

        if not chunks:
            if guide_mode == "rag_fallback":
                workflow_event, workflow_id, process_steps_db = await self._workflow_panel_state(
                    rewritten_query, language
                )
                if workflow_event:
                    yield _sse("process_guide", workflow_event)
            no_result = (
                "Xin lỗi, tôi không tìm thấy thông tin phù hợp. Vui lòng liên hệ hr@gem-corp.tech."
                if language == "vi"
                else "申し訳ありませんが、関連する情報が見つかりませんでした。hr@gem-corp.techまでお問い合わせください。"
            )
            yield _sse("token", {"token": no_result})
            yield _sse("done", {"citations": [], "confidence": 0.0})
            await self.message_repo.save_message(
                conversation_id=session_id,
                role="assistant",
                content=no_result,
                language=language,
                process_steps=process_steps_db,
                workflow_id=workflow_id,
            )
            await self.session_repo.increment_message_count(session_id, 1)
            return

        # 7. Rerank
        from app.rag.reranker import rerank

        reranked = await rerank(rewritten_query, chunks, top_n=settings.RERANK_TOP_N)

        if not reranked:
            if guide_mode == "rag_fallback":
                workflow_event, workflow_id, process_steps_db = await self._workflow_panel_state(
                    rewritten_query, language
                )
                if workflow_event:
                    yield _sse("process_guide", workflow_event)
            no_result = (
                "Không có đoạn tài liệu nào đủ liên quan (sau khi chấm điểm). Vui lòng hỏi cụ thể hơn hoặc liên hệ hr@gem-corp.tech."
                if language == "vi"
                else "関連する文書が閾値を満たしませんでした。より具体的に質問するか、hr@gem-corp.techへご連絡ください。"
            )
            yield _sse("token", {"token": no_result})
            yield _sse("done", {"citations": [], "confidence": 0.0})
            await self.message_repo.save_message(
                conversation_id=session_id,
                role="assistant",
                content=no_result,
                language=language,
                process_steps=process_steps_db,
                workflow_id=workflow_id,
            )
            await self.session_repo.increment_message_count(session_id, 1)
            return

        # 8. Stream tokens (use original query for natural response)
        from app.rag.generator import generate_stream, build_citations

        full_answer: list[str] = []
        async for token in generate_stream(request.query, reranked, language):
            full_answer.append(token)
            yield _sse("token", {"token": token})

        answer = "".join(full_answer)
        citations = build_citations(reranked)
        scores = [c.get("relevance_score", 0.0) for c in citations[:3]]
        confidence = round(sum(scores) / len(scores), 3) if scores else 0.0

        yield _sse("citations", {"citations": citations})
        yield _sse("done", {"confidence": confidence, "language": language})

        # 9. Persist assistant message
        msg = await self.message_repo.save_message(
            conversation_id=session_id,
            role="assistant",
            content=answer,
            citations=citations,
            confidence=confidence,
            workflow_id=workflow_id,
            language=language,
            process_steps=process_steps_db,
        )
        await self.session_repo.increment_message_count(session_id, 1)
        yield _sse("message_id", {"message_id": str(msg.id)})

    async def get_messages(self, session_id: str) -> list:
        return await self.message_repo.list_by_conversation(session_id)

    async def list_conversations(self, limit: int = 50) -> List[Conversation]:
        return await self.session_repo.list_recent(limit=limit)

    async def update_conversation_title(self, session_id: str, title: str) -> Optional[Conversation]:
        return await self.session_repo.update(session_id, title=title[:200])

    async def delete_conversation(self, session_id: str) -> bool:
        return await self.session_repo.delete(session_id)

    # ─── Feedback methods ───────────────────────────────────────────────────────

    async def save_feedback(
        self,
        message_id: str,
        session_id: str,
        rating: int,
        reason: Optional[str] = None,
        additional_comment: Optional[str] = None,
    ) -> Optional[Feedback]:
        """Save user feedback on an assistant message."""
        import uuid as uuid_module

        try:
            feedback = Feedback(
                message_id=uuid_module.UUID(message_id),
                conversation_id=uuid_module.UUID(session_id),
                rating=rating,
                reason=reason,
                additional_comment=additional_comment,
            )
            self.db.add(feedback)
            await self.db.commit()
            await self.db.refresh(feedback)
            return feedback
        except Exception:
            await self.db.rollback()
            return None

    async def get_feedback_stats(self) -> dict:
        """
        Get feedback statistics for measuring HR deflection rate.
        Deflection = questions answered satisfactorily by the bot instead of HR.
        """
        from sqlalchemy import select, func

        try:
            total_query = select(func.count(Feedback.id))
            total_result = await self.db.execute(total_query)
            total_count = total_result.scalar() or 0

            positive_query = select(func.count(Feedback.id)).where(Feedback.rating == 1)
            positive_result = await self.db.execute(positive_query)
            positive_count = positive_result.scalar() or 0

            negative_query = select(func.count(Feedback.id)).where(Feedback.rating == -1)
            negative_result = await self.db.execute(negative_query)
            negative_count = negative_result.scalar() or 0

            neutral_count = total_count - positive_count - negative_count

            deflection_rate = (positive_count / total_count * 100) if total_count > 0 else 0.0

            return {
                "total_feedbacks": total_count,
                "positive": positive_count,
                "negative": negative_count,
                "neutral": neutral_count,
                "deflection_rate": round(deflection_rate, 2),
                "description": "Deflection rate = % of questions answered satisfactorily (positive feedback)",
            }
        except Exception:
            return {
                "total_feedbacks": 0,
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "deflection_rate": 0.0,
                "error": "Could not retrieve feedback stats",
            }

    # ─── Private helpers ─────────────────────────────────────────────────────

    async def _detect_language(self, query: str, override: Optional[str]) -> str:
        if override:
            return override
        try:
            from langdetect import detect

            detected = detect(query)
            return "ja" if detected == "ja" else "vi"
        except Exception:
            return "vi"

    async def _check_workflow(self, query: str, language: str) -> Optional[dict]:
        from app.workflows.hr_processes import detect_workflow_intent_hybrid, get_workflow

        workflow_id = await detect_workflow_intent_hybrid(query, use_llm=True)
        if not workflow_id:
            return None
        workflow = get_workflow(workflow_id, language)
        if not workflow:
            return None
        return {
            "workflow_id": workflow_id,
            "title": workflow["title"],
            "steps": workflow["steps"],
            "policy_url": workflow.get("policy_url", ""),
            "contact": workflow.get("contact", ""),
        }

    async def _workflow_panel_state(
        self, query: str, language: str
    ) -> tuple[Optional[dict], Optional[str], Optional[List[dict[str, Any]]]]:
        ev = await self._check_workflow(query, language)
        if not ev:
            return None, None, None
        return ev, ev.get("workflow_id"), _steps_for_db(ev)

    async def _embed(self, text: str) -> list:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(base_url=settings.EMBED_BASE_URL, api_key=settings.LLM_API_KEY)
        resp = await client.embeddings.create(model=settings.EMBED_MODEL, input=[text])
        return resp.data[0].embedding

    async def _get_recent_history(self, session_id: str, limit: int = 4) -> List[dict]:
        """Get recent conversation history for query rewrite."""
        try:
            messages = await self.message_repo.list_recent(session_id, limit=limit)
            return [
                {"role": msg.role, "content": msg.content}
                for msg in reversed(messages)
            ]
        except Exception:
            return []

    async def _rewrite_query(
        self, query: str, history: List[dict], language: str
    ) -> str:
        """Rewrite follow-up query using conversation context."""
        try:
            from app.rag.query_rewrite import rewrite_query
            return await rewrite_query(query, history, language)
        except Exception:
            return query
