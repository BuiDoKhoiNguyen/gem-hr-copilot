"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square, Loader2, Globe, Languages } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
  language: string;
  searchAllLanguages: boolean;
  onLanguageChange: (lang: string) => void;
  onSearchModeChange: (searchAll: boolean) => void;
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading,
  disabled,
  language,
  searchAllLanguages,
  onLanguageChange,
  onSearchModeChange,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-white/10 bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Language & Search Mode Selector */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            {/* <Languages className="w-4 h-4 text-gray-500" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 outline-none focus:border-primary-500/50"
            >
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="ja">🇯🇵 日本語</option>
            </select> */}
          </div>
        </div>

        <div className="flex items-end gap-3 glass-card p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === "ja"
                ? "HR ポリシー、プロセス、福利厚生について質問..."
                : "Hỏi về chính sách HR, quy trình, phúc lợi..."
            }
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 resize-none outline-none text-sm leading-relaxed max-h-[150px]"
          />
          {isLoading ? (
            <button
              onClick={onStop}
              className="shrink-0 w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || disabled}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          {language === "ja"
            ? "GEM HR Copilot は間違いを犯す可能性があります。重要な情報は再確認してください。"
            : "GEM HR Copilot có thể mắc sai sót. Vui lòng kiểm tra lại thông tin quan trọng."}
        </p>
      </div>
    </div>
  );
}
