"use client";

import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import type { Message } from "@/lib/stores/chatStore";

interface MessageListProps {
  messages: Message[];
  className?: string;
}

export function MessageList({
  messages,
  className,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 ${className || ""}`}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}
