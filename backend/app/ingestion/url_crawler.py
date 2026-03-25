"""
URLLoader — crawl HR Portal links và các URL nội bộ.

Use cases:
  - HR Portal pages không có trên Confluence
  - Các link trong tài liệu cần crawl thêm
  - Internal wiki pages

Xử lý:
  - httpx async HTTP client
  - BeautifulSoup: extract main content, strip nav/footer
  - markdownify: HTML → Markdown
  - langdetect: auto-detect language nếu không truyền vào
"""
from __future__ import annotations

import logging
from typing import List, Optional
from urllib.parse import urlparse

from app.ingestion.base_loader import BaseLoader, LoaderMetadata, Section, compute_text_hash

logger = logging.getLogger(__name__)

# CSS selectors cho main content (ưu tiên theo thứ tự)
_CONTENT_SELECTORS = [
    "main",
    "article",
    "[role='main']",
    "#main-content",
    "#content",
    ".main-content",
    ".content",
    "body",  # last resort
]

# Tags cần strip (navigation, ads, etc.)
_STRIP_TAGS = [
    "nav", "header", "footer", "aside",
    "script", "style", "noscript",
    ".navigation", ".sidebar", ".menu",
    "#navigation", "#sidebar", "#nav",
]


class URLLoader(BaseLoader):
    source_type = "url"

    def __init__(
        self,
        url: str,
        language: Optional[str] = None,
        timeout: int = 30,
        headers: Optional[dict] = None,
    ) -> None:
        self.url = url
        self._language = language
        self.timeout = timeout
        self.headers = headers or {
            "User-Agent": "GEM-HR-Copilot/1.0 (internal document crawler)",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "vi,ja,en",
        }
        self._raw_html: Optional[str] = None
        self._hash: Optional[str] = None

    async def _fetch(self) -> str:
        if self._raw_html is not None:
            return self._raw_html
        try:
            import httpx
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.get(self.url, headers=self.headers)
                resp.raise_for_status()
                self._raw_html = resp.text
        except Exception as e:
            logger.error(f"[URLLoader] Failed to fetch {self.url}: {e}")
            self._raw_html = ""
        return self._raw_html

    async def compute_hash(self) -> str:
        if not self._hash:
            html = await self._fetch()
            self._hash = compute_text_hash(html)
        return self._hash

    async def get_metadata(self) -> LoaderMetadata:
        html = await self._fetch()
        title = self._extract_title(html) or urlparse(self.url).path.split("/")[-1]
        return LoaderMetadata(
            name=title,
            source_type="url",
            location=f"url://{self.url}",
            language=await self._get_language(html),
            size_bytes=len(html.encode("utf-8")),
            content_hash=await self.compute_hash(),
            extra={"original_url": self.url},
        )

    async def load(self) -> List[Section]:
        html = await self._fetch()
        if not html:
            return []

        cleaned_html = self._extract_main_content(html)
        if not cleaned_html:
            return []

        md_text = self._to_markdown(cleaned_html)
        if not md_text or len(md_text.strip()) < 50:
            return []

        title = self._extract_title(html) or self.url
        lang = await self._get_language(html)

        return self._split_sections(md_text, title)

    # ─── Helpers ──────────────────────────────────────────────────────────────

    def _extract_main_content(self, html: str) -> str:
        """Find main content area, strip boilerplate."""
        try:
            from bs4 import BeautifulSoup
        except ImportError:
            raise RuntimeError("beautifulsoup4 not installed. Run: pip install beautifulsoup4")

        soup = BeautifulSoup(html, "html.parser")

        # Remove boilerplate tags
        for selector in _STRIP_TAGS:
            for el in soup.select(selector):
                el.decompose()

        # Try content selectors in priority order
        for selector in _CONTENT_SELECTORS:
            el = soup.select_one(selector)
            if el and len(el.get_text(strip=True)) > 100:
                return str(el)

        return str(soup.body) if soup.body else html

    def _to_markdown(self, html: str) -> str:
        try:
            import markdownify
            return markdownify.markdownify(
                html,
                heading_style="ATX",
                bullets="-",
            )
        except ImportError:
            try:
                from bs4 import BeautifulSoup
                return BeautifulSoup(html, "html.parser").get_text(separator="\n")
            except ImportError:
                return html

    def _extract_title(self, html: str) -> Optional[str]:
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, "html.parser")
            tag = soup.find("title") or soup.find("h1")
            return tag.get_text(strip=True) if tag else None
        except Exception:
            return None

    async def _get_language(self, html: str) -> str:
        if self._language:
            return self._language
        # Try <html lang="...">
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, "html.parser")
            lang_attr = soup.find("html", {"lang": True})
            if lang_attr:
                lang = lang_attr.get("lang", "").lower()
                if lang.startswith("ja"):
                    return "ja"
                if lang.startswith("vi"):
                    return "vi"
        except Exception:
            pass
        # Fallback: langdetect
        try:
            from langdetect import detect
            text = self._to_markdown(html)[:1000]
            detected = detect(text)
            return "ja" if detected == "ja" else "vi"
        except Exception:
            return "vi"

    def _split_sections(self, md: str, page_title: str) -> List[Section]:
        """Split markdown by headings → sections."""
        import re
        sections = []
        current_header = page_title
        current_lines: List[str] = []

        for line in md.split("\n"):
            m = re.match(r"^#{1,3}\s+(.+)$", line)
            if m:
                text = "\n".join(current_lines).strip()
                if text and len(text) >= 30:
                    sections.append(Section(text=text, section_header=current_header, source_url=self.url))
                current_header = m.group(1).strip()
                current_lines = []
            else:
                current_lines.append(line)

        text = "\n".join(current_lines).strip()
        if text and len(text) >= 30:
            sections.append(Section(text=text, section_header=current_header, source_url=self.url))

        return sections or [Section(text=md[:5000], section_header=page_title, source_url=self.url)]
