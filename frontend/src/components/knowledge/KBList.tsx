"use client";

import { useState } from "react";
import { Database, FileText, Globe, Trash2, ChevronRight, Plus, FolderOpen } from "lucide-react";
import type { KnowledgeBase, Document } from "@/types";

interface KBListProps {
  knowledgeBases: KnowledgeBase[];
  documents: Record<string, Document[]>;
  onSelectKB: (kbId: string) => void;
  onDeleteKB: (kbId: string) => void;
  selectedKB: string | null;
}

function getStatusColor(status: string) {
  if (status === "completed") return "text-accent-400 bg-accent-500/10 border-accent-500/20";
  if (status === "processing") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
  return "text-gray-400 bg-white/5 border-white/10";
}

function getSourceIcon(type: string) {
  if (type === "pdf") return <FileText className="w-4 h-4 text-red-400" />;
  if (type === "confluence") return <Globe className="w-4 h-4 text-blue-400" />;
  return <FileText className="w-4 h-4 text-gray-400" />;
}

export default function KBList({ knowledgeBases, documents, onSelectKB, onDeleteKB, selectedKB }: KBListProps) {
  return (
    <div className="space-y-4">
      {knowledgeBases.map((kb) => {
        const docs = documents[kb.id] || [];
        const isSelected = selectedKB === kb.id;
        const totalChunks = docs.reduce((sum, d) => sum + d.chunk_count, 0);

        return (
          <div key={kb.id} className="glass-card overflow-hidden">
            <button
              onClick={() => onSelectKB(isSelected ? "" : kb.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{kb.name}</span>
                </div>
                {kb.description && (
                  <p className="text-xs text-gray-500 truncate">{kb.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                  <span>{docs.length} tài liệu</span>
                  <span>{totalChunks.toLocaleString()} chunks</span>
                  <span>Model: {kb.embed_model}</span>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${isSelected ? "rotate-90" : ""}`} />
            </button>

            {/* Document list */}
            {isSelected && (
              <div className="border-t border-white/10 p-4 space-y-2 bg-white/[0.02]">
                {docs.length === 0 ? (
                  <div className="text-center py-6 text-gray-600">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chưa có tài liệu nào</p>
                  </div>
                ) : (
                  docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      {getSourceIcon(doc.source_type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{doc.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                          <span>{doc.chunk_count} chunks</span>
                          <span>{new Date(doc.created_at).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === "processing" && (
                          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-yellow-500 transition-all"
                              style={{ width: `${doc.progress * 100}%` }}
                            />
                          </div>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(doc.status)}`}>
                          {doc.status === "completed" ? "Hoàn thành" : doc.status === "processing" ? `${(doc.progress * 100).toFixed(0)}%` : doc.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                <div className="flex items-center justify-between pt-2">
                  <button className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Thêm tài liệu
                  </button>
                  <button
                    onClick={() => onDeleteKB(kb.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa KB
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
