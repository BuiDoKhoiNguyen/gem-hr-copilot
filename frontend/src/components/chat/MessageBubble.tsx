"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Message } from "@/lib/stores/chatStore";
import { CitationList } from "./CitationList";
import { ProcessGuideCard } from "./ProcessGuideCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface Props {
  message: Message;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}

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
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
            : "bg-zinc-800 border border-zinc-700"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-zinc-400" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isUser ? "max-w-[80%]" : "max-w-[85%]")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-blue-600 text-white ml-auto w-fit"
              : "bg-zinc-800/50 border border-zinc-700/50"
          )}
        >
          {/* Process guide */}
          {!isUser && message.processGuide && (
            <ProcessGuideCard guide={message.processGuide} />
          )}

          {/* Message content */}
          {isEmpty ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose-chat text-zinc-200">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                  li: ({ children }) => <li className="text-zinc-300">{children}</li>,
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  code: ({ children }) => (
                    <code className="bg-zinc-700/50 px-1.5 py-0.5 rounded text-blue-300 text-sm">{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 overflow-x-auto my-2">{children}</pre>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Citations */}
          {!isUser && message.citations && message.citations.length > 0 && (
            <CitationList citations={message.citations} />
          )}
        </div>

        {/* Actions for assistant */}
        {!isUser && !message.isStreaming && message.content && (
          <div className="flex items-center gap-2 mt-2 px-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-zinc-500 hover:text-white hover:bg-zinc-800 gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
            </Button>

            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800">
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>

            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800">
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>

            {message.confidence != null && message.confidence > 0 && (
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full border ml-auto",
                  message.confidence > 0.7
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : message.confidence > 0.4
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                )}
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
