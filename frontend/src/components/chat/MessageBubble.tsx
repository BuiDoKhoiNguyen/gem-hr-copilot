"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Message } from "@/lib/stores/chatStore";
import { CitationList } from "./CitationList";
import { ProcessGuideCard } from "./ProcessGuideCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  message: Message;
}

/* ─── Typing indicator ─────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <motion.span
        className="w-2 h-2 rounded-full bg-blue-400"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="w-2 h-2 rounded-full bg-blue-400"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />
      <motion.span
        className="w-2 h-2 rounded-full bg-blue-400"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
}

/* ─── Main MessageBubble ──────────────────────────────────────────── */
export default function MessageBubble({ message }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isEmpty = !message.content && message.isStreaming;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20"
            : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20"
        }`}
      >
        {isUser ? (
          <User size={16} color="#fff" />
        ) : (
          <Sparkles size={16} color="#fff" />
        )}
      </div>

      {/* Bubble */}
      <div className={`flex-1 ${isUser ? "max-w-[75%]" : "max-w-[85%]"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-auto"
              : "bg-slate-800/50 border border-white/10"
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
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none text-slate-200">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-slate-300">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">{children}</strong>
                  ),
                  code: ({ children }) => (
                    <code className="bg-slate-700/50 px-1.5 py-0.5 rounded text-blue-300 text-xs">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-slate-900 border border-white/10 rounded-lg p-3 overflow-x-auto my-2">
                      {children}
                    </pre>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Citations (assistant only) */}
          {!isUser && message.citations && message.citations.length > 0 && (
            <CitationList citations={message.citations} />
          )}
        </div>

        {/* Actions & Confidence (assistant only) */}
        {!isUser && !message.isStreaming && message.content && (
          <div className="flex items-center gap-3 mt-2 px-1">
            {/* Copy Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-slate-400 hover:text-white hover:bg-white/10"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5 text-xs">{copied ? "Copied" : "Copy"}</span>
            </Button>

            {/* Confidence */}
            {message.confidence != null && message.confidence > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  message.confidence > 0.7
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : message.confidence > 0.4
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                }`}
              >
                {Math.round(message.confidence * 100)}% {t("chat.confidence")}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
