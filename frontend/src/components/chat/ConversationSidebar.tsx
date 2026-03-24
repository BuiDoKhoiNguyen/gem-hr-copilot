"use client";

import { useState } from "react";
import {
  MessageSquarePlus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { clsx } from "clsx";
import { useChatStore } from "@/lib/stores/chatStore";

function formatRelativeTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return "Vừa xong";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} phút trước`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} giờ trước`;
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
}

export default function ConversationSidebar() {
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeConversationId);
  const loadingHistoryForId = useChatStore((s) => s.loadingHistoryForId);
  const newConversation = useChatStore((s) => s.newConversation);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const sorted = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      renameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="hidden sm:flex flex-col w-[260px] shrink-0 border-r border-white/10 bg-gray-950">
      <div className="p-3 border-b border-white/10">
        <button
          type="button"
          onClick={() => newConversation()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary-500/15 border border-primary-500/30 text-primary-300 text-sm font-medium hover:bg-primary-500/25 transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Cuộc trò chuyện mới
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sorted.map((c) => {
          const active = c.id === activeId;
          const loading = loadingHistoryForId === c.id;
          return (
            <div
              key={c.id}
              className={clsx(
                "group rounded-xl border transition-colors",
                active
                  ? "bg-primary-500/15 border-primary-500/30"
                  : "border-transparent hover:bg-white/5"
              )}
            >
              {editingId === c.id ? (
                <div className="p-2 flex items-center gap-1">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-primary-500/40"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="p-1.5 rounded-lg text-accent-400 hover:bg-white/10"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-white/10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void selectConversation(c.id)}
                  className="w-full text-left px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={clsx(
                        "text-sm line-clamp-2 flex-1",
                        active ? "text-white font-medium" : "text-gray-300"
                      )}
                    >
                      {c.title}
                    </span>
                    {loading && (
                      <Loader2 className="w-3.5 h-3.5 shrink-0 text-primary-400 animate-spin mt-0.5" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-600">
                      {formatRelativeTime(c.updatedAt)}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(c.id, c.title);
                        }}
                        className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/10"
                        aria-label="Đổi tên"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(c.id);
                        }}
                        className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                        aria-label="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
