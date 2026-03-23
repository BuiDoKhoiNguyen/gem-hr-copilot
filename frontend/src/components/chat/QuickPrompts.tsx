"use client";

import { useTranslation } from "react-i18next";
import { MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { useQuickPrompts } from "@/lib/hooks/use-chat";
import type { Language } from "@/lib/stores/chatStore";
import { cn } from "@/lib/utils/cn";

interface QuickPromptsProps {
  language: Language;
  onSelect: (prompt: string) => void;
  className?: string;
}

export function QuickPrompts({
  language,
  onSelect,
  className,
}: QuickPromptsProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useQuickPrompts(language);

  // data is typed as string[] when language is provided (see select in hook)
  const prompts = (data || []) as string[];

  // Fallback prompts if API returns empty
  const displayPrompts =
    prompts.length > 0
      ? prompts
      : [
          "Chính sách nghỉ phép năm là gì?",
          "Quy định về làm việc từ xa như thế nào?",
          "Cách đăng ký bảo hiểm y tế?",
          "Quy trình xin nghỉ việc ra sao?",
        ];

  if (isLoading) {
    return (
      <div className={cn("w-full max-w-2xl", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[72px] rounded-xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <MessageSquare className="h-4 w-4" />
        <span>{t("chat.quickPrompts")}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayPrompts.map((prompt, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="relative p-4 bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all cursor-pointer group overflow-hidden"
              onClick={() => onSelect(prompt)}
            >
              {/* Gradient hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex items-start justify-between gap-3">
                <p className="text-sm text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                  {prompt}
                </p>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors group-hover:translate-x-0.5 transform" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
