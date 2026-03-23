"use client";

import React from "react";
import { useChatStore } from "@/lib/stores/chatStore";
import LanguageToggleComponent from "@/components/chat/LanguageToggle";

/**
 * Wrapper component for LanguageToggle that connects to global state
 */
export function LanguageToggle() {
  const { language, setLanguage } = useChatStore();

  return (
    <LanguageToggleComponent
      language={language}
      onChange={setLanguage}
    />
  );
}