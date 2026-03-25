
from __future__ import annotations

import logging
from typing import List, Optional

from elasticsearch import AsyncElasticsearch

from app.core.config import settings

logger = logging.getLogger(__name__)

_es_client: Optional[AsyncElasticsearch] = None


def get_es_client() -> AsyncElasticsearch:
    global _es_client
    if _es_client is None:
        _es_client = AsyncElasticsearch(settings.ES_URL)
    return _es_client


# ─── Index setup ─────────────────────────────────────────────────────────────

INDEX_MAPPING = {
    "settings": {
        "analysis": {
            "analyzer": {
                "icu_analyzer": {
                    "tokenizer": "icu_tokenizer",
                    "filter": ["icu_folding"],
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "content": {
                "type": "text",
                "analyzer": "icu_analyzer",   # VI + JP support
            },
            "embedding": {
                "type": "dense_vector",
                "dims": settings.EMBED_DIMS,   # 1024 for bge-m3
                "index": True,
                "similarity": "cosine",
            },
            "chunk_id":      {"type": "keyword"},
            "source_type":   {"type": "keyword"},
            "source_title":  {"type": "text"},
            "source_url":    {"type": "keyword"},
            "language":      {"type": "keyword"},
            "page_number":   {"type": "integer"},
            "section_header":{"type": "text"},
        }
    }
}


async def ensure_index():
    """Create ES index if it doesn't exist."""
    es = get_es_client()
    exists = await es.indices.exists(index=settings.ES_INDEX)
    if not exists:
        await es.indices.create(index=settings.ES_INDEX, body=INDEX_MAPPING)


# ─── Context Router ───────────────────────────────────────────────────────────

def build_corpus_filter(language: str, query: str, search_all_languages: bool = False) -> dict:
    """
    Route to correct document corpus based on language + query context.
    Prevents mixing VI policies with JP policies unless search_all_languages=True.

    Args:
        language: Detected/selected language ("vi" or "ja")
        query: User query text
        search_all_languages: If True, search both VI and JA corpora

    Returns:
        Elasticsearch filter dict
    """
    if search_all_languages:
        return {"terms": {"language": ["vi", "ja"]}}

    jp_keywords = ["nhật bản", "japan", "gemjpn", "会社", "規定", "日本", "japanese"]

    if language == "ja":
        return {"term": {"language": "ja"}}

    if any(kw in query.lower() for kw in jp_keywords):
        return {"term": {"language": "ja"}}

    return {"term": {"language": "vi"}}


# ─── Hybrid Retrieval ─────────────────────────────────────────────────────────

def _is_rrf_license_error(exc: Exception) -> bool:
    """License Basic/Free không cho RRF → ES trả 403 security_exception."""
    msg = str(exc).lower()
    return "rrf" in msg or "reciprocal rank fusion" in msg


def _hits_to_chunks(hits: list) -> List[dict]:
    return [
        {
            "chunk_id":       hit["_source"].get("chunk_id", hit["_id"]),
            "content":        hit["_source"]["content"],
            "source_title":   hit["_source"].get("source_title", ""),
            "source_url":     hit["_source"].get("source_url", ""),
            "source_type":    hit["_source"].get("source_type", ""),
            "language":       hit["_source"].get("language", "vi"),
            "page_number":    hit["_source"].get("page_number"),
            "section_header": hit["_source"].get("section_header", ""),
            "document_id":    hit["_source"].get("document_id"),
            "score":          hit.get("_rank", hit.get("_score", 0.0)),
        }
        for hit in hits
    ]


async def _hybrid_retrieve_no_rrf(
    es: AsyncElasticsearch,
    query: str,
    query_embedding: List[float],
    corpus_filter: dict,
    top_k: int,
) -> List[dict]:
    """BM25 + kNN hai query riêng, gộp điểm — tương thích license không có RRF."""
    num_cand = min(200, max(top_k * 5, top_k))

    bm25_resp = await es.search(
        index=settings.ES_INDEX,
        body={
            "query": {
                "bool": {
                    "must": {"match": {"content": query}},
                    "filter": corpus_filter,
                }
            },
            "size": top_k,
            "_source": {"excludes": ["embedding"]},
        },
    )
    knn_resp = await es.search(
        index=settings.ES_INDEX,
        knn={
            "field": "embedding",
            "query_vector": query_embedding,
            "k": top_k,
            "num_candidates": num_cand,
            "filter": corpus_filter,
        },
        size=top_k,
        source_excludes=["embedding"],
    )

    merged: dict[str, dict] = {}
    for hit in bm25_resp["hits"]["hits"]:
        cid = str(hit["_source"].get("chunk_id", hit["_id"]))
        s = float(hit.get("_score") or 0.0)
        row = _hits_to_chunks([hit])[0]
        row["score"] = s
        merged[cid] = row
    for hit in knn_resp["hits"]["hits"]:
        cid = str(hit["_source"].get("chunk_id", hit["_id"]))
        s = float(hit.get("_score") or 0.0)
        if cid in merged:
            merged[cid]["score"] = merged[cid]["score"] + s
        else:
            row = _hits_to_chunks([hit])[0]
            row["score"] = s
            merged[cid] = row

    ranked = sorted(merged.values(), key=lambda x: x["score"], reverse=True)
    return ranked[:top_k]


async def hybrid_retrieve(
    query: str,
    query_embedding: List[float],
    corpus_filter: dict,
    top_k: int = 20,
) -> List[dict]:
    es = get_es_client()

    if not settings.ES_USE_RRF:
        return await _hybrid_retrieve_no_rrf(
            es, query, query_embedding, corpus_filter, top_k
        )

    body = {
        "retriever": {
            "rrf": {
                "retrievers": [
                    {
                        "standard": {
                            "query": {
                                "bool": {
                                    "must": {"match": {"content": query}},
                                    "filter": corpus_filter,
                                }
                            }
                        }
                    },
                    {
                        "knn": {
                            "field": "embedding",
                            "query_vector": query_embedding,
                            "k": top_k,
                            "num_candidates": top_k * 5,
                            "filter": corpus_filter,
                        }
                    }
                ],
                "rank_window_size": top_k,
                "rank_constant": 60,
            }
        },
        "size": top_k,
        "_source": {
            "excludes": ["embedding"]   # Don't return large vector in response
        }
    }

    try:
        response = await es.search(index=settings.ES_INDEX, body=body)
    except Exception as e:
        if _is_rrf_license_error(e):
            logger.warning(
                "Elasticsearch không hỗ trợ RRF với license hiện tại — dùng hybrid BM25+kNN."
            )
            return await _hybrid_retrieve_no_rrf(
                es, query, query_embedding, corpus_filter, top_k
            )
        raise

    hits = response["hits"]["hits"]
    return _hits_to_chunks(hits)


async def index_chunk(chunk: dict):
    """Index a single chunk into Elasticsearch."""
    es = get_es_client()
    await es.index(
        index=settings.ES_INDEX,
        id=chunk["chunk_id"],
        document=chunk,
    )


async def bulk_index_chunks(chunks: List[dict], kb_id: Optional[str] = None, doc_id: Optional[str] = None) -> List[str]:
    """Bulk index chunks into Elasticsearch. Returns list of chunk IDs."""
    from elasticsearch.helpers import async_bulk
    es = get_es_client()

    for i, c in enumerate(chunks):
        if kb_id:
            c["kb_id"] = kb_id
        if doc_id:
            c["document_id"] = doc_id
        c["chunk_index"] = i
        c["total_chunks"] = len(chunks)

    actions = [
        {
            "_index": settings.ES_INDEX,
            "_id": chunk["chunk_id"],
            "_source": chunk,
        }
        for chunk in chunks
    ]
    await async_bulk(es, actions)
    return [chunk["chunk_id"] for chunk in chunks]
