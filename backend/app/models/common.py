"""Shared/common Pydantic schemas used across multiple domains."""
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    app: str
