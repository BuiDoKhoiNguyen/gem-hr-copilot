"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
