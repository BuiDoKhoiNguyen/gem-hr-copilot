"use client";

import { useTranslation } from "react-i18next";
import { MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useQuickPrompts } from "@/lib/hooks/use-chat";
import type { Language } from "@/lib/stores/chatStore";
import { cn } from "@/lib/utils/cn";

interface QuickPromptsProps {
  language: Language;
  onSelect: (prompt: string) => void;
  className?: string;
}

export function QuickPrompts({ language, onSelect, className }: QuickPromptsProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useQuickPrompts(language);

  const prompts = (data || []) as string[];

  const displayPrompts = prompts.length > 0
    ? prompts
    : [
        "What is the annual leave policy?",
        "How does remote work policy work?",
        "How to register for health insurance?",
        "What is the resignation process?",
      ];

  if (isLoading) {
    return (
      <div className={cn("w-full max-w-2xl", className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[72px] rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
        <MessageSquare className="h-4 w-4" />
        <span>{t("chat.quickPrompts")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayPrompts.map((prompt, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(prompt)}
            className="group relative p-4 text-left rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-zinc-300 group-hover:text-white transition-colors leading-relaxed">
                {prompt}
              </p>
              <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-blue-400 shrink-0 mt-0.5 transition-all group-hover:translate-x-0.5" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
