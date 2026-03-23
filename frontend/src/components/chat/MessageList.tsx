"use client";

import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import type { Message } from "@/lib/stores/chatStore";

interface MessageListProps {
  messages: Message[];
  className?: string;
}

export function MessageList({ messages, className }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto ${className || ""}`}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}
