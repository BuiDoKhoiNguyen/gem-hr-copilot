/**
 * Centralized API endpoint definitions
 * Following the pattern from documate's api.ts
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  // Chat endpoints
  chat: {
    stream: `${API_BASE}/api/chat/`,
    messages: (sessionId: string) =>
      `${API_BASE}/api/chat/sessions/${sessionId}/messages`,
  },

  // Document ingestion endpoints
  ingest: {
    pdf: `${API_BASE}/api/ingest/pdf`,
    confluence: `${API_BASE}/api/ingest/confluence`,
    url: `${API_BASE}/api/ingest/url`,
    status: (jobId: string) => `${API_BASE}/api/ingest/status/${jobId}`,
    stats: `${API_BASE}/api/ingest/stats`,
  },

  // Knowledge base endpoints (updated based on actual backend)
  kb: {
    list: `${API_BASE}/api/kb/`,
    create: `${API_BASE}/api/kb/`,
    delete: (kbId: string) => `${API_BASE}/api/kb/${kbId}`,
    documents: (kbId: string) => `${API_BASE}/api/kb/${kbId}/documents`,
  },

  // Dialog configuration endpoints (PATCH instead of PUT)
  dialogs: {
    list: `${API_BASE}/api/dialogs/`,
    create: `${API_BASE}/api/dialogs/`,
    update: (dialogId: string) => `${API_BASE}/api/dialogs/${dialogId}`, // Uses PATCH
    delete: (dialogId: string) => `${API_BASE}/api/dialogs/${dialogId}`,
  },

  // Quick prompts endpoint
  quickPrompts: `${API_BASE}/api/quick-prompts`,

  // Health check
  health: `${API_BASE}/health`,
};

export default API_ENDPOINTS;
