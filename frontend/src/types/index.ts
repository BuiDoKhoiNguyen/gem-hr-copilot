export interface Citation {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  page_number?: number;
  source_type: string;
  relevance_score: number;
}

export interface ProcessStep {
  step: number;
  action: string;
  url?: string;
  note?: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  process_steps?: ProcessStep[];
  confidence?: number;
  /** ISO string — dễ persist localStorage */
  timestamp: string;
  isStreaming?: boolean;
}

/** Một cuộc hội thoại (session backend hoặc local trước khi gửi tin đầu) */
export interface ConversationMeta {
  id: string;
  title: string;
  updatedAt: string;
  /** true = chưa có session_id từ server, gửi chat không kèm session */
  pendingLocal?: boolean;
}

export interface ChatRequest {
  query: string;
  session_id?: string;
  language?: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  language: string;
  embed_model: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  name: string;
  source_type: string;
  language: string;
  status: string;
  progress: number;
  chunk_count: number;
  content_hash: string;
  created_at: string;
}

export interface Dialog {
  id: string;
  name: string;
  language: string;
  llm_model: string;
  kb_ids: string[];
  description?: string;
  top_k: number;
  top_n: number;
}

export interface IngestStatus {
  job_id: string;
  status: string;
  progress: number;
  message: string;
  chunk_count: number;
}

export interface IngestStats {
  total_chunks: number;
  index: string;
  error?: string;
}

export interface QuickPrompts {
  vi: string[];
  ja: string[];
}

export type SSEEventType =
  | "session"
  | "language"
  | "process_guide"
  | "token"
  | "citations"
  | "done"
  | "message_id"
  | "error";
