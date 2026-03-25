"""
PDFLoader — parse PDF files thành Sections.

Strategy:
  1. Primary: DoclingParser (từ ragflow/deepdoc)
     - Xử lý bảng biểu → Markdown
     - Multi-column layout
     - Structured headings extraction

  2. Fallback: pdfplumber
     - Simple text extraction per page
     - Dùng khi DoclingParser lỗi hoặc PDF scan
"""
from __future__ import annotations

import io
import logging
import os
from typing import List, Optional

from app.ingestion.base_loader import BaseLoader, LoaderMetadata, Section, compute_bytes_hash

logger = logging.getLogger(__name__)


class PDFLoader(BaseLoader):
    source_type = "pdf"

    def __init__(
        self,
        file_bytes: bytes,
        filename: str,
        language: str = "vi",
        location: Optional[str] = None,
    ) -> None:
        self.file_bytes = file_bytes
        self.filename = filename
        self.language = language
        self.location = location or f"local://uploads/{filename}"
        self._hash: Optional[str] = None

    async def compute_hash(self) -> str:
        if not self._hash:
            self._hash = compute_bytes_hash(self.file_bytes)
        return self._hash

    async def get_metadata(self) -> LoaderMetadata:
        return LoaderMetadata(
            name=self.filename,
            source_type="pdf",
            location=self.location,
            language=self.language,
            size_bytes=len(self.file_bytes),
            content_hash=await self.compute_hash(),
        )

    async def load(self) -> List[Section]:
        """Try DoclingParser → fallback to pdfplumber."""
        sections = await self._try_docling()
        if sections:
            logger.info(f"[PDFLoader] Docling parsed {len(sections)} sections from {self.filename}")
            return sections

        logger.warning(f"[PDFLoader] Docling failed for {self.filename}, falling back to pdfplumber")
        return await self._pdfplumber_fallback()

    # ─── Docling (Primary) ────────────────────────────────────────────────────

    async def _try_docling(self) -> List[Section]:
        """Use DoclingParser from ragflow/deepdoc."""
        try:
            import sys
            # deepdoc is mounted at /app/deepdoc in Docker (see Dockerfile + docker-compose)
            deepdoc_path = os.environ.get("DEEPDOC_PATH", "/app/deepdoc")
            if deepdoc_path not in sys.path:
                sys.path.insert(0, deepdoc_path)

            from parser.docling_parser import DoclingParser  # type: ignore

            parser = DoclingParser()
            # DoclingParser.parse_pdf returns: (sections, images)
            # sections: List[Tuple[str, str]] → (text, tag/type)
            raw_sections, _ = parser.parse_pdf(
                filepath=self.filename,
                binary=self.file_bytes,
            )
            return self._convert_docling_sections(raw_sections)

        except Exception as exc:
            logger.debug(f"[PDFLoader] Docling unavailable: {exc}")
            return []

    def _convert_docling_sections(self, raw: list) -> List[Section]:
        """Convert docling output tuples → Section dataclass."""
        sections = []
        for item in raw:
            if isinstance(item, (tuple, list)):
                text = item[0] if item else ""
                tag = item[1] if len(item) > 1 else ""
            else:
                text = str(item)
                tag = ""

            text = text.strip()
            if not text or len(text) < 10:
                continue

            # Detect page number from tag if available (format: "page_N" or embedded)
            page_no = None
            if "page" in tag.lower():
                try:
                    page_no = int("".join(c for c in tag if c.isdigit()))
                except ValueError:
                    pass

            # Detect table content
            is_table = "table" in tag.lower() or text.startswith("|")
            if is_table:
                text = self._table_to_markdown(text)

            sections.append(Section(
                text=text,
                page_number=page_no,
                section_header=tag if not is_table else "Table",
                source_url=self.location,
            ))
        return sections

    def _table_to_markdown(self, text: str) -> str:
        """Ensure table is in markdown format (Docling mostly returns HTML tables)."""
        if "<table" in text.lower():
            try:
                import markdownify
                return markdownify.markdownify(text, heading_style="ATX")
            except ImportError:
                return text
        return text

    # ─── pdfplumber (Fallback) ────────────────────────────────────────────────

    async def _pdfplumber_fallback(self) -> List[Section]:
        """Extract text page-by-page using pdfplumber."""
        try:
            import pdfplumber
        except ImportError:
            logger.error("[PDFLoader] pdfplumber not installed")
            return []

        sections: List[Section] = []
        try:
            with pdfplumber.open(io.BytesIO(self.file_bytes)) as pdf:
                for page_num, page in enumerate(pdf.pages, start=1):
                    # Extract regular text
                    text = (page.extract_text() or "").strip()
                    if len(text) >= 20:
                        sections.append(Section(
                            text=text,
                            page_number=page_num,
                            section_header=f"Page {page_num}",
                            source_url=self.location,
                        ))

                    # Extract tables → markdown
                    for table in page.extract_tables() or []:
                        md_table = self._pdfplumber_table_to_md(table)
                        if md_table:
                            sections.append(Section(
                                text=md_table,
                                page_number=page_num,
                                section_header="Table",
                                source_url=self.location,
                            ))

        except Exception as e:
            logger.error(f"[PDFLoader] pdfplumber failed: {e}")

        return sections

    def _pdfplumber_table_to_md(self, table: list) -> str:
        """Convert pdfplumber table (list of lists) → Markdown."""
        if not table or not table[0]:
            return ""
        header = table[0]
        rows = table[1:]
        lines = []
        lines.append("| " + " | ".join(str(c or "") for c in header) + " |")
        lines.append("| " + " | ".join("---" for _ in header) + " |")
        for row in rows:
            lines.append("| " + " | ".join(str(c or "") for c in row) + " |")
        return "\n".join(lines)
