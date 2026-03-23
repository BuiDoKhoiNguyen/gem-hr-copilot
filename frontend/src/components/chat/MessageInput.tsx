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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    onSend(trimmed);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "border-t border-white/10 bg-slate-900/50 backdrop-blur-sm p-4",
        className
      )}
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 bg-slate-800/50 border border-white/10 rounded-2xl p-2 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
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
            className="flex-1 min-h-[44px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-slate-500 py-3"
            rows={1}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Voice Input Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>

            {/* Send Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className={cn(
                  "rounded-xl transition-all",
                  input.trim()
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
                    : "bg-slate-700 text-slate-400"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isLoading ? t("chat.sending") : t("chat.send")}
                </span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-xs text-slate-500 mt-3">
          Nhấn <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd> để gửi,{" "}
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Shift + Enter</kbd> để xuống dòng
        </p>
      </div>
    </div>
  );
}
