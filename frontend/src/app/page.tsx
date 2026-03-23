"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  Database,
  Globe2,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  Building2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "Trả Lời Tức Thì",
    description:
      "Nhân viên có thể hỏi về chính sách HR và nhận câu trả lời ngay lập tức, 24/7.",
  },
  {
    icon: Globe2,
    title: "Song Ngữ Việt - Nhật",
    description:
      "Hỗ trợ đầy đủ tiếng Việt và tiếng Nhật, tự động nhận diện ngôn ngữ.",
  },
  {
    icon: Database,
    title: "Knowledge Base",
    description:
      "Quản lý tài liệu chính sách một cách dễ dàng với hệ thống RAG thông minh.",
  },
  {
    icon: Shield,
    title: "Bảo Mật Cao",
    description:
      "Dữ liệu được bảo vệ với tiêu chuẩn enterprise, đảm bảo an toàn thông tin.",
  },
  {
    icon: Zap,
    title: "Xử Lý Nhanh",
    description:
      "Streaming response với độ trễ thấp, trải nghiệm mượt mà như chat thật.",
  },
  {
    icon: Sparkles,
    title: "AI Tiên Tiến",
    description:
      "Sử dụng công nghệ LLM mới nhất với khả năng hiểu ngữ cảnh sâu.",
  },
];

const stats = [
  { value: "90%", label: "Giảm thời gian tìm kiếm" },
  { value: "24/7", label: "Hỗ trợ liên tục" },
  { value: "2 ngôn ngữ", label: "Việt & Nhật" },
  { value: "< 2s", label: "Thời gian phản hồi" },
];

const useCases = [
  {
    icon: Users,
    title: "Nhân Viên Mới",
    description: "Onboarding nhanh chóng với thông tin chính sách đầy đủ",
  },
  {
    icon: Building2,
    title: "Phòng HR",
    description: "Giảm tải câu hỏi lặp lại, tập trung vào công việc chiến lược",
  },
  {
    icon: Clock,
    title: "Mọi Lúc",
    description: "Truy cập thông tin bất cứ lúc nào, không cần chờ đợi",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">GEM HR Copilot</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition-colors">
                Tính năng
              </a>
              <a href="#use-cases" className="hover:text-white transition-colors">
                Use Cases
              </a>
              <a href="#stats" className="hover:text-white transition-colors">
                Thống kê
              </a>
            </div>
            <Link href="/chat">
              <Button
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white hover:text-black transition-all"
              >
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>AI-Powered HR Assistant</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
              Trợ lý HR thông minh
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                cho GEM Corporation
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 text-pretty">
              Tìm kiếm chính sách HR nhanh chóng với AI. Hỗ trợ song ngữ Tiếng Việt và
              Tiếng Nhật, giúp nhân viên tiếp cận thông tin mọi lúc mọi nơi.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-base font-medium"
                >
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base"
                >
                  Tìm hiểu thêm
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-1">
            <div className="rounded-xl bg-[#111] overflow-hidden">
              {/* Mock Chat UI */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-gray-400">GEM HR Copilot</span>
              </div>
              <div className="p-6 space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-xs">
                    <p className="text-sm">Chính sách nghỉ phép năm là gì?</p>
                  </div>
                </div>
                {/* AI Response */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm max-w-md">
                    <p className="text-sm text-gray-300">
                      Theo quy định của GEM Corporation, nhân viên chính thức được hưởng
                      <span className="text-blue-400 font-medium"> 12 ngày phép năm</span>.
                      Số ngày phép tăng theo thâm niên công tác...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="px-6 py-20 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              GEM HR Copilot được thiết kế để giải quyết các thách thức thực tế trong quản
              lý nhân sự
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/[0.02] border-white/10 p-6 h-full hover:bg-white/[0.04] hover:border-white/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="px-6 py-20 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ai sử dụng?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              GEM HR Copilot phục vụ mọi thành viên trong tổ chức
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                  <useCase.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-400">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-blue-500/10 to-purple-500/10 p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sẵn sàng trải nghiệm?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Bắt đầu sử dụng GEM HR Copilot ngay hôm nay và khám phá cách AI có thể hỗ
              trợ công việc HR của bạn.
            </p>
            <Link href="/chat">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-base font-medium"
              >
                Trải nghiệm miễn phí
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Không cần thẻ tín dụng</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Bắt đầu ngay lập tức</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">GEM HR Copilot</span>
            </div>
            <p className="text-sm text-gray-500">
              2026 GEM Corporation. AI-powered HR Assistant.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
