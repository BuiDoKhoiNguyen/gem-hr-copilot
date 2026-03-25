"""
Batch embedder — generates dense vectors via Xinference bge-m3.
"""
from __future__ import annotations

from typing import List
from openai import AsyncOpenAI

from app.core.config import settings

_client: AsyncOpenAI | None = None


def get_embed_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            base_url=settings.EMBED_BASE_URL,
            api_key=settings.LLM_API_KEY,
        )
    return _client


async def embed_texts(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """Embed a list of texts in batches. Returns list of embedding vectors."""
    client = get_embed_client()
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i: i + batch_size]
        response = await client.embeddings.create(
            model=settings.EMBED_MODEL,
            input=batch,
        )
        batch_embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(batch_embeddings)

    return all_embeddings


async def embed_chunks(chunks: List[dict]) -> List[dict]:
    """Add 'embedding' field to each chunk dict in place."""
    if not chunks:
        return []

    texts = [chunk["content"] for chunk in chunks]
    vectors = await embed_texts(texts)

    for chunk, vector in zip(chunks, vectors):
        chunk["embedding"] = vector

    return chunks
