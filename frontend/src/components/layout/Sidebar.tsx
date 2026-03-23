"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Database,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Bot,
  Home,
  Layers,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./LanguageToggleWrapper";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navigation = [
  { name: "nav.chat", href: "/chat", icon: MessageCircle },
  { name: "nav.knowledge", href: "/knowledge", icon: Database },
  { name: "nav.dialogs", href: "/dialogs", icon: Layers, badge: "New" },
];

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 p-0 bg-zinc-900/90 backdrop-blur-sm border border-white/[0.08] hover:bg-zinc-800 text-zinc-400 rounded-xl"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "flex flex-col bg-[#0c0c0f] border-r border-white/[0.06] transition-all duration-300",
          "hidden lg:flex",
          collapsed ? "w-[72px]" : "w-[260px]",
          "lg:relative fixed top-0 left-0 h-full z-50",
          isMobileOpen && "flex w-[260px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Bot className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-white truncate tracking-tight">GEM HR Copilot</h1>
                <p className="text-[11px] text-zinc-500 truncate">AI HR Assistant</p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="hidden lg:flex h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/[0.05] rounded-lg"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")} />
          </Button>

          {/* Mobile Close */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/[0.05] rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Home */}
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group",
              "text-zinc-400 hover:text-white hover:bg-white/[0.05]",
              collapsed && "justify-center px-2"
            )}
          >
            <Home className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="font-medium">Home</span>}
            {collapsed && <Tooltip>Home</Tooltip>}
          </Link>

          <div className="h-px bg-white/[0.06] my-3" />

          {/* Main Nav */}
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group",
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]",
                  collapsed && "justify-center px-2"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                
                <item.icon className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-blue-400" : "group-hover:text-blue-400"
                )} />
                
                {!collapsed && (
                  <>
                    <span className="flex-1 font-medium">{t(item.name)}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {collapsed && (
                  <Tooltip>
                    {t(item.name)}
                    {item.badge && <span className="ml-2 text-emerald-400">({item.badge})</span>}
                  </Tooltip>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/[0.06] p-3 space-y-1">
          <div className={cn(
            "flex items-center rounded-xl p-2 hover:bg-white/[0.05] transition-colors",
            collapsed ? "justify-center" : "justify-start"
          )}>
            <LanguageToggle />
          </div>

          <div className={cn(
            "flex items-center rounded-xl p-2 hover:bg-white/[0.05] transition-colors",
            collapsed ? "justify-center" : "justify-start"
          )}>
            <ThemeToggle collapsed={collapsed} />
          </div>

          {!collapsed && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-xl h-10"
              >
                <Settings className="h-[18px] w-[18px] mr-3" />
                {t("nav.settings")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-xl h-10"
              >
                <HelpCircle className="h-[18px] w-[18px] mr-3" />
                Help & Support
              </Button>

              <div className="pt-3 px-2">
                <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>v1.0.0 - Online</span>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.aside>
    </>
  );
}

// Tooltip component for collapsed state
function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/[0.1]">
      {children}
    </div>
  );
}
