/**
 * Dialog API client functions
 * Backend follows RAGFlow dialog model pattern
 */

import { API_ENDPOINTS } from "./endpoints";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface DialogConfig {
  id: string;
  name: string;
  description?: string;
  language: "vi" | "ja";
  llm_model: string;
  llm_settings: {
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
  };
  prompt_config: {
    system: string;
    prologue: string;
    empty_response: string;
  };
  kb_ids: string[];
  similarity_threshold: number;
  top_k: number;
  top_n: number;
  rerank_model: string;
  status: "active" | "inactive" | "deleted";
  created_at: string;
  updated_at: string;
}

export interface CreateDialogRequest {
  name: string;
  description?: string;
  language: "vi" | "ja";
  llm_model: string;
  llm_settings: {
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
  };
  prompt_config: {
    system: string;
    prologue: string;
    empty_response: string;
  };
  kb_ids: string[];
  top_k?: number;
  top_n?: number;
}

export interface UpdateDialogRequest extends Partial<CreateDialogRequest> {}

/**
 * List all active dialogs
 */
export async function listDialogs(): Promise<DialogConfig[]> {
  const res = await fetch(`${BACKEND}/api/dialogs/`);
  if (!res.ok) throw new Error(`Failed to fetch dialogs: ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.dialogs || [];
}

/**
 * Create new dialog configuration
 */
export async function createDialog(request: CreateDialogRequest): Promise<DialogConfig> {
  const res = await fetch(`${BACKEND}/api/dialogs/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Failed to create dialog: ${res.statusText}`);
  return res.json();
}

/**
 * Update existing dialog configuration
 */
export async function updateDialog(
  dialogId: string,
  request: UpdateDialogRequest
): Promise<DialogConfig> {
  const res = await fetch(`${BACKEND}/api/dialogs/${dialogId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Failed to update dialog: ${res.statusText}`);
  return res.json();
}

/**
 * Get dialog by ID (derived from list for now since backend doesn't have get by ID endpoint)
 */
export async function getDialog(dialogId: string): Promise<DialogConfig | null> {
  const dialogs = await listDialogs();
  return dialogs.find(d => d.id === dialogId) || null;
}

/**
 * Default dialog configuration for forms
 */
export const DEFAULT_DIALOG_CONFIG: CreateDialogRequest = {
  name: "",
  description: "",
  language: "vi",
  llm_model: "qwen2.5-instruct",
  llm_settings: {
    temperature: 0.1,
    max_tokens: 1024,
    top_p: 0.9,
    frequency_penalty: 0.0,
  },
  prompt_config: {
    system: "",
    prologue: "Xin chào! Tôi là GEM HR Copilot. Tôi có thể giúp gì cho bạn?",
    empty_response: "Xin lỗi, tôi không tìm thấy thông tin này trong tài liệu HR hiện có.",
  },
  kb_ids: [],
  top_k: 20,
  top_n: 5,
};

/**
 * Available LLM models
 */
export const LLM_MODELS = [
  "qwen2.5-instruct",
  "gpt-4o-mini",
  "claude-3-haiku",
  "gemma2-9b-instruct",
] as const;

/**
 * LLM setting presets for quick configuration
 */
export const LLM_PRESETS = {
  balanced: {
    temperature: 0.7,
    top_p: 0.9,
    frequency_penalty: 0.0,
    max_tokens: 1024,
  },
  creative: {
    temperature: 1.0,
    top_p: 0.95,
    frequency_penalty: 0.1,
    max_tokens: 1024,
  },
  focused: {
    temperature: 0.1,
    top_p: 0.8,
    frequency_penalty: 0.0,
    max_tokens: 512,
  },
} as const;