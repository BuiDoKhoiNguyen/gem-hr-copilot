"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Language } from "@/lib/stores/chatStore";

interface Props {
  language: Language;
  onChange: (lang: Language) => void;
}

const LANGS: { code: Language; label: string; flag: string; fullName: string }[] = [
  { code: "vi", label: "VI", flag: "🇻🇳", fullName: "Tiếng Việt" },
  { code: "ja", label: "JP", flag: "🇯🇵", fullName: "日本語" },
];

export default function LanguageToggle({ language, onChange }: Props) {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
      }}
    >
      {LANGS.map((l) => {
        const isActive = language === l.code;
        return (
          <button
            key={l.code}
            title={l.fullName}
            onClick={() => onChange(l.code)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              color: isActive ? "#fff" : "var(--text-secondary)",
              zIndex: 1,
            }}
          >
            {isActive && (
              <motion.div
                layoutId="lang-pill"
                className="absolute inset-0 rounded-lg"
                style={{ background: "var(--accent)" }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span style={{ zIndex: 1, position: "relative" }}>
              {l.flag} {l.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
