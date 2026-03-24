"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, MessageSquarePlus } from "lucide-react";
import { useChatStore } from "@/lib/stores/chatStore";
import { mockQuickPrompts } from "@/lib/mock-data";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import QuickPrompts from "./QuickPrompts";
import ConversationSidebar from "./ConversationSidebar";

export default function ChatContainer() {
  const [storeReady, setStoreReady] = useState(false);

  useEffect(() => {
    void useChatStore.persist.rehydrate();
    setStoreReady(true);
  }, []);

  const messages = useChatStore((s) => s.getActiveMessages());
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const language = useChatStore((s) => s.language);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const stopGeneration = useChatStore((s) => s.stopGeneration);
  const toggleStepComplete = useChatStore((s) => s.toggleStepComplete);
  const newConversation = useChatStore((s) => s.newConversation);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setLanguage = useChatStore((s) => s.setLanguage);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showQuickPrompts =
    messages.length <= 1 && messages.every((m) => m.id === "welcome");
  const prompts = language === "ja" ? mockQuickPrompts.ja : mockQuickPrompts.vi;

  if (!storeReady) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500 text-sm">
        Đang tải…
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 h-[calc(100vh-64px)]">
      <ConversationSidebar />

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gray-950 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">
              Chat AI Assistant
            </h2>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 shrink-0">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs text-gray-400 outline-none cursor-pointer"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={() => newConversation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-primary-300 hover:bg-primary-500/10 transition-all shrink-0 sm:hidden"
          >
            Mới
          </button>
          <button
            type="button"
            onClick={() => newConversation()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            Cuộc mới
          </button>
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-300 text-xs shrink-0">
            {error}
          </div>
        )}

        <div className="sm:hidden px-3 py-2 border-b border-white/10 bg-gray-900/50 shrink-0">
          <label className="sr-only">Chọn cuộc trò chuyện</label>
          <select
            value={activeConversationId ?? ""}
            onChange={(e) => void selectConversation(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-200 outline-none"
          >
            {[...conversations]
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              )
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title.slice(0, 48)}
                  {c.title.length > 48 ? "…" : ""}
                </option>
              ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
              <MessageBubble
                key={`${msg.id}-${msg.timestamp}`}
                message={msg}
                onToggleStep={toggleStepComplete}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showQuickPrompts && (
            <div className="max-w-4xl mx-auto mt-8">
              <p className="text-xs text-gray-600 text-center mb-3">Thử hỏi:</p>
              <QuickPrompts prompts={prompts} onSelect={sendMessage} />
            </div>
          )}
        </div>

        <ChatInput
          onSend={sendMessage}
          onStop={stopGeneration}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
