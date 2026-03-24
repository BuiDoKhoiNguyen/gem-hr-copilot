"use client";

import { TrendingDown, Clock, BarChart3, Users, ArrowDown, ArrowUp } from "lucide-react";

const impacts = [
  {
    icon: TrendingDown,
    metric: "70%",
    label: "Giảm câu hỏi lặp lại",
    description: "HR tiết kiệm hàng giờ mỗi ngày để focus vào strategic tasks",
    trend: "down" as const,
    color: "text-accent-400",
    bg: "bg-accent-500/10 border-accent-500/20",
  },
  {
    icon: Clock,
    metric: "< 1 phút",
    label: "Tìm được thông tin",
    description: "Thay vì 15-30 phút đọc handbook hoặc hỏi HR",
    trend: "down" as const,
    color: "text-primary-400",
    bg: "bg-primary-500/10 border-primary-500/20",
  },
  {
    icon: BarChart3,
    metric: "85%+",
    label: "Relevance Accuracy",
    description: "Hybrid search + Reranker đảm bảo kết quả chính xác",
    trend: "up" as const,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    icon: Users,
    metric: "24/7",
    label: "Luôn sẵn sàng",
    description: "Hỗ trợ nhân viên mọi lúc, không phụ thuộc giờ hành chính",
    trend: "up" as const,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
];

const painPoints = [
  { before: "HR nhận 50+ câu hỏi giống nhau mỗi ngày", after: "AI trả lời tự động, HR focus strategic work" },
  { before: "Nhân viên mất 15-30 phút tìm thông tin", after: "Tìm được câu trả lời trong < 1 phút" },
  { before: "Thông tin nằm rải rác: PDF, Confluence, Portal", after: "Một nơi duy nhất, tìm mọi thứ" },
  { before: "Nhân viên mới không biết hỏi ai", after: "AI assistant thân thiện, hỗ trợ 24/7" },
];

export default function Impact() {
  return (
    <section id="impact" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-950/10 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-sm font-medium mb-4">
            <BarChart3 className="w-3.5 h-3.5" />
            Business Impact
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Hiệu quả <span className="gradient-text">đo lường được</span>
          </h2>
        </div>

        {/* Metrics grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {impacts.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="glass-card p-6 text-center">
                <div className={`w-14 h-14 rounded-2xl ${item.bg} border flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-white">{item.metric}</span>
                  {item.trend === "down" ? (
                    <ArrowDown className="w-5 h-5 text-accent-400" />
                  ) : (
                    <ArrowUp className="w-5 h-5 text-accent-400" />
                  )}
                </div>
                <div className="font-medium text-gray-300 mb-2">{item.label}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            );
          })}
        </div>

        {/* Before/After comparison */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-white text-center mb-8">
            Problem → Solution
          </h3>
          <div className="space-y-3">
            {painPoints.map((point, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-3">
                <div className="glass-card p-4 flex items-start gap-3 border-red-500/20 bg-red-500/5">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-400 text-xs font-bold">✕</span>
                  </div>
                  <p className="text-sm text-gray-400">{point.before}</p>
                </div>
                <div className="glass-card p-4 flex items-start gap-3 border-accent-500/20 bg-accent-500/5">
                  <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-accent-400 text-xs font-bold">✓</span>
                  </div>
                  <p className="text-sm text-gray-200">{point.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
