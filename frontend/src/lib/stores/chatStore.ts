import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatMessage, ConversationMeta } from "@/types";
import { createWelcomeMessages, getMockResponse } from "@/lib/mock-data";
import { streamChat, getSessionMessages, USE_MOCK } from "@/lib/api";

function newLocalId(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return `local-${globalThis.crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sortConversations(convs: ConversationMeta[]): ConversationMeta[] {
  return [...convs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function createFreshConversation(): {
  meta: ConversationMeta;
  messages: ChatMessage[];
} {
  const id = newLocalId();
  return {
    meta: {
      id,
      title: "Cuộc trò chuyện mới",
      updatedAt: new Date().toISOString(),
      pendingLocal: true,
    },
    messages: createWelcomeMessages(),
  };
}

interface ChatState {
  conversations: ConversationMeta[];
  activeConversationId: string | null;
  messagesById: Record<string, ChatMessage[]>;
  language: string;
  isLoading: boolean;
  error: string | null;
  abortController: AbortController | null;
  loadingHistoryForId: string | null;

  getActiveMessages: () => ChatMessage[];
  newConversation: () => void;
  selectConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  sendMessage: (query: string) => Promise<void>;
  stopGeneration: () => void;
  toggleStepComplete: (messageId: string, stepIndex: number) => void;
  setLanguage: (lang: string) => void;
}

const initialBundle = createFreshConversation();

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [initialBundle.meta],
      activeConversationId: initialBundle.meta.id,
      messagesById: { [initialBundle.meta.id]: initialBundle.messages },
      language: "vi",
      isLoading: false,
      error: null,
      abortController: null,
      loadingHistoryForId: null,

      getActiveMessages: () => {
        const { activeConversationId, messagesById } = get();
        if (!activeConversationId) return [];
        return messagesById[activeConversationId] ?? [];
      },

      newConversation: () => {
        const { meta, messages } = createFreshConversation();
        set((s) => ({
          conversations: sortConversations([meta, ...s.conversations]),
          activeConversationId: meta.id,
          messagesById: { ...s.messagesById, [meta.id]: messages },
          error: null,
        }));
      },

      selectConversation: async (id: string) => {
        const s = get();
        if (id === s.activeConversationId) return;

        set({ activeConversationId: id, error: null });

        const conv = s.conversations.find((c) => c.id === id);
        const cached = s.messagesById[id] ?? [];
        const onlyPlaceholder =
          cached.length === 0 ||
          (cached.length === 1 && cached[0].id === "welcome");

        const needsServer =
          !USE_MOCK &&
          conv &&
          !conv.pendingLocal &&
          !id.startsWith("local-") &&
          onlyPlaceholder;

        if (needsServer) {
          set({ loadingHistoryForId: id });
          try {
            const { messages } = await getSessionMessages(id);
            set((st) => ({
              messagesById: { ...st.messagesById, [id]: messages },
              loadingHistoryForId: null,
            }));
          } catch {
            set({
              loadingHistoryForId: null,
              error: "Không tải được lịch sử từ server.",
            });
          }
          return;
        }

        if (cached.length === 0) {
          set((st) => ({
            messagesById: {
              ...st.messagesById,
              [id]: createWelcomeMessages(),
            },
          }));
        }
      },

      deleteConversation: (id: string) => {
        set((s) => {
          const conversations = s.conversations.filter((c) => c.id !== id);
          const { [id]: _removed, ...restMessages } = s.messagesById;
          let active = s.activeConversationId;

          if (active === id) {
            active = conversations[0]?.id ?? null;
          }

          if (conversations.length === 0) {
            const fresh = createFreshConversation();
            return {
              conversations: [fresh.meta],
              activeConversationId: fresh.meta.id,
              messagesById: { [fresh.meta.id]: fresh.messages },
            };
          }

          return {
            conversations: sortConversations(conversations),
            activeConversationId: active,
            messagesById: restMessages,
          };
        });
      },

      renameConversation: (id: string, title: string) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? { ...c, title: title.slice(0, 80), updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },

      sendMessage: async (query: string) => {
        let activeId = get().activeConversationId;
        if (!activeId) return;

        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content: query,
          timestamp: new Date().toISOString(),
        };
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
        };

        const conv = get().conversations.find((c) => c.id === activeId);
        const nextTitle =
          conv?.title === "Cuộc trò chuyện mới" || conv?.pendingLocal
            ? query.slice(0, 60)
            : conv?.title;

        set((s) => {
          const prev = s.messagesById[activeId!] ?? [];
          const conversations = s.conversations.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  title: nextTitle ?? c.title,
                  updatedAt: new Date().toISOString(),
                }
              : c
          );
          return {
            conversations: sortConversations(conversations),
            messagesById: {
              ...s.messagesById,
              [activeId!]: [...prev, userMsg, assistantMsg],
            },
            isLoading: true,
            error: null,
          };
        });

        const patchAssistant = (fn: (last: ChatMessage) => ChatMessage) => {
          const aid = get().activeConversationId;
          if (!aid) return;
          set((s) => {
            const list = [...(s.messagesById[aid] ?? [])];
            if (list.length === 0) return {};
            const last = { ...list[list.length - 1] };
            list[list.length - 1] = fn(last);
            return { messagesById: { ...s.messagesById, [aid]: list } };
          });
        };

        const applyServerSession = (sid: string) => {
          set((s) => {
            const cur = s.activeConversationId;
            if (!cur) return {};
            if (cur === sid) {
              return {
                conversations: s.conversations.map((c) =>
                  c.id === sid ? { ...c, pendingLocal: false } : c
                ),
              };
            }
            if (cur.startsWith("local-")) {
              const msgs = s.messagesById[cur] ?? [];
              const { [cur]: _, ...rest } = s.messagesById;
              return {
                conversations: s.conversations.map((c) =>
                  c.id === cur ? { ...c, id: sid, pendingLocal: false } : c
                ),
                activeConversationId: sid,
                messagesById: { ...rest, [sid]: msgs },
              };
            }
            return {};
          });
        };

        if (USE_MOCK) {
          const mock = getMockResponse(query);
          const words = mock.content.split(/(?<=\s)/);
          for (let i = 0; i < words.length; i++) {
            await new Promise((r) => setTimeout(r, 30));
            patchAssistant((last) => ({
              ...last,
              content: last.content + words[i],
            }));
          }
          patchAssistant((last) => ({
            ...last,
            isStreaming: false,
            citations: mock.citations,
            process_steps: mock.process_steps,
          }));
          set((s) => ({
            conversations: sortConversations(
              s.conversations.map((c) =>
                c.id === get().activeConversationId
                  ? {
                      ...c,
                      pendingLocal: false,
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              )
            ),
            isLoading: false,
          }));
          return;
        }

        const convNow = get().conversations.find(
          (c) => c.id === get().activeConversationId
        );
        const apiSessionId =
          convNow?.pendingLocal || get().activeConversationId?.startsWith("local-")
            ? null
            : get().activeConversationId;

        const controller = new AbortController();
        set({ abortController: controller });

        try {
          await streamChat(
            query,
            apiSessionId,
            get().language,
            {
              onToken: (token) => {
                patchAssistant((last) => ({
                  ...last,
                  content: last.content + token,
                }));
              },
              onCitations: (citations) => {
                patchAssistant((last) => ({ ...last, citations }));
              },
              onProcessGuide: (steps) => {
                patchAssistant((last) => ({ ...last, process_steps: steps }));
              },
              onSessionId: (sid) => applyServerSession(sid),
              onLanguage: (lang) => set({ language: lang }),
              onDone: () => {
                patchAssistant((last) => ({ ...last, isStreaming: false }));
                const aid = get().activeConversationId;
                set({
                  isLoading: false,
                  abortController: null,
                  conversations: sortConversations(
                    get().conversations.map((c) =>
                      c.id === aid
                        ? {
                            ...c,
                            pendingLocal: false,
                            updatedAt: new Date().toISOString(),
                          }
                        : c
                    )
                  ),
                });
              },
              onMessageId: (mid) => {
                const aid = get().activeConversationId;
                if (!aid) return;
                set((s) => {
                  const list = [...(s.messagesById[aid] ?? [])];
                  if (list.length === 0) return {};
                  const last = { ...list[list.length - 1] };
                  last.id = mid;
                  list[list.length - 1] = last;
                  return { messagesById: { ...s.messagesById, [aid]: list } };
                });
              },
              onError: (err) =>
                set({
                  error: err,
                  isLoading: false,
                  abortController: null,
                }),
            },
            controller.signal
          );
        } catch {
          set({ isLoading: false, abortController: null });
        }
      },

      stopGeneration: () => {
        const ctrl = get().abortController;
        if (ctrl) ctrl.abort();
        const aid = get().activeConversationId;
        if (aid) {
          set((s) => {
            const list = [...(s.messagesById[aid] ?? [])];
            if (list.length > 0) {
              const last = { ...list[list.length - 1] };
              last.isStreaming = false;
              list[list.length - 1] = last;
            }
            return {
              messagesById: { ...s.messagesById, [aid]: list },
              isLoading: false,
              abortController: null,
            };
          });
        } else {
          set({ isLoading: false, abortController: null });
        }
      },

      toggleStepComplete: (messageId: string, stepIndex: number) => {
        const aid = get().activeConversationId;
        if (!aid) return;
        set((s) => {
          const list = (s.messagesById[aid] ?? []).map((m) => {
            if (m.id !== messageId || !m.process_steps) return m;
            const steps = m.process_steps.map((step, i) =>
              i === stepIndex ? { ...step, completed: !step.completed } : step
            );
            return { ...m, process_steps: steps };
          });
          return { messagesById: { ...s.messagesById, [aid]: list } };
        });
      },

      setLanguage: (lang: string) => set({ language: lang }),
    }),
    {
      name: "gem-hr-copilot-chat",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messagesById: state.messagesById,
        activeConversationId: state.activeConversationId,
        language: state.language,
      }),
      skipHydration: true,
    }
  )
);
