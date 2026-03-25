import type {
  KnowledgeBase,
  Document,
  IngestStatus,
  IngestStats,
  QuickPrompts,
  ChatMessage,
  Citation,
  ProcessStep,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const errBody = await res.json();
      if (typeof errBody?.detail === "string") detail = errBody.detail;
      else if (Array.isArray(errBody?.detail))
        detail = errBody.detail.map((x: { msg?: string }) => x.msg).join("; ");
    } catch {
      /* ignore */
    }
    throw new Error(`API Error: ${res.status} ${detail}`);
  }
  return res.json();
}

/** Chuẩn hóa JSON từ SQLAlchemy / FastAPI → type FE */
export function mapKnowledgeBaseRow(row: Record<string, unknown>): KnowledgeBase {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    language: String(row.language ?? "vi"),
    embed_model: String(row.embed_model ?? "bge-m3"),
    description: row.description != null ? String(row.description) : undefined,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

/** BE dùng `run` (pending|running|done|failed); UI dùng status + processing */
export function mapDocumentRow(
  row: Record<string, unknown>,
  kbLanguage: string
): Document {
  const run = String(row.run ?? "pending");
  const status =
    run === "done"
      ? "completed"
      : run === "failed"
        ? "failed"
        : run === "running"
          ? "processing"
          : "pending";
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    source_type: String(row.source_type ?? "pdf"),
    language: kbLanguage,
    status,
    progress: Number(row.progress ?? 0),
    chunk_count: Number(row.chunk_num ?? 0),
    content_hash: String(row.content_hash ?? ""),
    created_at: String(row.created_at ?? ""),
  };
}

function normalizeCitation(raw: Record<string, unknown>): Citation {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    url: String(raw.url ?? ""),
    excerpt: String(raw.excerpt ?? ""),
    page_number:
      raw.page_number != null ? Number(raw.page_number) : undefined,
    source_type: String(raw.source_type ?? "doc"),
    relevance_score: Number(raw.relevance_score ?? 0),
  };
}

function normalizeProcessStep(raw: Record<string, unknown>): ProcessStep {
  return {
    step: Number(raw.step ?? 0),
    action: String(raw.action ?? ""),
    url: raw.url != null ? String(raw.url) : undefined,
    note: raw.note != null ? String(raw.note) : undefined,
    completed: Boolean(raw.completed),
  };
}

/** Map payload SSE `process_guide` → ProcessStep[] cho UI */
export function stepsFromProcessGuide(payload: Record<string, unknown>): ProcessStep[] {
  const steps = payload.steps;
  if (!Array.isArray(steps)) return [];
  return steps.map((s) =>
    normalizeProcessStep(typeof s === "object" && s ? (s as Record<string, unknown>) : {})
  );
}

interface ApiMessageRow {
  message_id: string;
  role: string;
  content: string;
  citations?: unknown[];
  confidence?: number;
  created_at: string;
  process_steps?: unknown[];
}

export function mapApiMessageToChat(m: ApiMessageRow): ChatMessage {
  const citations = Array.isArray(m.citations)
    ? m.citations.map((c) =>
        normalizeCitation(
          typeof c === "object" && c ? (c as Record<string, unknown>) : {}
        )
      )
    : undefined;
  const process_steps = Array.isArray(m.process_steps)
    ? m.process_steps.map((s) =>
        normalizeProcessStep(
          typeof s === "object" && s ? (s as Record<string, unknown>) : {}
        )
      )
    : undefined;
  return {
    id: m.message_id,
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
    citations,
    process_steps,
    confidence: m.confidence,
    timestamp: m.created_at,
  };
}

// ─── Chat ─────────────────────────────────────────────────────────
export interface StreamCallbacks {
  onToken: (token: string) => void;
  onCitations: (citations: ChatMessage["citations"]) => void;
  onProcessGuide: (steps: NonNullable<ChatMessage["process_steps"]>) => void;
  onSessionId: (sessionId: string) => void;
  onLanguage: (lang: string) => void;
  onQueryRewrite: (original: string, rewritten: string) => void;
  onDone: () => void;
  onMessageId: (messageId: string) => void;
  onError: (error: string) => void;
}

