from __future__ import annotations

from typing import TypedDict, List, Optional, Any
from langgraph.graph import StateGraph, END


# ─── State ────────────────────────────────────────────────────────────────────

class HRCopilotState(TypedDict):
    # Input
    query: str
    session_id: str
    history: List[dict]

    # Detected
    language: str 
    intent: str
    corpus_filter: dict
    expanded_queries: List[str]

    # Retrieval
    retrieved_chunks: List[dict]
    reranked_chunks: List[dict]

    # Generation
    answer: str
    citations: List[dict]
    confidence: float

    # Guided workflow (if intent == "process_guide")
    workflow_id: Optional[str]
    process_steps: Optional[List[dict]]
    current_step: Optional[int]
    workflow_active: bool


# ─── Node implementations ───────────────────────────────────────────────────────

async def language_detect_node(state: HRCopilotState) -> dict:
    """Detect VI/JP and determine corpus filter."""
    from app.rag.retriever import build_corpus_filter
    query = state["query"]
    
    try:
        from langdetect import detect
        lang = detect(query)
        language = "ja" if lang == "ja" else "vi"
    except Exception:
        language = "vi"

    corpus_filter = build_corpus_filter(language, query)
    return {
        "language": language,
        "corpus_filter": corpus_filter,
    }


async def query_analyze_node(state: HRCopilotState) -> dict:
    """Classify intent and expand query."""
    from app.workflows.hr_processes import detect_workflow_intent
    query = state["query"]
    workflow_id = detect_workflow_intent(query)
    
    if workflow_id:
        return {
            "intent": "process_guide",
            "workflow_id": workflow_id,
            "expanded_queries": [query],
        }
        
    return {
        "intent": "question",
        "expanded_queries": [query],
    }


async def hybrid_retrieve_node(state: HRCopilotState) -> dict:
    """ES hybrid BM25 + Dense vector search with RRF."""
    from app.rag.retriever import hybrid_retrieve
    from app.core.config import settings
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(base_url=settings.EMBED_BASE_URL, api_key=settings.LLM_API_KEY)
    resp = await client.embeddings.create(model=settings.EMBED_MODEL, input=[state["query"]])
    query_vector = resp.data[0].embedding
    
    chunks = await hybrid_retrieve(
        query=state["query"],
        query_embedding=query_vector,
        corpus_filter=state["corpus_filter"],
        top_k=settings.RETRIEVAL_TOP_K,
    )
    return {"retrieved_chunks": chunks}


async def rerank_node(state: HRCopilotState) -> dict:
    """CrossEncoder rerank top-K chunks."""
    from app.rag.reranker import rerank
    from app.core.config import settings
    
    reranked = await rerank(
        query=state["query"],
        chunks=state["retrieved_chunks"],
        top_n=settings.RERANK_TOP_N,
    )
    return {"reranked_chunks": reranked}


async def generate_node(state: HRCopilotState) -> dict:
    """Generate final answer with citations."""
    from app.rag.generator import generate_full
    answer, citations, confidence = await generate_full(
        query=state["query"],
        chunks=state["reranked_chunks"],
        language=state["language"],
        history=state.get("history")
    )
    return {
        "answer": answer,
        "citations": citations,
        "confidence": confidence,
    }


async def process_guide_node(state: HRCopilotState) -> dict:
    """Return structured HR workflow steps."""
    from app.workflows.hr_processes import get_workflow
    workflow = get_workflow(state["workflow_id"], state["language"])
    
    if not workflow:
        return {
            "workflow_id": None,
            "workflow_active": False,
        }
        
    return {
        "process_steps": workflow["steps"],
        "current_step": 1,
        "workflow_active": True,
    }


# ─── Routing ──────────────────────────────────────────────────────────────────

def route_after_analyze(state: HRCopilotState) -> str:
    if state["intent"] == "process_guide":
        return "process_guide"
    return "hybrid_retrieve"


# ─── Graph builder ────────────────────────────────────────────────────────────

def build_pipeline() -> Any:
    graph = StateGraph(HRCopilotState)

    graph.add_node("language_detect", language_detect_node)
    graph.add_node("query_analyze", query_analyze_node)
    graph.add_node("hybrid_retrieve", hybrid_retrieve_node)
    graph.add_node("rerank", rerank_node)
    graph.add_node("generate", generate_node)
    graph.add_node("process_guide", process_guide_node)

    graph.set_entry_point("language_detect")
    graph.add_edge("language_detect", "query_analyze")
    graph.add_conditional_edges("query_analyze", route_after_analyze, {
        "hybrid_retrieve": "hybrid_retrieve",
        "process_guide": "process_guide",
    })
    graph.add_edge("hybrid_retrieve", "rerank")
    graph.add_edge("rerank", "generate")
    graph.add_edge("generate", END)
    graph.add_edge("process_guide", END)

    return graph.compile()


# Singleton
pipeline = build_pipeline()
