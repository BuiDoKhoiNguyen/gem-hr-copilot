"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);

    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDark(shouldBeDark);

    // Apply theme to document
    updateTheme(shouldBeDark);
  }, []);

  const updateTheme = (dark: boolean) => {
    const root = document.documentElement;

    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    updateTheme(newTheme);
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "transition-colors",
          collapsed ? "w-8 h-8 p-0" : "w-full justify-start"
        )}
        disabled
      >
        <Sun className="h-4 w-4" />
        {!collapsed && <span className="ml-2">{t("common.theme.toggle")}</span>}
      </Button>
    );
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={cn(
          "transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-50",
          collapsed ? "w-8 h-8 p-0" : "w-full justify-start"
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}

        {!collapsed && (
          <span className="ml-2">
            {isDark ? t("common.theme.dark") : t("common.theme.light")}
          </span>
        )}
      </Button>

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {t("common.theme.toggle")}
        </div>
      )}
    </div>
  );
}