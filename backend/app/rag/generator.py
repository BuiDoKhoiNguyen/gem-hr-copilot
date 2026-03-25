
from __future__ import annotations

from typing import List, AsyncIterator, Tuple
from openai import AsyncOpenAI

from app.core.config import settings


_client: AsyncOpenAI | None = None


def _llm_base_url_and_api_key() -> Tuple[str, str]:
    if settings.LLM_BACKEND == "huggingface":
        base = settings.HF_INFERENCE_BASE_URL.rstrip("/")
        key = (settings.HF_TOKEN or "").strip()
        if not key and settings.LLM_API_KEY not in ("", "not-needed"):
            key = settings.LLM_API_KEY.strip()
        return base, key
    base = settings.LLM_BASE_URL.rstrip("/")
    return base, settings.LLM_API_KEY


def get_llm_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        base_url, api_key = _llm_base_url_and_api_key()
        if settings.LLM_BACKEND == "huggingface" and not api_key:
            raise RuntimeError(
                "LLM_BACKEND=huggingface cần HF_TOKEN (hoặc LLM_API_KEY) trong môi trường / .env"
            )
        if not api_key:
            api_key = "not-needed"
        _client = AsyncOpenAI(base_url=base_url, api_key=api_key)
    return _client


SYSTEM_PROMPT = {
    "vi": """Bạn là GEM HR Copilot Pro — trợ lý AI chuyên về chính sách nhân sự công ty GEM.

NGUYÊN TẮC:
- Chỉ trả lời dựa trên TÀI LIỆU THAM KHẢO được cung cấp bên dưới
- Nếu không tìm thấy thông tin trong tài liệu, hãy nói rõ: "Tôi không tìm thấy thông tin này trong tài liệu HR hiện có"
- Đặt trích dẫn [số] ở cuối câu chứa thông tin lấy từ tài liệu (trước dấu chấm/câu hỏi), không nhồi bullet chỉ để liệt kê từng ý nhỏ
- Ưu tiên 1–2 đoạn văn mở đầu trả lời trực tiếp câu hỏi; chỉ dùng bullet khi thật sự là danh sách bước/checklist nhiều mục độc lập — tránh mở đầu bằng 5–10 dòng "- ..."
- Viết hoàn toàn bằng tiếng Việt (trừ tên riêng/brand). KHÔNG thêm câu tiếng Anh meta ("Need info...", "Provide bullet...")
- KHÔNG lặp khối **Nguồn:** ở cuối — giao diện đã hiển thị danh sách nguồn riêng; chỉ dùng [1], [2] trong nội dung
- Nếu tài liệu không khớp chủ đề câu hỏi, không bịa hoặc ghép nội dung — nói rõ không tìm thấy trong tài liệu đã cung cấp

ĐỊNH DẠNG (theo tinh thần RAGFlow: văn xuôi trước, bullet chỉ khi cần):
- Bắt đầu bằng câu trả lời tổng quan; ghép các ý liên quan thành câu/đoạn thay vì tách mỗi ý một dòng gạch đầu dòng""",

    "ja": """あなたはGEM HR Copilot Proです。GEM社の人事政策に特化したAIアシスタントです。

原則:
- 提供された参考資料のみに基づいて回答してください
- 資料に情報が見つからない場合は、「現在のHR文書にこの情報が見つかりません」と明記してください
- 引用[番号]は、その文の末尾（句読点の直前）に付ける。細かい事実ごとに箇条書きばかりにしない
- まず1〜2段落で質問に直接答える。箇条書きは手順・チェックリストなど本当に列挙が適切なときだけ。冒頭を「-」の連続で始めない
- 日本語で回答し、英語のメタ説明は出力しない
- 文末に出典一覧を繰り返さない（UIに別途表示）。本文中の[1][2]のみ
- 参考資料が質問と無関係な場合は無理に結びつけず「資料に見つからない」と答える""",

    "en": """You are GEM HR Copilot Pro, an AI assistant specialized in GEM company HR policies.
Answer ONLY from the provided reference documents. Put [n] citations at the end of sentences (before punctuation).
Prefer 1–2 short paragraphs first; use bullet lists only for true step/checklists, not for every fact. Do not open with many "- ..." lines.""",
}


def build_context(chunks: List[dict]) -> str:
    """Format retrieved chunks as numbered context for the LLM."""
    lines = []
    for i, chunk in enumerate(chunks, 1):
        header = chunk.get("section_header", "")
        title = chunk.get("source_title", "")
        page = chunk.get("page_number")
        page_str = f" — Trang {page}" if page else ""
        lines.append(f"[{i}] {title}{page_str}" + (f" ({header})" if header else ""))
        lines.append(chunk["content"])
        lines.append("")
    return "\n".join(lines)


def _citation_url(chunk: dict) -> str:
    """Link mở được trên trình duyệt: PDF đã lưu disk → API download."""
    doc_id = chunk.get("document_id")
    st = (chunk.get("source_type") or "").lower()
    if doc_id and st == "pdf":
        base = settings.PUBLIC_API_BASE.rstrip("/")
        return f"{base}/api/documents/{doc_id}/file"
    u = chunk.get("source_url") or ""
    if u.startswith("local://"):
        return ""
    return u


def build_citations(chunks: List[dict]) -> List[dict]:
    """Convert chunks to citation objects for API response."""
    return [
        {
            "id": i,
            "title": chunk.get("source_title", ""),
            "url": _citation_url(chunk),
            "excerpt": chunk["content"][:200] + "..." if len(chunk["content"]) > 200 else chunk["content"],
            "page_number": chunk.get("page_number"),
            "source_type": chunk.get("source_type", ""),
            "relevance_score": round(chunk.get("rerank_score", chunk.get("score", 0.0)), 3),
        }
        for i, chunk in enumerate(chunks, 1)
    ]


async def generate_stream(
    query: str,
    chunks: List[dict],
    language: str = "vi",
    history: List[dict] | None = None,
) -> AsyncIterator[str]:
    """Stream LLM response tokens."""
    client = get_llm_client()
    context = build_context(chunks)
    system = SYSTEM_PROMPT.get(language, SYSTEM_PROMPT["vi"])

    messages = [
        {"role": "system", "content": system},
    ]
    # Add recent conversation history (last 6 turns)
    if history:
        messages.extend(history[-6:])

    messages.append({
        "role": "user",
        "content": f"TÀI LIỆU THAM KHẢO:\n{context}\n\nCÂU HỎI: {query}"
        if language == "vi"
        else f"参考資料:\n{context}\n\n質問: {query}"
    })

    stream = await client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=messages,
        stream=True,
        temperature=0.1,    # Low temp for factual HR answers
        max_tokens=1024,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta
        # Chỉ stream nội dung trả lời — KHÔNG stream reasoning (gpt-oss hay model tương tự
        # sẽ in tiếng Anh kiểu "Need info from docs..." ra UI).
        if delta.content:
            yield delta.content


async def generate_full(
    query: str,
    chunks: List[dict],
    language: str = "vi",
    history: List[dict] | None = None,
) -> tuple[str, List[dict], float]:
    """Non-streaming generation — returns (answer, citations, confidence)."""
    answer_parts = []
    async for token in generate_stream(query, chunks, language, history):
        answer_parts.append(token)

    answer = "".join(answer_parts)
    citations = build_citations(chunks)

    # Simple confidence: average of top-3 rerank scores
    scores = [c.get("rerank_score", c.get("score", 0.0)) for c in chunks[:3]]
    confidence = round(sum(scores) / len(scores), 3) if scores else 0.0

    return answer, citations, confidence
