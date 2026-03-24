"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

const qaItems = [
  {
    question: "Khác gì so với RAGFlow hay các chatbot HR khác?",
    answer:
      "GEM HR Copilot có 3 điểm khác biệt chính: (1) LLM Intent Router - hiểu ngữ nghĩa thay vì keyword matching, (2) Conversational Memory - nhớ context hội thoại, (3) Interactive Process Checklist - hướng dẫn quy trình dạng tương tác. Ngoài ra, hệ thống hỗ trợ bilingual (Tiếng Việt & Tiếng Nhật) và chạy hoàn toàn local.",
  },
  {
    question: "Accuracy (độ chính xác) như thế nào?",
    answer:
      "Sử dụng Hybrid Search (BM25 + Dense Vector) kết hợp BGE-reranker-v2-m3, hệ thống đạt 85%+ relevance accuracy. Mỗi câu trả lời đều kèm citation (trích dẫn nguồn) để user verify.",
  },
  {
    question: "Có scale được cho tổ chức lớn không?",
    answer:
      "Có. Backend sử dụng async FastAPI + Elasticsearch cluster, có thể handle 1000+ concurrent users. Kiến trúc microservice-ready, dễ dàng scale horizontal.",
  },
  {
    question: "Bảo mật dữ liệu như thế nào?",
    answer:
      "Toàn bộ hệ thống chạy on-premise, dữ liệu không ra ngoài hạ tầng công ty. Không có PII trong prompts. Local LLM = zero data leakage.",
  },
  {
    question: "Chi phí vận hành?",
    answer:
      "Với Local LLM (Xinference), chi phí per query gần $0. Nếu dùng cloud API (GPT-4), ~$0.01/query. Infrastructure chỉ cần 1 server 16GB RAM.",
  },
];

export default function QASection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="qa" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Q&A
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Câu hỏi <span className="gradient-text">thường gặp</span>
          </h2>
          <p className="text-gray-400">Các câu hỏi BGK có thể hỏi</p>
        </div>

        <div className="space-y-3">
          {qaItems.map((item, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-gray-200 pr-4">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 -mt-2">
                  <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
