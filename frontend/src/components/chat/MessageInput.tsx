"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Loader2, Paperclip, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageInput({
  onSend,
  isLoading = false,
  placeholder,
  className,
}: MessageInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const defaultPlaceholder = placeholder || (t("chat.placeholder") as string);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("border-t border-zinc-800 bg-zinc-900 p-4", className)}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
          {/* Attachment */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-xl shrink-0"
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Input */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={defaultPlaceholder}
            disabled={isLoading}
            className="flex-1 min-h-[40px] max-h-[160px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-zinc-500 py-2.5 text-sm"
            rows={1}
          />

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-xl"
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 rounded-xl transition-all",
                  input.trim()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-zinc-700 text-zinc-500"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-3">
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500 border border-zinc-700">Enter</kbd>
          {" "}để gửi,{" "}
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500 border border-zinc-700">Shift + Enter</kbd>
          {" "}để xuống dòng
        </p>
      </div>
    </div>
  );
}
