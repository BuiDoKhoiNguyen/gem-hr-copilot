"""
HR workflow checklist + intent (keyword + LLM).
Dữ liệu quy trình không nằm trong code — chỉ đọc từ WORKFLOWS_JSON_PATH.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

# Định nghĩa checklist + từ khóa intent: chỉ nạp từ WORKFLOWS_JSON_PATH (xem data/sample_workflows.gem.json làm mẫu).
# Không hardcode công ty trong repo — để trống path thì không có process_guide / keyword workflow.

HR_WORKFLOWS: dict = {}
INTENT_KEYWORDS: dict[str, list[str]] = {}


def _load_workflows_from_env() -> None:
    global HR_WORKFLOWS, INTENT_KEYWORDS
    from app.core.config import settings
    from app.workflows.workflow_json import load_workflows_full

    path = (settings.WORKFLOWS_JSON_PATH or "").strip()
    if not path:
        logger.info(
            "WORKFLOWS_JSON_PATH trống — HR_WORKFLOWS rỗng; checklist chỉ bật khi bạn trỏ tới file JSON."
        )
        return
    loaded = load_workflows_full(path)
    if not loaded:
        return
    w, k = loaded
    HR_WORKFLOWS.clear()
    HR_WORKFLOWS.update(w)
    INTENT_KEYWORDS.clear()
    INTENT_KEYWORDS.update(k)
    logger.info("Đã load %d workflow từ %s", len(w), path)


_load_workflows_from_env()


def detect_workflow_intent(query: str) -> Optional[str]:
    """Return workflow_id if query matches a known HR process, else None."""
    query_lower = query.lower()
    for workflow_id, keywords in INTENT_KEYWORDS.items():
        if any(kw in query_lower for kw in keywords):
            return workflow_id
    return None


async def detect_workflow_intent_hybrid(query: str, use_llm: bool = True) -> Optional[str]:
    keyword_result = detect_workflow_intent(query)

    if not use_llm:
        return keyword_result

    if keyword_result:
        return keyword_result

    try:
        llm_result = await _llm_intent_classify(query)
        return llm_result
    except Exception:
        return keyword_result


async def _llm_intent_classify(query: str, timeout: float = 3.0) -> Optional[str]:
    """
    Use LLM to classify user intent into workflow categories.
    Fast classification with low timeout.
    """
    import asyncio
    from app.core.config import settings

    workflow_ids = list(HR_WORKFLOWS.keys())
    if not workflow_ids:
        return None

    desc_lines = []
    for wid in workflow_ids:
        langs = HR_WORKFLOWS.get(wid, {})
        first: Any = next(iter(langs.values()), {}) if langs else {}
        title = first.get("title", wid) if isinstance(first, dict) else wid
        desc_lines.append(f"- {wid}: {title}")

    prompt = f"""Phân loại câu hỏi HR sau vào một trong các danh mục:
{chr(10).join(desc_lines)}
- none: Không thuộc danh mục nào (câu hỏi chính sách chung)

Câu hỏi: "{query}"

Chỉ trả về MỘT từ: {', '.join(workflow_ids)}, hoặc none"""

    try:
        from app.rag.generator import get_llm_client
        client = get_llm_client()

        response = await asyncio.wait_for(
            client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=20,
            ),
            timeout=timeout,
        )

        result = response.choices[0].message.content.strip().lower()

        for wf_id in workflow_ids:
            if wf_id in result:
                return wf_id

        return None

    except asyncio.TimeoutError:
        return None
    except Exception:
        return None


def get_workflow(workflow_id: str, language: str) -> Optional[dict]:
    """Lấy định nghĩa theo ngôn ngữ; fallback vi → bất kỳ locale nào trong JSON."""
    workflow = HR_WORKFLOWS.get(workflow_id, {})
    if not workflow:
        return None
    if language in workflow:
        return workflow[language]
    if "vi" in workflow:
        return workflow["vi"]
    first = next(iter(workflow.values()), None)
    return first if isinstance(first, dict) else None


def advance_workflow_step(steps: list, current_step: int) -> tuple[int, bool]:
    """
    Advance to next step. Returns (new_step, is_completed).
    If all steps done, returns (len(steps), True).
    """
    next_step = current_step + 1
    is_completed = next_step > len(steps)
    return next_step, is_completed
