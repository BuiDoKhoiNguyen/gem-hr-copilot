"use client";

import {
  Brain,
  MessageCircle,
  ClipboardCheck,
  Search,
  FileText,
  Globe,
  Zap,
  Shield,
  Languages,
} from "lucide-react";

const innovations = [
  {
    icon: Brain,
    title: "LLM Intent Router",
    subtitle: "Thay thế keyword matching",
    description:
      "Sử dụng LLM để phân loại intent thay vì so khớp từ khóa. Hiểu ngữ nghĩa câu hỏi phức tạp như 'Em muốn xin nghỉ 3 ngày tuần sau thì làm sao?'",
    color: "primary",
    badge: "Innovation #1",
    demo: {
      before: 'if "nghỉ phép" in query: → leave_request',
      after: "LLM phân tích → intent: process_guide + context: leave_request",
    },
  },
  {
    icon: MessageCircle,
    title: "Conversational Memory",
    subtitle: "Context trong session",
    description:
      "Nhớ context hội thoại, xử lý follow-up tự nhiên. Khi user hỏi 'Còn cho người thân thì sao?' → AI hiểu đang nói về bảo hiểm từ câu trước.",
    color: "accent",
    badge: "Innovation #2",
    demo: {
      before: "Mỗi câu hỏi độc lập, không nhớ ngữ cảnh",
      after: 'Memory + Query Rewriting → Hiểu "thế còn" liên quan đến chủ đề trước',
    },
  },
  {
    icon: ClipboardCheck,
    title: "Interactive Process Checklist",
    subtitle: "Track progress step-by-step",
    description:
      "Hướng dẫn quy trình dạng checklist tương tác với progress bar, direct links đến forms và documents. User không bị lost ở bước nào.",
    color: "blue",
    badge: "Innovation #3",
    demo: {
      before: "Hướng dẫn quy trình dạng text dài, khó theo dõi",
      after: "Checklist interactive ☐→☑ + Progress bar + Action links",
    },
  },
];

const features = [
  {
    icon: Search,
    title: "Semantic Search",
    description: "Hybrid BM25 + Dense vector search với RRF fusion, hiểu ngữ nghĩa thay vì chỉ keyword",
  },
  {
    icon: FileText,
    title: "Citation Transparency",
    description: "Mỗi câu trả lời kèm nguồn trích dẫn rõ ràng: trang PDF, link Confluence",
  },
  {
    icon: Languages,
    title: "Bilingual VI & JP",
    description: "Tự động detect ngôn ngữ, hỗ trợ song song Tiếng Việt và 日本語",
  },
  {
    icon: Zap,
    title: "Real-time Streaming",
    description: "SSE streaming cho phản hồi tức thì, không phải chờ toàn bộ câu trả lời",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Local LLM, dữ liệu không ra ngoài hạ tầng công ty. No PII in prompts",
  },
  {
    icon: Globe,
    title: "Multi-source Ingestion",
    description: "PDF, Confluence, URL — nhập tài liệu từ mọi nguồn vào knowledge base",
  },
];

function getColorClasses(color: string) {
  const map: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    primary: {
      bg: "bg-primary-500/10",
      border: "border-primary-500/30",
      text: "text-primary-400",
      glow: "group-hover:shadow-primary-500/10",
    },
    accent: {
      bg: "bg-accent-500/10",
      border: "border-accent-500/30",
      text: "text-accent-400",
      glow: "group-hover:shadow-accent-500/10",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
      glow: "group-hover:shadow-blue-500/10",
    },
  };
  return map[color] || map.primary;
}

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Điểm khác biệt
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            3 Innovation <span className="gradient-text">đột phá</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Không chỉ là chatbot thông thường — GEM HR Copilot mang đến trải nghiệm AI HR thực sự thông minh
          </p>
        </div>

        {/* Innovation cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {innovations.map((item, i) => {
            const Icon = item.icon;
            const colors = getColorClasses(item.color);
            return (
              <div
                key={i}
                className={`group glass-card p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-xl ${colors.glow}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{item.subtitle}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {item.description}
                </p>
                {/* Before/After */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
                      Before
                    </span>
                    <span className="text-gray-500">{item.demo.before}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-medium">
                      After
                    </span>
                    <span className="text-gray-300">{item.demo.after}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Other features grid */}
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-white">Và nhiều tính năng khác</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="glass-card-hover p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
