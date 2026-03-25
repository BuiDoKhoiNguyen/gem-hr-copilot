"""
Semantic chunker — splits document sections into overlapping token chunks.
Preserves metadata (source, page, section header) per chunk.
"""
from __future__ import annotations

import uuid
from typing import List, Tuple, TYPE_CHECKING
import tiktoken

if TYPE_CHECKING:
    from app.ingestion.base_loader import Section

_enc = tiktoken.get_encoding("cl100k_base")


def _token_count(text: str) -> int:
    return len(_enc.encode(text))


def chunk_sections_from_loader(
    sections: "List[Section]",
    source_title: str,
    source_url: str,
    language: str,
    source_type: str = "pdf",
    chunk_size: int = 512,
    overlap: int = 64,
) -> List[dict]:
    """
    Accepts Section dataclass objects from BaseLoader subclasses.
    Preserves page_number and section_header from each Section.
    """
    chunks = []
    for section in sections:
        text = section.text.strip()
        if not text or _token_count(text) < 10:
            continue

        url = section.source_url or source_url
        header = section.section_header or ""
        page = section.page_number

        if _token_count(text) <= chunk_size:
            chunks.append(_make_chunk(text, source_title, url, language, source_type, page, header))
            continue

        tokens = _enc.encode(text)
        start = 0
        while start < len(tokens):
            end = min(start + chunk_size, len(tokens))
            chunk_text = _enc.decode(tokens[start:end])
            chunks.append(_make_chunk(chunk_text, source_title, url, language, source_type, page, header))
            if end == len(tokens):
                break
            start += chunk_size - overlap

    return chunks


def chunk_sections(
    sections: List[Tuple],
    source_title: str,
    source_url: str,
    language: str,
    source_type: str = "pdf",
    chunk_size: int = 512,
    overlap: int = 64,
) -> List[dict]:
    """
    Legacy: accepts raw tuples (text, tag) from deepdoc parsers.
    For new code use chunk_sections_from_loader() instead.
    """
    chunks = []
    for section in sections:
        text = section[0] if isinstance(section, (tuple, list)) else section
        text = text.strip()
        if not text or _token_count(text) < 10:
            continue

        if _token_count(text) <= chunk_size:
            chunks.append(_make_chunk(text, source_title, source_url, language, source_type))
            continue

        tokens = _enc.encode(text)
        start = 0
        while start < len(tokens):
            end = min(start + chunk_size, len(tokens))
            chunk_text = _enc.decode(tokens[start:end])
            chunks.append(_make_chunk(chunk_text, source_title, source_url, language, source_type))
            if end == len(tokens):
                break
            start += chunk_size - overlap

    return chunks


def _make_chunk(
    text: str,
    source_title: str,
    source_url: str,
    language: str,
    source_type: str,
    page_number: int | None = None,
    section_header: str = "",
) -> dict:
    return {
        "chunk_id": str(uuid.uuid4()),
        "content": text,
        "source_title": source_title,
        "source_url": source_url,
        "source_type": source_type,
        "language": language,
        "page_number": page_number,
        "section_header": section_header,
        # embedding will be added by embedder.py
    }



def _token_count(text: str) -> int:
    return len(_enc.encode(text))


def chunk_sections(
    sections: List[Tuple[str, ...]],
    source_title: str,
    source_url: str,
    language: str,
    source_type: str = "pdf",
    chunk_size: int = 512,
    overlap: int = 64,
) -> List[dict]:
    """
    Convert parsed sections (from deepdoc/docling) into overlapping chunks.
    Each chunk is a dict ready for embedding + ES indexing.

    sections format: [(text, tag), ...] or [(text, type, tag), ...]
    """
    chunks = []

    for section in sections:
        # Handle both (text,) and (text, tag) and (text, type, tag) formats
        text = section[0] if isinstance(section, (tuple, list)) else section
        text = text.strip()
        if not text or _token_count(text) < 10:
            continue

        # If section fits in one chunk
        if _token_count(text) <= chunk_size:
            chunks.append(_make_chunk(text, source_title, source_url, language, source_type))
            continue

        # Sliding window chunking
        tokens = _enc.encode(text)
        start = 0
        while start < len(tokens):
            end = min(start + chunk_size, len(tokens))
            chunk_tokens = tokens[start:end]
            chunk_text = _enc.decode(chunk_tokens)
            chunks.append(_make_chunk(chunk_text, source_title, source_url, language, source_type))
            if end == len(tokens):
                break
            start += chunk_size - overlap  # Sliding with overlap

    return chunks


def _make_chunk(
    text: str,
    source_title: str,
    source_url: str,
    language: str,
    source_type: str,
    page_number: int | None = None,
    section_header: str = "",
) -> dict:
    return {
        "chunk_id": str(uuid.uuid4()),
        "content": text,
        "source_title": source_title,
        "source_url": source_url,
        "source_type": source_type,
        "language": language,
        "page_number": page_number,
        "section_header": section_header,
        # embedding will be added by embedder.py
    }
