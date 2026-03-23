"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/stores/chatStore";
import { streamChat } from "@/lib/api/chat";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { QuickPrompts } from "./QuickPrompts";
import { toast } from "sonner";
import { Bot, Sparkles, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const {
    sessionId,
    messages,
    language,
    isLoading,
    setLoading,
    setSessionId,
    addMessage,
    updateLastAssistantMessage,
    appendToken,
    setPendingMessageId,
  } = useChatStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = async (query: string) => {
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: query,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    const assistantMessageId = `assistant-${Date.now()}`;
    addMessage({
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    });

    setPendingMessageId(assistantMessageId);
    setLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      await streamChat(
        query,
        sessionId,
        language,
        {
          onSession: (newSessionId) => {
            if (!sessionId) setSessionId(newSessionId);
          },
          onLanguage: (detectedLang) => {
            console.log("Detected language:", detectedLang);
          },
          onProcessGuide: (guide) => {
            updateLastAssistantMessage({ processGuide: guide });
          },
          onToken: (token) => {
            appendToken(token);
          },
          onCitations: (citations) => {
            updateLastAssistantMessage({ citations });
          },
          onDone: (confidence) => {
            updateLastAssistantMessage({ confidence, isStreaming: false });
            setPendingMessageId(null);
            setLoading(false);
          },
          onMessageId: (messageId) => {
            updateLastAssistantMessage({ id: messageId });
          },
          onError: (error) => {
            toast.error(`Chat error: ${error.message}`);
            updateLastAssistantMessage({ isStreaming: false });
            setPendingMessageId(null);
            setLoading(false);
          },
        },
        abortControllerRef.current.signal
      );
    } catch (error: any) {
      if (error.name !== "AbortError") {
        toast.error(`Failed to send message: ${error.message}`);
      }
      updateLastAssistantMessage({ isStreaming: false });
      setPendingMessageId(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={`flex flex-col h-full bg-[#09090b] ${className || ""}`}>
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            {/* Welcome */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              {/* Icon */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Bot className="h-10 w-10 text-blue-400" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                Hello! I'm GEM HR Copilot
              </h2>
              <p className="text-zinc-400 max-w-md leading-relaxed">
                I can help you find information about GEM Corporation HR policies. 
                Ask me anything!
              </p>

              {/* Features badges */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-400">
                  <MessageSquare className="h-3 w-3 text-blue-400" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-400">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span>Instant Answers</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-400">
                  <Sparkles className="h-3 w-3 text-violet-400" />
                  <span>AI Powered</span>
                </div>
              </div>
            </motion.div>

            <QuickPrompts language={language} onSelect={handleSend} />
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
