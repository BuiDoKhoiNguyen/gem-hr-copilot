"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Page configurations with titles and breadcrumbs
const pageConfig = {
  "/": {
    title: "chat.title",
    breadcrumbs: [{ name: "nav.chat", href: "/", current: true }],
  },
  "/knowledge": {
    title: "knowledge.title",
    breadcrumbs: [
      { name: "nav.chat", href: "/", current: false },
      { name: "nav.knowledge", href: "/knowledge", current: true },
    ],
  },
  "/dialogs": {
    title: "dialogs.title",
    breadcrumbs: [
      { name: "nav.chat", href: "/", current: false },
      { name: "nav.dialogs", href: "/dialogs", current: true },
    ],
  },
};

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const currentPage = pageConfig[pathname as keyof typeof pageConfig] || {
    title: "app.title",
    breadcrumbs: [{ name: "nav.chat", href: "/" }],
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumbs & Title */}
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
            <Home className="h-4 w-4" />
            {currentPage.breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                <Link
                  href={crumb.href}
                  className={cn(
                    "hover:text-gray-900 transition-colors",
                    crumb.current ? "text-blue-600 font-medium" : "text-gray-600"
                  )}
                >
                  {t(crumb.name)}
                </Link>
              </React.Fragment>
            ))}
          </nav>

          {/* Page Title */}
          <h1 className="text-2xl font-bold text-gray-900">
            {t(currentPage.title)}
          </h1>
        </div>

        {/* Right side - Future User Menu */}
        <div className="flex items-center gap-4">
          {/* User Avatar (placeholder for future) */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
        </div>
      </div>
    </header>
  );
}