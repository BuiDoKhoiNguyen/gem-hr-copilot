"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Message } from "@/lib/stores/chatStore";
import { CitationList } from "./CitationList";
import { ProcessGuideCard } from "./ProcessGuideCard";

interface Props {
  message: Message;
}

/* ─── Typing indicator ─────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

/* ─── Main MessageBubble ──────────────────────────────────────────── */
export default function MessageBubble({ message }: Props) {
  const { t } = useTranslation();
  const isUser = message.role === "user";
  const isEmpty = !message.content && message.isStreaming;

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-200"
            : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-200"
        }`}
      >
        {isUser ? (
          <User size={14} color="#fff" />
        ) : (
          <span className="text-sm">✨</span>
        )}
      </div>

      {/* Bubble */}
      <div className="flex-1 max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-lg shadow-blue-200"
              : "bg-gray-50 border border-gray-200 shadow-sm"
          }`}
          style={{
            borderTopLeftRadius: isUser ? undefined : "4px",
            borderTopRightRadius: isUser ? "4px" : undefined,
          }}
        >
          {/* Process guide above content (assistant only) */}
          {!isUser && message.processGuide && (
            <ProcessGuideCard guide={message.processGuide} />
          )}

          {/* Content */}
          {isEmpty ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-900">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Citations (assistant only) */}
          {!isUser && message.citations && message.citations.length > 0 && (
            <CitationList citations={message.citations} />
          )}
        </div>

        {/* Confidence (assistant only) */}
        {!isUser && !message.isStreaming && message.content && message.confidence != null && message.confidence > 0 && (
          <div className="flex items-center gap-3 mt-1.5 px-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${
                message.confidence > 0.7
                  ? "bg-green-50 text-green-700 border-green-200"
                  : message.confidence > 0.4
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              {Math.round(message.confidence * 100)}% {t("chat.confidence")}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
