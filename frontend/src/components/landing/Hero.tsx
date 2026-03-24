"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Sparkles, ArrowRight, Zap } from "lucide-react";

const typingTexts = [
  "Quy trình xin nghỉ phép như thế nào?",
  "Chính sách bảo hiểm BSH bao gồm gì?",
  "有給休暇の申請方法は？",
  "Hướng dẫn claim bảo hiểm y tế",
  "残業申請の手順は？",
];

export default function Hero() {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = typingTexts[textIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting && charIndex < currentText.length) {
          setCharIndex(charIndex + 1);
        } else if (!isDeleting && charIndex === currentText.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && charIndex > 0) {
          setCharIndex(charIndex - 1);
        } else if (isDeleting && charIndex === 0) {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % typingTexts.length);
        }
      },
      isDeleting ? 30 : 60
    );
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects — static radial gradients, no blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.1)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          AI SPARK Hackathon 2025
          <Zap className="w-4 h-4 text-yellow-400" />
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
          <span className="text-white">Trợ lý AI cho </span>
          <br />
          <span className="gradient-text">HR thông minh</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-8 animate-slide-up leading-relaxed">
          Giải pháp AI giúp nhân viên tìm kiếm thông tin HR trong{" "}
          <span className="text-white font-medium">&lt; 1 phút</span>,
          giảm <span className="text-white font-medium">70%</span> câu hỏi lặp lại cho bộ phận Nhân sự.
          Hỗ trợ <span className="text-primary-400 font-medium">Tiếng Việt</span> &{" "}
          <span className="text-accent-400 font-medium">日本語</span>.
        </p>

        {/* Typing demo */}
        <div className="max-w-2xl mx-auto mb-10 animate-slide-up">
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-gray-300">
                {typingTexts[textIndex].slice(0, charIndex)}
              </span>
              <span className="inline-block w-0.5 h-5 bg-primary-400 ml-0.5 animate-typing align-middle" />
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <Link
            href="/chat"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
          >
            <MessageSquare className="w-5 h-5" />
            Thử ngay Chat AI
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/20 text-gray-300 font-medium hover:bg-white/5 hover:text-white transition-all"
          >
            Xem tính năng
          </a>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto animate-fade-in">
          {[
            { label: "Thời gian tìm thông tin", value: "< 1 phút" },
            { label: "Giảm câu hỏi lặp lại", value: "70%" },
            { label: "Hoạt động 24/7", value: "Always On" },
            { label: "Ngôn ngữ hỗ trợ", value: "VI & JP" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
