"use client";

import {
  MessageSquare,
  Brain,
  Search,
  Database,
  Cpu,
  ArrowRight,
  Server,
  Globe,
} from "lucide-react";

const pipelineSteps = [
  { icon: MessageSquare, label: "User Query", sublabel: "VI / JP", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  { icon: Globe, label: "Language Detect", sublabel: '"vi" | "ja"', color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  { icon: Brain, label: "Intent Analysis", sublabel: "LLM Router", color: "text-primary-400", bg: "bg-primary-500/10 border-primary-500/30" },
  { icon: Search, label: "Hybrid Retrieve", sublabel: "BM25 + Dense RRF", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  { icon: Cpu, label: "Rerank", sublabel: "BGE-reranker-v2", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  { icon: Database, label: "Generate", sublabel: "Streaming + Citations", color: "text-accent-400", bg: "bg-accent-500/10 border-accent-500/30" },
];

const techLayers = [
  {
    layer: "Frontend",
    items: [
      { name: "Next.js 14", role: "React Framework" },
      { name: "TailwindCSS", role: "Styling" },
      { name: "Zustand", role: "State Management" },
      { name: "Framer Motion", role: "Animations" },
    ],
    color: "border-primary-500/30 bg-primary-500/5",
  },
  {
    layer: "Backend",
    items: [
      { name: "FastAPI", role: "HTTP + SSE" },
      { name: "LangGraph", role: "RAG Orchestration" },
      { name: "SQLAlchemy", role: "Async ORM" },
      { name: "Alembic", role: "DB Migrations" },
    ],
    color: "border-accent-500/30 bg-accent-500/5",
  },
  {
    layer: "AI / ML",
    items: [
      { name: "Qwen2.5-Instruct", role: "LLM Generation" },
      { name: "BGE-M3", role: "Multilingual Embedding" },
      { name: "BGE-reranker-v2", role: "Result Reranking" },
      { name: "Xinference", role: "Local Model Server" },
    ],
    color: "border-purple-500/30 bg-purple-500/5",
  },
  {
    layer: "Infrastructure",
    items: [
      { name: "Elasticsearch 8", role: "Vector + Full-text" },
      { name: "PostgreSQL 16", role: "RDBMS" },
      { name: "Redis 7", role: "Cache + Sessions" },
      { name: "Docker", role: "Container" },
    ],
    color: "border-yellow-500/30 bg-yellow-500/5",
  },
];

export default function Architecture() {
  return (
    <section id="architecture" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-950/20 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-sm font-medium mb-4">
            <Server className="w-3.5 h-3.5" />
            Kiến trúc hệ thống
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            LangGraph <span className="gradient-text">RAG Pipeline</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Pipeline xử lý 7 bước từ câu hỏi đến câu trả lời có citations
          </p>
        </div>

        {/* Pipeline visualization */}
        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {pipelineSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <div className={`glass-card p-3 sm:p-4 flex flex-col items-center gap-2 min-w-[100px] sm:min-w-[120px] border ${step.bg}`}>
                    <Icon className={`w-6 h-6 ${step.color}`} />
                    <div className="text-center">
                      <div className="text-xs sm:text-sm font-semibold text-white">{step.label}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500">{step.sublabel}</div>
                    </div>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-600 shrink-0 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techLayers.map((layer) => (
            <div key={layer.layer} className={`rounded-2xl border p-5 ${layer.color}`}>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
                {layer.layer}
              </h4>
              <div className="space-y-3">
                {layer.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-200">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.role}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
