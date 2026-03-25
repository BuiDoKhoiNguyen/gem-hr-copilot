from typing import List, Optional
from pydantic import BaseModel


class IngestPDFRequest(BaseModel):
    language: str = "vi"  # "vi" | "ja"


class IngestConfluenceRequest(BaseModel):
    space_key: str
    language: str = "vi"


class IngestStatusResponse(BaseModel):
    job_id: str
    status: str         # pending | processing | done | failed
    progress: float = 0.0
    message: str = ""
    chunk_count: int = 0


class BatchFileStatus(BaseModel):
    """Status of a single file in batch upload."""
    filename: str
    job_id: str
    status: str
    message: str = ""


class BatchIngestResponse(BaseModel):
    """Response for batch PDF upload."""
    total_files: int
    queued: int
    skipped: int
    files: List[BatchFileStatus]
