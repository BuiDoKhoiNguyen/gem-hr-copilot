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
  Sparkles,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "./LanguageToggleWrapper";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navigation = [
  {
    name: "nav.chat",
    href: "/chat",
    icon: MessageCircle,
    badge: null,
  },
  {
    name: "nav.knowledge",
    href: "/knowledge",
    icon: Database,
    badge: null,
  },
  {
    name: "nav.dialogs",
    href: "/dialogs",
    icon: Bot,
    badge: "New" as const,
  },
];

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900/80 backdrop-blur-sm border border-white/10 hover:bg-slate-800 text-white"
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
            onClick={toggleMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={cn(
          // Base styles
          "flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 border-r border-white/10 transition-all duration-300",

          // Desktop behavior
          "hidden lg:flex",
          collapsed ? "w-[72px]" : "w-[260px]",

          // Mobile behavior
          "lg:relative fixed top-0 left-0 h-full z-50",
          isMobileOpen ? "flex w-[260px]" : "hidden lg:flex"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-base font-bold text-white">
                  {t("app.title")}
                </h1>
                <p className="text-[11px] text-slate-400 leading-tight">
                  AI HR Assistant
                </p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </Button>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {/* Home Link */}
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all relative group",
              "text-slate-400 hover:text-white hover:bg-white/5",
              collapsed && "justify-center px-2"
            )}
          >
            <Home className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Trang chủ</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl border border-white/10">
                Trang chủ
              </div>
            )}
          </Link>

          <div className="h-px bg-white/5 my-3" />

          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  // Base styles
                  "flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all relative group",

                  // Active state
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5",

                  // Collapsed state
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-blue-400" : "group-hover:text-blue-400"
                  )}
                />

                {!collapsed && (
                  <>
                    <span className="flex-1 font-medium">{t(item.name)}</span>
                    {item.badge && (
                      <Badge className="text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 font-medium">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl border border-white/10">
                    {t(item.name)}
                    {item.badge && (
                      <span className="ml-2 text-emerald-400">{item.badge}</span>
                    )}
                  </div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/5 p-3 space-y-2">
          {/* Language Toggle */}
          <div
            className={cn(
              "flex items-center rounded-xl p-2 hover:bg-white/5 transition-colors",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <LanguageToggle />
          </div>

          {/* Theme Toggle */}
          <div
            className={cn(
              "flex items-center rounded-xl p-2 hover:bg-white/5 transition-colors",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <ThemeToggle collapsed={collapsed} />
          </div>

          {/* Settings */}
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              <Settings className="h-4 w-4 mr-3" />
              {t("nav.settings")}
            </Button>
          )}

          {/* Version Badge */}
          {!collapsed && (
            <div className="pt-2 px-2">
              <div className="text-[10px] text-slate-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>v1.0.0 - Online</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