function dispatchSseEvent(event: string, dataStr: string, callbacks: StreamCallbacks) {
  let payload: unknown;
  try {
    payload = JSON.parse(dataStr);
  } catch {
    payload = dataStr;
  }

  switch (event) {
    case "token": {
      const t =
        typeof payload === "object" &&
        payload !== null &&
        "token" in payload
          ? String((payload as { token: string }).token)
          : String(payload ?? "");
      callbacks.onToken(t);
      break;
    }
    case "session": {
      const sid =
        typeof payload === "object" &&
        payload !== null &&
        "session_id" in payload
          ? String((payload as { session_id: string }).session_id)
          : String(payload ?? "");
      callbacks.onSessionId(sid);
      break;
    }
    case "language": {
      const lang =
        typeof payload === "object" &&
        payload !== null &&
        "language" in payload
          ? String((payload as { language: string }).language)
          : String(payload ?? "");
      callbacks.onLanguage(lang);
      break;
    }
    case "query_rewrite": {
      if (
        typeof payload === "object" &&
        payload !== null &&
        "original" in payload &&
        "rewritten" in payload
      ) {
        const p = payload as { original: string; rewritten: string };
        callbacks.onQueryRewrite(p.original, p.rewritten);
      }
      break;
    }
    case "citations": {
      if (
        typeof payload === "object" &&
        payload !== null &&
        "citations" in payload
      ) {
        const list = (payload as { citations: unknown[] }).citations;
        if (Array.isArray(list)) {
          callbacks.onCitations(
            list.map((c) =>
              normalizeCitation(
                typeof c === "object" && c ? (c as Record<string, unknown>) : {}
              )
            )
          );
        }
      }
      break;
    }
    case "process_guide": {
      if (typeof payload === "object" && payload !== null) {
        callbacks.onProcessGuide(
          stepsFromProcessGuide(payload as Record<string, unknown>)
        );
      }
      break;
    }
    case "done":
      callbacks.onDone();
      break;
    case "message_id": {
      const mid =
        typeof payload === "object" &&
        payload !== null &&
        "message_id" in payload
          ? String((payload as { message_id: string }).message_id)
          : "";
      if (mid) callbacks.onMessageId(mid);
      break;
    }
    case "error":
      callbacks.onError(
        typeof payload === "object" &&
          payload !== null &&
          "message" in payload
          ? String((payload as { message: string }).message)
          : String(payload ?? "error")
      );
      break;
    default:
      break;
  }
}

export interface ChatOptions {
  searchAllLanguages?: boolean;
}

