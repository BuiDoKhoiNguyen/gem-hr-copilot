"use client";

import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";

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

  if (isLoading || prompts.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MessageSquare className="h-4 w-4" />
        <span>{t("chat.quickPrompts")}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {prompts.map((prompt, index) => (
          <Card
            key={index}
            className="p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
            onClick={() => onSelect(prompt)}
          >
            <p className="text-sm text-gray-700 group-hover:text-blue-700">
              {prompt}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
