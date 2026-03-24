"use client";

import { Layers } from "lucide-react";

const stack = [
  {
    category: "LLM & AI",
    color: "from-purple-500 to-pink-500",
    items: [
      { name: "Qwen2.5-Instruct", detail: "7B/14B params, Local LLM" },
      { name: "BGE-M3", detail: "Multilingual Embedding" },
      { name: "BGE-reranker-v2-m3", detail: "Cross-encoder Reranker" },
      { name: "Xinference", detail: "Local Model Serving" },
    ],
  },
  {
    category: "Backend",
    color: "from-accent-500 to-emerald-500",
    items: [
      { name: "FastAPI", detail: "Async Python framework" },
      { name: "LangGraph", detail: "RAG Pipeline Orchestration" },
      { name: "SQLAlchemy Async", detail: "Database ORM" },
      { name: "Server-Sent Events", detail: "Streaming Response" },
    ],
  },
  {
    category: "Frontend",
    color: "from-primary-500 to-blue-500",
    items: [
      { name: "Next.js 14", detail: "React App Router" },
      { name: "TailwindCSS", detail: "Utility-first CSS" },
      { name: "Zustand", detail: "Lightweight State" },
      { name: "Framer Motion", detail: "Fluid Animations" },
    ],
  },
  {
    category: "Infrastructure",
    color: "from-yellow-500 to-orange-500",
    items: [
      { name: "Elasticsearch 8", detail: "BM25 + Dense Vector" },
      { name: "PostgreSQL 16", detail: "Sessions + Models" },
      { name: "Redis 7", detail: "Cache + Rate Limit" },
      { name: "Docker Compose", detail: "One-command Deploy" },
    ],
  },
];

export default function TechStack() {
  return (
    <section id="tech" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-4">
            <Layers className="w-3.5 h-3.5" />
            Technology
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Tech Stack <span className="gradient-text">hiện đại</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            100% local, không cần cloud API key, triển khai trên hạ tầng nội bộ
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stack.map((group) => (
            <div key={group.category} className="glass-card overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${group.color}`} />
              <div className="p-5">
                <h4 className="font-bold text-white mb-4">{group.category}</h4>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div key={item.name} className="flex flex-col">
                      <span className="text-sm font-medium text-gray-200">{item.name}</span>
                      <span className="text-xs text-gray-500">{item.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cost/Scale info */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="glass-card p-5 text-center">
            <div className="text-2xl font-bold text-accent-400 mb-1">~$0.00</div>
            <div className="text-sm text-gray-400">Chi phí/query (Local LLM)</div>
          </div>
          <div className="glass-card p-5 text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">1000+</div>
            <div className="text-sm text-gray-400">Concurrent users (ES cluster)</div>
          </div>
          <div className="glass-card p-5 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">5 phút</div>
            <div className="text-sm text-gray-400">Setup với Docker Compose</div>
          </div>
        </div>
      </div>
    </section>
  );
}
