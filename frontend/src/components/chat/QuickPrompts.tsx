"use client";

import { Sparkles } from "lucide-react";

interface QuickPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export default function QuickPrompts({ prompts, onSelect }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center px-4">
      {prompts.map((p, i) => (
        <button
          key={i}
          onClick={() => onSelect(p)}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm text-gray-400 border border-white/10 hover:border-primary-500/30 hover:bg-primary-500/10 hover:text-primary-300 transition-all"
        >
          <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary-400" />
          {p}
        </button>
      ))}
    </div>
  );
}
