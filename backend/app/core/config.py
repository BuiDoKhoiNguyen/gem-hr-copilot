from typing import Literal

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "GEM HR Copilot Pro"
    DEBUG: bool = False
    PUBLIC_API_BASE: str = "http://localhost:8000"
    DOCUMENT_STORAGE_DIR: str = "data/uploaded_documents"

    LLM_BACKEND: Literal["local", "huggingface"] = "local"
    LLM_BASE_URL: str = "http://localhost:1234/v1"
    LLM_MODEL: str = "gpt-oss-20b"
    LLM_API_KEY: str = "not-needed"

    HF_INFERENCE_BASE_URL: str = "https://router.huggingface.co/v1"
    HF_TOKEN: str = ""

    # Embedding model (via Xinference)
    EMBED_BASE_URL: str = "http://localhost:9997/v1"
    EMBED_MODEL: str = "bge-m3"
    EMBED_DIMS: int = 1024

    # Reranker model (via Xinference or Cloud API)
    RERANK_BASE_URL: str = "http://localhost:9997/v1"
    RERANK_MODEL: str = "bge-reranker-v2-m3"

    # Elasticsearch
    ES_URL: str = "http://localhost:9200"
    ES_INDEX: str = "gem_hr_docs"
    ES_USE_RRF: bool = False

    # PostgreSQL
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "hr_copilot"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Confluence (optional — can use PDF-only mode)
    CONFLUENCE_URL: str = ""
    CONFLUENCE_CLOUD: bool = True
    CONFLUENCE_USER: str = ""
    CONFLUENCE_TOKEN: str = ""
    CONFLUENCE_PASSWORD: str = ""
    CONFLUENCE_WEBHOOK_SECRET: str = ""

    # RAG settings
    RETRIEVAL_TOP_K: int = 20
    RERANK_TOP_N: int = 5
    RERANK_MIN_SCORE: float = 0.32
    RETRIEVAL_MIN_SCORE: float = 0.2
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64

    PROCESS_GUIDE_MODE: Literal["always", "rag_fallback", "off"] = "rag_fallback"
    WORKFLOWS_JSON_PATH: str = ""

    model_config = {"env_file": ".env", "case_sensitive": False}


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
