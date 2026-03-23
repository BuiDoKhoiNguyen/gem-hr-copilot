"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/stores/chatStore";
import { streamChat } from "@/lib/api/chat";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { QuickPrompts } from "./QuickPrompts";
import { toast } from "sonner";

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
    // Add user message immediately
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: query,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // Create placeholder for assistant response
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

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      await streamChat(
        query,
        sessionId,
        language,
        {
          onSession: (newSessionId) => {
            if (!sessionId) {
              setSessionId(newSessionId);
            }
          },
          onLanguage: (detectedLang) => {
            // Language auto-detection - could update UI
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
            updateLastAssistantMessage({
              confidence,
              isStreaming: false,
            });
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

  const handleQuickPromptSelect = (prompt: string) => {
    handleSend(prompt);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={`flex flex-col h-full bg-white ${className || ""}`}>
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <QuickPrompts
              language={language}
              onSelect={handleQuickPromptSelect}
            />
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* Input at bottom */}
      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
