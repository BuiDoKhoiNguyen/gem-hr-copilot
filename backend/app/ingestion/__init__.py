"""
Ingestion package — document loaders and processing pipeline.
"""
from app.ingestion.base_loader import BaseLoader, Section, LoaderMetadata
from app.ingestion.pdf_processor import PDFLoader
from app.ingestion.confluence import ConfluencePageLoader, ConfluenceSpaceLoader
from app.ingestion.url_crawler import URLLoader
from app.ingestion.chunker import chunk_sections, chunk_sections_from_loader
from app.ingestion.embedder import embed_chunks

__all__ = [
    "BaseLoader",
    "Section",
    "LoaderMetadata",
    "PDFLoader",
    "ConfluencePageLoader",
    "ConfluenceSpaceLoader",
    "URLLoader",
    "chunk_sections",
    "chunk_sections_from_loader",
    "embed_chunks",
]