export async function streamChat(
  query: string,
  sessionId: string | null,
  language: string | undefined,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
  options?: ChatOptions
) {
  const body: Record<string, unknown> = { query };
  if (sessionId) body.session_id = sessionId;
  if (language) body.language = language;
  if (options?.searchAllLanguages) body.search_all_languages = true;

  const res = await fetch(`${API_BASE}/api/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    callbacks.onError(`HTTP ${res.status}`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let sep = buffer.indexOf("\n\n");
    while (sep !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      let eventName = "message";
      let dataLine = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine = line.slice(5).trim();
      }
      if (dataLine) dispatchSseEvent(eventName, dataLine, callbacks);

      sep = buffer.indexOf("\n\n");
    }
  }
}

export async function getSessionMessages(sessionId: string) {
  const data = await fetchAPI<{ messages: ApiMessageRow[] }>(
    `/api/chat/sessions/${sessionId}/messages`
  );
  return {
    messages: data.messages.map(mapApiMessageToChat),
  };
}

// ─── Quick Prompts ────────────────────────────────────────────────
export async function getQuickPrompts(): Promise<QuickPrompts> {
  return fetchAPI<QuickPrompts>("/api/quick-prompts");
}

// ─── Knowledge Base ───────────────────────────────────────────────
export async function listKnowledgeBases(): Promise<KnowledgeBase[]> {
  const rows = await fetchAPI<unknown[]>("/api/kb/");
  return rows.map((r) =>
    mapKnowledgeBaseRow(typeof r === "object" && r ? (r as Record<string, unknown>) : {})
  );
}

export async function createKnowledgeBase(
  data: Pick<KnowledgeBase, "name" | "language" | "embed_model" | "description">
): Promise<KnowledgeBase> {
  return fetchAPI<KnowledgeBase>("/api/kb/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteKnowledgeBase(kbId: string) {
  return fetchAPI<{ status: string; kb_id: string }>(`/api/kb/${kbId}`, {
    method: "DELETE",
  });
}

export async function listDocuments(kbId: string, kbLanguage: string): Promise<Document[]> {
  const rows = await fetchAPI<unknown[]>(`/api/kb/${kbId}/documents`);
  return rows.map((r) =>
    mapDocumentRow(typeof r === "object" && r ? (r as Record<string, unknown>) : {}, kbLanguage)
  );
}

// ─── Ingest ───────────────────────────────────────────────────────
export async function uploadPDF(
  file: File,
  language = "vi",
  kbId?: string
): Promise<IngestStatus> {
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);
  if (kbId) form.append("kb_id", kbId);

  const res = await fetch(`${API_BASE}/api/ingest/pdf`, {
    method: "POST",
    body: form,
  });
  const data = (await res.json()) as IngestStatus & { detail?: unknown };
  if (!res.ok) {
    const msg =
      typeof data.detail === "string"
        ? data.detail
        : `Upload failed: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export interface BatchFileStatus {
  filename: string;
  job_id: string;
  status: string;
  message: string;
}

export interface BatchIngestResponse {
  total_files: number;
  queued: number;
  skipped: number;
  files: BatchFileStatus[];
}

export async function uploadPDFBatch(
  files: File[],
  language = "vi",
  kbId?: string
): Promise<BatchIngestResponse> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  form.append("language", language);
  if (kbId) form.append("kb_id", kbId);

  const res = await fetch(`${API_BASE}/api/ingest/pdf/batch`, {
    method: "POST",
    body: form,
  });
  const data = (await res.json()) as BatchIngestResponse & { detail?: unknown };
  if (!res.ok) {
    const msg =
      typeof data.detail === "string"
        ? data.detail
        : `Batch upload failed: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function waitIngestComplete(
  jobId: string,
  options?: { intervalMs?: number; timeoutMs?: number }
): Promise<IngestStatus> {
  const intervalMs = options?.intervalMs ?? 1500;
  const timeoutMs = options?.timeoutMs ?? 900_000;
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const st = await getIngestStatus(jobId);
    if (st.status === "done" || st.status === "failed") return st;
    if (Date.now() > deadline) throw new Error("Hết thời gian chờ ingest");
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export async function ingestConfluence(
  spaceKey: string,
  language = "vi",
  kbId?: string
): Promise<IngestStatus> {
  return fetchAPI<IngestStatus>("/api/ingest/confluence", {
    method: "POST",
    body: JSON.stringify({ space_key: spaceKey, language, kb_id: kbId }),
  });
}

export async function ingestURL(
  url: string,
  language = "vi",
  kbId?: string
): Promise<IngestStatus> {
  return fetchAPI<IngestStatus>("/api/ingest/url", {
    method: "POST",
    body: JSON.stringify({ url, language, kb_id: kbId }),
  });
}

export async function getIngestStatus(jobId: string): Promise<IngestStatus> {
  return fetchAPI<IngestStatus>(`/api/ingest/status/${jobId}`);
}

export async function getIngestStats(): Promise<IngestStats> {
  return fetchAPI<IngestStats>("/api/ingest/stats");
}

// ─── Feedback ─────────────────────────────────────────────────────
export interface FeedbackRequest {
  message_id: string;
  session_id: string;
  rating: -1 | 0 | 1;
  reason?: string;
  additional_comment?: string;
}

export interface FeedbackResponse {
  feedback_id: string;
  message_id: string;
  rating: number;
  created_at: string;
}

export interface FeedbackStats {
  total_feedbacks: number;
  positive: number;
  negative: number;
  neutral: number;
  deflection_rate: number;
  description?: string;
  error?: string;
}

export async function submitFeedback(data: FeedbackRequest): Promise<FeedbackResponse> {
  return fetchAPI<FeedbackResponse>("/api/chat/feedback", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getFeedbackStats(): Promise<FeedbackStats> {
  return fetchAPI<FeedbackStats>("/api/chat/feedback/stats");
}

export { USE_MOCK };
