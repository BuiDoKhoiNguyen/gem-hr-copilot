from __future__ import annotations

import logging
import math
from typing import Any, List

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def _extract_rerank_item_score(item: dict[str, Any]) -> float:
    for key in ("relevance_score", "score", "relevance"):
        v = item.get(key)
        if v is not None:
            try:
                return float(v)
            except (TypeError, ValueError):
                continue
    return 0.0


def _scores_to_unit_interval(chunks: List[dict], key: str = "rerank_score") -> None:
    vals: List[float] = []
    for c in chunks:
        if key not in c:
            continue
        try:
            vals.append(float(c[key]))
        except (TypeError, ValueError):
            vals.append(0.0)
    if not vals:
        return
    lo, hi = min(vals), max(vals)
    if lo >= -0.05 and hi <= 1.05:
        for c in chunks:
            if key in c:
                c[key] = max(0.0, min(1.0, float(c[key])))
        return
    for c in chunks:
        if key not in c:
            continue
        x = float(c[key])
        if x > 35:
            c[key] = 1.0
        elif x < -35:
            c[key] = 0.0
        else:
            c[key] = 1.0 / (1.0 + math.exp(-x))


def _apply_min_score_filter(chunks: List[dict]) -> List[dict]:
    if not chunks:
        return []
    min_s = settings.RERANK_MIN_SCORE
    out = [c for c in chunks if float(c.get("rerank_score", 0.0)) >= min_s]
    if not out and chunks:
        logger.info(
            "Rerank: mọi chunk dưới ngưỡng %.2f — không đưa vào LLM (giống RAGFlow khi sim < threshold).",
            min_s,
        )
    return out


def _fallback_rerank_with_threshold(chunks: List[dict], top_n: int) -> List[dict]:
    if not chunks:
        return []
    scored = sorted(chunks, key=lambda c: float(c.get("score", 0.0)), reverse=True)[:top_n]
    raw = [float(c.get("score", 0.0)) for c in scored]
    lo, hi = min(raw), max(raw)
    if hi <= lo:
        norm = [1.0] * len(scored)
    else:
        norm = [(float(c.get("score", 0.0)) - lo) / (hi - lo) for c in scored]
    out = []
    for c, n in zip(scored, norm):
        cc = c.copy()
        cc["rerank_score"] = max(0.0, min(1.0, n))
        out.append(cc)
    min_rel = settings.RETRIEVAL_MIN_SCORE
    filtered = [c for c in out if float(c.get("rerank_score", 0.0)) >= min_rel]
    if not filtered and out:
        logger.info(
            "Fallback retrieval: mọi chunk dưới ngưỡng tương đối %.2f — bỏ qua LLM.",
            min_rel,
        )
    return filtered


async def rerank(query: str, chunks: List[dict], top_n: int = 5) -> List[dict]:
    if not chunks:
        return []

    documents = [chunk["content"] for chunk in chunks]

    payload = {
        "model": settings.RERANK_MODEL,
        "query": query,
        "documents": documents,
        "top_n": min(top_n, len(documents)),
        "return_documents": False,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.RERANK_BASE_URL.rstrip('/')}/rerank",
                json=payload,
                headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
            )
            response.raise_for_status()
            results = response.json()

        reranked: List[dict] = []
        for item in results.get("results", []):
            idx = item.get("index")
            if idx is None or not isinstance(idx, int) or idx < 0 or idx >= len(chunks):
                continue
            chunk = chunks[idx].copy()
            chunk["rerank_score"] = _extract_rerank_item_score(item)
            reranked.append(chunk)

        if not reranked:
            logger.warning("[Reranker] API trả results rỗng / index lỗi — fallback retrieval scores")
            return _fallback_rerank_with_threshold(chunks, top_n)

        _scores_to_unit_interval(reranked, "rerank_score")
        return _apply_min_score_filter(reranked)

    except Exception as e:
        logger.warning("[Reranker] %s — fallback retrieval + ngưỡng tương đối", e)
        return _fallback_rerank_with_threshold(chunks, top_n)
