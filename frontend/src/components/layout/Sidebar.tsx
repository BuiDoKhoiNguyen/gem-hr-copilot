"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  MessageCircle,
  Database,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Bot
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        // Base styles
        "flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300",

        // Desktop behavior
        "hidden lg:flex",
        collapsed ? "w-16" : "w-64",

        // Mobile behavior
        "lg:relative fixed top-0 left-0 h-full z-50",
        isMobileOpen ? "flex w-64" : "hidden lg:flex",
      )}>

        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {t("app.title")}
                </h1>
                <p className="text-xs text-gray-500">
                  {t("app.description")}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="hidden lg:flex p-1"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </Button>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobile}
            className="lg:hidden p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4 space-y-2">
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
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors relative group",

                  // Active state
                  isActive ? (
                    "bg-blue-50 text-blue-700 border border-blue-200"
                  ) : (
                    "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  ),

                  // Collapsed state
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-blue-700" : "text-gray-500 group-hover:text-gray-700"
                )} />

                {!collapsed && (
                  <>
                    <span className="flex-1">{t(item.name)}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-700 border-green-200"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {t(item.name)}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          {/* Language Toggle */}
          <div className="flex items-center justify-center">
            <LanguageToggle />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-center">
            <ThemeToggle collapsed={collapsed} />
          </div>

          {/* Settings (future) */}
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              {t("nav.settings")}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}