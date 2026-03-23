/**
 * SSE-based chat API client.
 * Consumes the /api/chat endpoint which sends:
 *   event: session   → { session_id }
 *   event: language  → { language }
 *   event: process_guide → { workflow_id, title, steps, ... }
 *   event: token     → { token }
 *   event: citations → { citations }
 *   event: done      → { confidence, language }
 *   event: message_id → { message_id }
 */

import { Citation, Language, ProcessGuide } from "@/lib/stores/chatStore";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface ChatCallbacks {
  onSession?: (sessionId: string) => void;
  onLanguage?: (lang: Language) => void;
  onProcessGuide?: (guide: ProcessGuide) => void;
  onToken?: (token: string) => void;
  onCitations?: (citations: Citation[]) => void;
  onDone?: (confidence: number) => void;
  onMessageId?: (id: string) => void;
  onError?: (err: Error) => void;
}

export async function streamChat(
  query: string,
  sessionId: string | null,
  language: Language,
  callbacks: ChatCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${BACKEND}/api/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ query, session_id: sessionId, language }),
    signal,
  });

  if (!res.ok) throw new Error(`Chat API error: ${res.statusText}`);
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    let currentEvent = "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        const raw = line.slice(6).trim();
        if (!raw) continue;
        try {
          const data = JSON.parse(raw);
          switch (currentEvent) {
            case "session":    callbacks.onSession?.(data.session_id);          break;
            case "language":   callbacks.onLanguage?.(data.language);           break;
            case "process_guide": callbacks.onProcessGuide?.(data as ProcessGuide); break;
            case "token":      callbacks.onToken?.(data.token);                 break;
            case "citations":  callbacks.onCitations?.(data.citations);         break;
            case "done":       callbacks.onDone?.(data.confidence ?? 0);        break;
            case "message_id": callbacks.onMessageId?.(data.message_id);        break;
          }
        } catch { /* ignore malformed lines */ }
      }
    }
  }
}

/* ─── Ingest ──────────────────────────────────────────────────── */
export async function ingestPDF(
  file: File,
  language: Language,
  onProgress?: (p: number, msg: string) => void
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);

  const res = await fetch(`${BACKEND}/api/ingest/pdf`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  const { job_id } = await res.json();

  // Poll progress
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(`${BACKEND}/api/ingest/status/${job_id}`);
    const status = await statusRes.json();
    onProgress?.(status.progress ?? 0, status.message ?? "");
    if (status.status === "done" || status.status === "failed") break;
  }
  return job_id;
}

/* ─── Quick prompts ───────────────────────────────────────────── */
export async function fetchQuickPrompts(): Promise<{ vi: string[]; ja: string[] }> {
  const res = await fetch(`${BACKEND}/api/quick-prompts`);
  if (!res.ok) return { vi: [], ja: [] };
  return res.json();
}

/* ─── Ingest stats ────────────────────────────────────────────── */
export async function fetchIngestStats(): Promise<{ total_chunks: number; index: string }> {
  const res = await fetch(`${BACKEND}/api/ingest/stats`);
  if (!res.ok) return { total_chunks: 0, index: "gem_hr_docs" };
  return res.json();
}

/* ─── Message History ─────────────────────────────────────── */
export interface MessageHistoryItem {
  message_id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  process_guide?: ProcessGuide;
  confidence?: number;
  created_at: string;
}

export async function fetchMessages(
  sessionId: string
): Promise<MessageHistoryItem[]> {
  const res = await fetch(`${BACKEND}/api/chat/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
  const data = await res.json();
  return data.messages || [];
}
