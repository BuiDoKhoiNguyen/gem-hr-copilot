"""
Abstract BaseLoader — interface cho tất cả document loaders.

Mỗi loader implement:
  - load()          → parse source thành List[Section]
  - compute_hash()  → xxhash128 để dedup (skip reindex nếu content không đổi)
  - get_metadata()  → source-specific metadata cho Document record

Supported loaders:
  PDFLoader         → DoclingParser + pdfplumber fallback
  ConfluenceLoader  → Atlassian API + markdownify
  URLLoader         → httpx + BeautifulSoup
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class Section:
    """Một đoạn văn bản đã được parse từ source."""
    text: str
    page_number: Optional[int] = None
    section_header: str = ""
    source_url: str = ""
    extra: dict = field(default_factory=dict)  # Bảng biểu, image captions...


@dataclass
class LoaderMetadata:
    """Metadata cho Document DB record."""
    name: str
    source_type: str        # "pdf" | "confluence" | "url" | "docx"
    location: str           # URI: local://, confluence://, url://
    language: str           # "vi" | "ja"
    size_bytes: int = 0
    content_hash: str = ""
    extra: dict = field(default_factory=dict)


class BaseLoader(ABC):
    """
    Abstract base class cho tất cả document loaders.
    Pattern học từ RAGFlow: mỗi source type có loader riêng,
    share cùng interface để IngestService có thể xử lý generic.
    """

    source_type: str = "unknown"

    @abstractmethod
    async def load(self) -> List[Section]:
        """
        Parse source content thành list of Sections.
        Mỗi Section là một block văn bản coherent (paragraph, heading + content, table).
        """
        ...

    @abstractmethod
    async def compute_hash(self) -> str:
        """
        Tính xxhash128 của raw content để dedup.
        Nếu hash trùng với Document.content_hash trong DB → skip reindex.
        """
        ...

    @abstractmethod
    async def get_metadata(self) -> LoaderMetadata:
        """
        Return metadata để tạo Document record trong PostgreSQL.
        """
        ...


def compute_bytes_hash(data: bytes) -> str:
    """Utility: xxhash128 của bytes (nhanh hơn SHA256, đủ collision-resistant)."""
    try:
        import xxhash
        return xxhash.xxh128(data).hexdigest()
    except ImportError:
        import hashlib
        return hashlib.sha256(data).hexdigest()[:32]


def compute_text_hash(text: str) -> str:
    """Utility: xxhash128 của text (dùng cho Confluence/URL)."""
    return compute_bytes_hash(text.encode("utf-8"))
