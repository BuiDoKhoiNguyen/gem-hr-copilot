from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables and ES index
    from pathlib import Path

    from app.db.session import create_tables
    from app.rag.retriever import ensure_index

    Path(settings.DOCUMENT_STORAGE_DIR).mkdir(parents=True, exist_ok=True)
    await create_tables()
    await ensure_index()
    yield
    # Shutdown: close Redis pool
    try:
        from app.worker.queue import close_redis_pool
        await close_redis_pool()
    except Exception:
        pass  # Redis might not be configured


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AI HR Copilot Pro — Bilingual HR Policy Assistant for GEM Corp",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.routers import chat, documents, ingest, kb

app.include_router(chat.router)
app.include_router(ingest.router)
app.include_router(kb.router)
app.include_router(documents.router)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}


@app.get("/api/quick-prompts")
async def quick_prompts():
    """Pre-defined suggested questions shown on the frontend."""
    return {
        "vi": [
            "Tôi có bao nhiêu ngày phép năm?",
            "Quy trình xin nghỉ phép như thế nào?",
            "Bảo hiểm BSH 2025 chi trả những gì?",
            "Làm thêm giờ được tính như thế nào?",
            "Tôi cần làm gì trong tuần đầu onboarding?",
            "Checklist nghỉ thai sản?",
        ],
        "ja": [
            "有給休暇は何日ありますか？",
            "休暇申請の手順は？",
            "経費精算の方法は？",
        ],
    }
