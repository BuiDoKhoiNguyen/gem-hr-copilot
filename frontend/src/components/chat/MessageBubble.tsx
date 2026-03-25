"use client";

import { useState } from "react";
import { Bot, User, Loader2, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/types";
import CitationPanel from "./CitationPanel";
import ProcessChecklist from "./ProcessChecklist";

interface MessageBubbleProps {
  message: ChatMessage;
  onToggleStep: (messageId: string, stepIndex: number) => void;
  onFeedback?: (messageId: string, rating: -1 | 0 | 1, reason?: string) => Promise<boolean>;
}

export default function MessageBubble({ message, onToggleStep, onFeedback }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [feedbackGiven, setFeedbackGiven] = useState<-1 | 0 | 1 | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (rating: -1 | 1) => {
    if (!onFeedback || feedbackGiven !== null || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await onFeedback(message.id, rating);
      if (success) {
        setFeedbackGiven(rating);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? "" : ""} animate-fade-in`}>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-gray-700"
            : "bg-gradient-to-br from-primary-500 to-accent-500"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-300" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <span className="text-xs text-gray-500">
          {isUser ? "Bạn" : "HR Copilot"}
        </span>

        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary-500/15 border border-primary-500/20"
              : "bg-white/5 border border-white/10"
          }`}
        >
          {message.content ? (
            <div className="markdown-content text-sm text-gray-200">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : message.isStreaming ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Đang suy nghĩ...</span>
            </div>
          ) : null}

          {message.isStreaming && message.content && (
            <span className="inline-block w-1.5 h-4 bg-primary-400 animate-typing ml-0.5 align-middle rounded-sm" />
          )}
        </div>

        {/* Process Checklist */}
        {message.process_steps && message.process_steps.length > 0 && (
          <ProcessChecklist
            steps={message.process_steps}
            messageId={message.id}
            onToggle={onToggleStep}
          />
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <CitationPanel citations={message.citations} />
        )}

        {/* Feedback buttons for assistant messages */}
        {!isUser && !message.isStreaming && message.content && onFeedback && (
          <div className="flex items-center gap-2 mt-2">
            {feedbackGiven !== null ? (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Check className="w-3.5 h-3.5 text-accent-400" />
                <span>
                  {feedbackGiven === 1 ? "Cảm ơn phản hồi!" : "Cảm ơn! Chúng tôi sẽ cải thiện."}
                </span>
              </div>
            ) : (
              <>
                <span className="text-xs text-gray-600">Phản hồi:</span>
                <button
                  onClick={() => handleFeedback(1)}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-lg hover:bg-accent-500/20 text-gray-500 hover:text-accent-400 transition-all disabled:opacity-50"
                  title="Hữu ích"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleFeedback(-1)}
                  disabled={isSubmitting}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all disabled:opacity-50"
                  title="Không hữu ích"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
