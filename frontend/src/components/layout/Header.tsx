"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home, Bell, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const pageConfig: Record<string, {
  title: string;
  description: string;
  breadcrumbs: { name: string; href: string; current?: boolean }[];
}> = {
  "/chat": {
    title: "chat.title",
    description: "HR Policy Q&A with AI",
    breadcrumbs: [{ name: "nav.chat", href: "/chat", current: true }],
  },
  "/knowledge": {
    title: "knowledge.title",
    description: "Document and knowledge base management",
    breadcrumbs: [{ name: "nav.knowledge", href: "/knowledge", current: true }],
  },
  "/dialogs": {
    title: "dialogs.title",
    description: "Configure dialogs and chatbot",
    breadcrumbs: [{ name: "nav.dialogs", href: "/dialogs", current: true }],
  },
};

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const currentPage = pageConfig[pathname] || {
    title: "app.title",
    description: "AI HR Assistant",
    breadcrumbs: [],
  };

  return (
    <header className="h-16 bg-[#0c0c0f] border-b border-white/[0.06] px-6 flex items-center justify-between shrink-0">
      {/* Left - Breadcrumbs & Title */}
      <div className="flex items-center gap-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm">
          <Link
            href="/"
            className="text-zinc-500 hover:text-white transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-white/[0.05]"
          >
            <Home className="h-4 w-4" />
          </Link>
          {currentPage.breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
              <Link
                href={crumb.href}
                className={cn(
                  "px-2 py-1 rounded-lg transition-colors font-medium",
                  crumb.current
                    ? "text-white"
                    : "text-zinc-500 hover:text-white"
                )}
              >
                {t(crumb.name)}
              </Link>
            </React.Fragment>
          ))}
        </nav>

        {/* AI Badge */}
        {pathname === "/chat" && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span className="text-[11px] text-blue-400 font-medium">AI Powered</span>
          </div>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-zinc-500 hover:text-white hover:bg-white/[0.05] gap-2 px-3 rounded-xl"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline text-sm">Search</span>
          <kbd className="hidden md:inline text-[10px] text-zinc-600 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">
            ⌘K
          </kbd>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-zinc-500 hover:text-white hover:bg-white/[0.05] relative rounded-xl"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#0c0c0f]" />
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.08] mx-1" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-white">GEM User</p>
            <p className="text-[11px] text-zinc-500">HR Department</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-white/[0.08] shadow-lg shadow-blue-500/20">
              <span className="text-white text-sm font-semibold">G</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#0c0c0f]" />
          </div>
        </div>
      </div>
    </header>
  );
}
