"""
ConfluenceLoader — sync Confluence spaces → Sections.

Supports:
  - Full sync: crawl entire space
  - Incremental sync: skip pages với content_hash không đổi
  - Nested pages: traverse child pages recursively
  - HTML → Markdown: markdownify
  - Language detection từ space key → language tag

Config (.env):
  Cloud:   CONFLUENCE_CLOUD=true, URL ...atlassian.net/wiki, CONFLUENCE_TOKEN=<API token>
  Server:  CONFLUENCE_CLOUD=false, URL https://conf.company.com/wiki (nếu Confluence gắn dưới /wiki),
           CONFLUENCE_USER + CONFLUENCE_PASSWORD (hoặc PAT trong CONFLUENCE_TOKEN)
"""
from __future__ import annotations

import logging
from typing import List, Optional

from app.ingestion.base_loader import BaseLoader, LoaderMetadata, Section, compute_text_hash

logger = logging.getLogger(__name__)

# Spaces mapping → language
_SPACE_LANG_MAP: dict[str, str] = {
    "GEMJPN": "ja",
    "GEMJP": "ja",
    "JP": "ja",
}


def _detect_space_language(space_key: str) -> str:
    space_upper = space_key.upper()
    for key, lang in _SPACE_LANG_MAP.items():
        if key in space_upper:
            return lang
    return "vi"  # Default: Vietnamese


class ConfluencePageLoader(BaseLoader):
    """Load a single Confluence page."""
    source_type = "confluence"

    def __init__(self, page_id: str, page_title: str, html_content: str,
                 space_key: str, page_url: str, language: str) -> None:
        self.page_id = page_id
        self.page_title = page_title
        self.html_content = html_content
        self.space_key = space_key
        self.page_url = page_url
        self.language = language
        self._hash: Optional[str] = None

    async def compute_hash(self) -> str:
        if not self._hash:
            self._hash = compute_text_hash(self.html_content)
        return self._hash

    async def get_metadata(self) -> LoaderMetadata:
        return LoaderMetadata(
            name=self.page_title,
            source_type="confluence",
            location=f"confluence://{self.space_key}/pages/{self.page_id}",
            language=self.language,
            size_bytes=len(self.html_content.encode("utf-8")),
            content_hash=await self.compute_hash(),
            extra={"space_key": self.space_key, "page_url": self.page_url},
        )

    async def load(self) -> List[Section]:
        md_text = self._html_to_markdown(self.html_content)
        if not md_text.strip():
            return []

        # Split by headings to create sections
        return self._split_by_headings(md_text)

    def _html_to_markdown(self, html: str) -> str:
        try:
            import markdownify
            return markdownify.markdownify(
                html,
                heading_style="ATX",
                bullets="-",
                strip=["script", "style", "nav", "footer"],
            )
        except ImportError:
            from html.parser import HTMLParser
            class _Strip(HTMLParser):
                def __init__(self):
                    super().__init__()
                    self._parts = []
                def handle_data(self, data):
                    self._parts.append(data)
            p = _Strip()
            p.feed(html)
            return " ".join(p._parts)

    def _split_by_headings(self, md: str) -> List[Section]:
        """Split markdown by H1/H2 headings → coherent sections."""
        import re
        sections = []
        current_header = self.page_title
        current_lines = []

        for line in md.split("\n"):
            heading_match = re.match(r"^#{1,3}\s+(.+)$", line)
            if heading_match:
                text = "\n".join(current_lines).strip()
                if text and len(text) >= 20:
                    sections.append(Section(
                        text=text,
                        section_header=current_header,
                        source_url=self.page_url,
                    ))
                current_header = heading_match.group(1).strip()
                current_lines = []
            else:
                current_lines.append(line)

        # Last section
        text = "\n".join(current_lines).strip()
        if text and len(text) >= 20:
            sections.append(Section(
                text=text,
                section_header=current_header,
                source_url=self.page_url,
            ))

        return sections if sections else [Section(text=md[:5000], section_header=self.page_title, source_url=self.page_url)]


class ConfluenceSpaceLoader:
    """
    Crawls an entire Confluence space, yields ConfluencePageLoader per page.
    Handles pagination, child pages, and incremental sync.
    """

    def __init__(
        self,
        space_key: str,
        confluence_url: str,
        username: str,
        password: str,
        language: Optional[str] = None,
        cloud: bool = True,
    ) -> None:
        self.space_key = space_key
        self.confluence_url = confluence_url.rstrip("/")
        self.username = username
        self.password = password
        self.cloud = cloud
        self.language = language or _detect_space_language(space_key)

    def _page_public_url(self, page_id: str) -> str:
        """Link hiển thị trong citation (Cloud vs Server khác đường dẫn)."""
        if self.cloud:
            return f"{self.confluence_url}/pages/{page_id}"
        return f"{self.confluence_url}/pages/viewpage.action?pageId={page_id}"

    def _get_client(self):
        try:
            from atlassian import Confluence
            return Confluence(
                url=self.confluence_url,
                username=self.username,
                password=self.password,
                cloud=self.cloud,
            )
        except ImportError:
            raise RuntimeError("atlassian-python-api not installed. Run: pip install atlassian-python-api")

    async def get_pages(self, known_hashes: dict[str, str] | None = None) -> List[ConfluencePageLoader]:
        """
        Fetch all pages in space.
        known_hashes: {page_id → content_hash} — skip if hash unchanged (incremental sync).
        """
        client = self._get_client()
        loaders = []

        try:
            start = 0
            limit = 50
            while True:
                results = client.get_all_pages_from_space(
                    self.space_key,
                    start=start,
                    limit=limit,
                    expand="body.storage,version",
                )
                if not results:
                    break

                for page in results:
                    page_id = str(page["id"])
                    title = page.get("title", "Untitled")
                    html = page.get("body", {}).get("storage", {}).get("value", "")
                    page_url = self._page_public_url(page_id)

                    if not html.strip():
                        continue

                    # Incremental sync: skip if content unchanged
                    if known_hashes:
                        page_hash = compute_text_hash(html)
                        if known_hashes.get(page_id) == page_hash:
                            logger.debug(f"[Confluence] Skip unchanged page: {title}")
                            continue

                    loaders.append(ConfluencePageLoader(
                        page_id=page_id,
                        page_title=title,
                        html_content=html,
                        space_key=self.space_key,
                        page_url=page_url,
                        language=self.language,
                    ))

                if len(results) < limit:
                    break
                start += limit

        except Exception as e:
            logger.error(f"[Confluence] Failed to fetch space {self.space_key}: {e}")

        logger.info(f"[Confluence] Found {len(loaders)} pages to process in {self.space_key}")
        return loaders
