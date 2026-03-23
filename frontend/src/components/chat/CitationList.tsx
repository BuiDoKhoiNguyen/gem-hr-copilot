"use client";

import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Citation } from "@/lib/stores/chatStore";

interface CitationListProps {
  citations: Citation[];
}

export function CitationList({ citations }: CitationListProps) {
  const { t } = useTranslation();

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-xs font-semibold mb-2 text-gray-500">
        {t("chat.citations")}
      </p>
      <div className="flex flex-col gap-2">
        {citations.map((c) => (
          <a
            key={c.id}
            href={c.url && !c.url.startsWith("local://") ? c.url : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 transition-colors hover:border-blue-500">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                {c.id}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold truncate text-gray-900">
                    {c.title}
                  </p>
                  {c.url && !c.url.startsWith("local://") && (
                    <ExternalLink
                      size={10}
                      className="shrink-0 text-gray-400"
                    />
                  )}
                </div>
                {c.page_number && (
                  <p className="text-xs text-gray-500">
                    {t("common.page")} {c.page_number}
                  </p>
                )}
                <p className="text-xs mt-0.5 line-clamp-2 text-gray-600">
                  {c.excerpt}
                </p>
              </div>
              <div className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                {Math.round(c.relevance_score * 100)}%
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
