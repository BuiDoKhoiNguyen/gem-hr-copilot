"use client";

import { FileText, Globe, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Citation } from "@/types";

interface CitationPanelProps {
  citations: Citation[];
}

function SourceIcon({ type }: { type: string }) {
  if (type === "pdf") return <FileText className="w-4 h-4 text-red-400" />;
  if (type === "confluence") return <Globe className="w-4 h-4 text-blue-400" />;
  return <FileText className="w-4 h-4 text-gray-400" />;
}

export default function CitationPanel({ citations }: CitationPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>{citations.length} nguồn tham khảo</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {citations.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <SourceIcon type={c.source_type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-200 truncate">
                    {c.title}
                  </span>
                  {c.page_number && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                      Trang {c.page_number}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{c.excerpt}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-1 flex-1 max-w-[60px] rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent-500"
                      style={{ width: `${c.relevance_score * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-600">
                    {(c.relevance_score * 100).toFixed(0)}% relevance
                  </span>
                </div>
              </div>
              {c.url && c.url !== "#" && (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-primary-400 hover:text-primary-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
