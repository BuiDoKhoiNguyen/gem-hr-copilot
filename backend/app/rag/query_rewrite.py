from __future__ import annotations

from typing import List, Optional
from openai import AsyncOpenAI

from app.core.config import settings


REWRITE_PROMPT_VI = """Bạn là một chuyên gia chuyển đổi câu hỏi trong hệ thống HR Copilot.

Nhiệm vụ: Viết lại câu hỏi của người dùng thành một câu hỏi độc lập, rõ ràng, có thể tìm kiếm được mà không cần ngữ cảnh hội thoại.

Quy tắc:
- Nếu câu hỏi đã rõ ràng và độc lập, giữ nguyên
- Nếu câu hỏi có đại từ chỉ định (nó, đó, này, ở trên...), thay thế bằng thực thể cụ thể từ lịch sử
- Giữ nguyên ý định và ngôn ngữ của người dùng
- KHÔNG thêm thông tin không có trong câu hỏi gốc
- Chỉ trả về câu hỏi đã viết lại, không giải thích

Ví dụ:
- Lịch sử: "Nhân viên có bao nhiêu ngày nghỉ phép?" -> "12 ngày/năm"
- Câu hỏi mới: "Còn với nhân viên thử việc thì sao?"
- Viết lại: "Nhân viên thử việc có bao nhiêu ngày nghỉ phép năm?"
"""

REWRITE_PROMPT_JA = """あなたはHR Copilotシステムの質問変換の専門家です。

タスク：ユーザーの質問を、会話の文脈がなくても検索可能な独立した明確な質問に書き換えてください。

ルール：
- 質問がすでに明確で独立している場合は、そのまま維持
- 指示代名詞（それ、これ、上記...）がある場合は、履歴から具体的なエンティティに置き換え
- ユーザーの意図と言語を維持
- 元の質問にない情報を追加しない
- 書き換えた質問のみを返し、説明は不要

例：
- 履歴：「社員は何日の有給休暇がありますか？」→「年間12日」
- 新しい質問：「試用期間中の社員はどうですか？」
- 書き換え：「試用期間中の社員は何日の有給休暇がありますか？」
"""


async def rewrite_query(
    query: str,
    history: Optional[List[dict]] = None,
    language: str = "vi",
) -> str:
    """
    Rewrite a follow-up query into a standalone question using conversation history.

    Args:
        query: Current user query
        history: List of previous messages [{role: str, content: str}]
        language: "vi" or "ja"

    Returns:
        Rewritten standalone query
    """
    if not history or len(history) < 2:
        return query

    needs_rewrite = _needs_rewrite(query, language)
    if not needs_rewrite:
        return query

    try:
        from app.rag.generator import get_llm_client
        client = get_llm_client()

        system_prompt = REWRITE_PROMPT_VI if language == "vi" else REWRITE_PROMPT_JA

        history_text = _format_history(history[-4:], language)

        user_content = (
            f"Lịch sử hội thoại:\n{history_text}\n\nCâu hỏi mới cần viết lại: {query}"
            if language == "vi"
            else f"会話履歴:\n{history_text}\n\n書き換える新しい質問: {query}"
        )

        response = await client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.0,
            max_tokens=256,
        )

        rewritten = response.choices[0].message.content.strip()

        if not rewritten or len(rewritten) < 3:
            return query

        return rewritten

    except Exception:
        return query


def _needs_rewrite(query: str, language: str) -> bool:
    """Check if query contains pronouns or references that need context."""
    anaphoric_indicators_vi = [
        "nó", "đó", "này", "trên", "dưới", "vậy", "thế",
        "còn", "thêm", "tiếp", "chi tiết hơn", "ở đâu",
    ]
    anaphoric_indicators_ja = [
        "それ", "これ", "その", "あの", "どう", "何",
        "また", "さらに", "もっと", "詳しく",
    ]

    indicators = anaphoric_indicators_vi if language == "vi" else anaphoric_indicators_ja
    query_lower = query.lower()

    if len(query.split()) <= 3:
        return True

    return any(ind in query_lower for ind in indicators)


def _format_history(history: List[dict], language: str) -> str:
    """Format conversation history for the rewrite prompt."""
    lines = []
    for msg in history:
        role = msg.get("role", "")
        content = msg.get("content", "")

        if language == "vi":
            role_name = "Người dùng" if role == "user" else "Trợ lý"
        else:
            role_name = "ユーザー" if role == "user" else "アシスタント"

        content_preview = content[:300] + "..." if len(content) > 300 else content
        lines.append(f"{role_name}: {content_preview}")

    return "\n".join(lines)
