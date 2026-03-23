/**
 * Zustand store for GEM HR Copilot — chat state management.
 * Pattern: influenced by Documate's conversation/dialog approach.
 */
import { create } from "zustand";

export type Language = "vi" | "ja";

export interface Citation {
  id: number;
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
  url?: string | null;
  note?: string | null;
}

export interface ProcessGuide {
  workflow_id: string;
  title: string;
  steps: ProcessStep[];
  policy_url?: string;
  contact?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  processGuide?: ProcessGuide;
  confidence?: number;
  language?: Language;
  isStreaming?: boolean;
  timestamp: number;
}

interface ChatState {
  sessionId: string | null;
  messages: Message[];
  language: Language;
  isLoading: boolean;
  pendingMessageId: string | null;

  // Actions
  setLanguage: (lang: Language) => void;
  setSessionId: (id: string) => void;
  addMessage: (msg: Message) => void;
  updateLastAssistantMessage: (patch: Partial<Message>) => void;
  appendToken: (token: string) => void;
  setLoading: (v: boolean) => void;
  setPendingMessageId: (id: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: null,
  messages: [],
  language: "vi",
  isLoading: false,
  pendingMessageId: null,

  setLanguage: (lang) => set({ language: lang }),
  setSessionId: (id) => set({ sessionId: id }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateLastAssistantMessage: (patch) =>
    set((s) => {
      const msgs = [...s.messages];
      const lastIdx = msgs.findLastIndex((m) => m.role === "assistant");
      if (lastIdx !== -1) msgs[lastIdx] = { ...msgs[lastIdx], ...patch };
      return { messages: msgs };
    }),

  appendToken: (token) =>
    set((s) => {
      const msgs = [...s.messages];
      const lastIdx = msgs.findLastIndex((m) => m.role === "assistant");
      if (lastIdx !== -1) {
        msgs[lastIdx] = {
          ...msgs[lastIdx],
          content: msgs[lastIdx].content + token,
        };
      }
      return { messages: msgs };
    }),

  setLoading: (v) => set({ isLoading: v }),
  setPendingMessageId: (id) => set({ pendingMessageId: id }),
  clearMessages: () => set({ messages: [], sessionId: null }),
}));
