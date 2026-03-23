"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Home,
  Bell,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Page configurations with titles and breadcrumbs
const pageConfig = {
  "/chat": {
    title: "chat.title",
    description: "Hỏi đáp chính sách HR với AI",
    breadcrumbs: [{ name: "nav.chat", href: "/chat", current: true }],
  },
  "/knowledge": {
    title: "knowledge.title",
    description: "Quản lý tài liệu và knowledge base",
    breadcrumbs: [
      { name: "nav.chat", href: "/chat", current: false },
      { name: "nav.knowledge", href: "/knowledge", current: true },
    ],
  },
  "/dialogs": {
    title: "dialogs.title",
    description: "Cấu hình các dialog và chatbot",
    breadcrumbs: [
      { name: "nav.chat", href: "/chat", current: false },
      { name: "nav.dialogs", href: "/dialogs", current: true },
    ],
  },
};

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const currentPage = pageConfig[pathname as keyof typeof pageConfig] || {
    title: "app.title",
    description: "AI HR Assistant",
    breadcrumbs: [{ name: "nav.chat", href: "/chat" }],
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumbs & Title */}
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm mb-2">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
            >
              <Home className="h-3.5 w-3.5" />
            </Link>
            {currentPage.breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <Link
                  href={crumb.href}
                  className={cn(
                    "px-2 py-0.5 rounded transition-colors",
                    crumb.current
                      ? "text-blue-400 font-medium bg-blue-500/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {t(crumb.name)}
                </Link>
              </React.Fragment>
            ))}
          </nav>

          {/* Page Title */}
          <div className="flex items-center gap-3">
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={pathname}
              className="text-2xl font-bold text-white"
            >
              {t(currentPage.title)}
            </motion.h1>
            {pathname === "/chat" && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <Sparkles className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-blue-300 font-medium">AI Powered</span>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{currentPage.description}</p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 gap-2"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline text-sm">Tìm kiếm</span>
            <kbd className="hidden md:inline text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-white/10 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
          </Button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">GEM User</p>
              <p className="text-xs text-slate-400">HR Department</p>
            </div>
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white/10">
                <span className="text-white text-sm font-semibold">G</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
