"use client";

import { BarChart3, Database, FileText, Layers } from "lucide-react";
import type { IngestStats as IngestStatsType, KnowledgeBase, Document } from "@/types";

interface IngestStatsProps {
  stats: IngestStatsType;
  knowledgeBases: KnowledgeBase[];
  allDocuments: Record<string, Document[]>;
}

export default function IngestStats({ stats, knowledgeBases, allDocuments }: IngestStatsProps) {
  const totalDocs = Object.values(allDocuments).flat().length;
  const completedDocs = Object.values(allDocuments).flat().filter((d) => d.status === "completed").length;

  const items = [
    { icon: Database, label: "Knowledge Bases", value: knowledgeBases.length, color: "text-primary-400 bg-primary-500/10 border-primary-500/20" },
    { icon: FileText, label: "Tài liệu", value: `${completedDocs}/${totalDocs}`, color: "text-accent-400 bg-accent-500/10 border-accent-500/20" },
    { icon: Layers, label: "Tổng chunks", value: stats.total_chunks.toLocaleString(), color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    { icon: BarChart3, label: "ES Index", value: stats.index, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{item.value}</div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
