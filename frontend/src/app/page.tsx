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
  ChevronRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MessageSquare,
    title: "Trả Lời Tức Thì",
    description: "Nhân viên nhận câu trả lời chính xác về chính sách HR trong vài giây, 24/7.",
  },
  {
    icon: Globe2,
    title: "Song Ngữ Việt - Nhật",
    description: "Hỗ trợ đầy đủ tiếng Việt và tiếng Nhật với khả năng tự động nhận diện ngôn ngữ.",
  },
  {
    icon: Database,
    title: "Knowledge Base",
    description: "Hệ thống RAG thông minh giúp quản lý và truy xuất tài liệu chính sách hiệu quả.",
  },
  {
    icon: Shield,
    title: "Bảo Mật Enterprise",
    description: "Dữ liệu được mã hóa và bảo vệ theo tiêu chuẩn bảo mật doanh nghiệp.",
  },
  {
    icon: Zap,
    title: "Phản Hồi Real-time",
    description: "Streaming response mượt mà với độ trễ thấp, trải nghiệm như chat thật.",
  },
  {
    icon: Sparkles,
    title: "AI Tiên Tiến",
    description: "Sử dụng LLM mới nhất với khả năng hiểu ngữ cảnh và trích dẫn nguồn chính xác.",
  },
];

const stats = [
  { value: "90%", label: "Giảm thời gian tra cứu", description: "So với phương pháp truyền thống" },
  { value: "24/7", label: "Hoạt động liên tục", description: "Hỗ trợ mọi lúc mọi nơi" },
  { value: "2", label: "Ngôn ngữ hỗ trợ", description: "Tiếng Việt và Tiếng Nhật" },
  { value: "<2s", label: "Thời gian phản hồi", description: "Trả lời nhanh chóng" },
];

const useCases = [
  {
    icon: Users,
    title: "Nhân Viên Mới",
    description: "Tìm hiểu chính sách công ty nhanh chóng trong quá trình onboarding.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Building2,
    title: "Phòng Nhân Sự",
    description: "Giảm tải câu hỏi lặp lại, tập trung vào các nhiệm vụ chiến lược.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Clock,
    title: "Làm Việc Từ Xa",
    description: "Truy cập thông tin HR bất cứ lúc nào, không cần chờ đợi phản hồi.",
    color: "from-amber-500 to-orange-500",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">GEM HR Copilot</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Tính năng
              </a>
              <a href="#stats" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Thống kê
              </a>
              <a href="#use-cases" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Use Cases
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/chat">
                <Button 
                  variant="ghost" 
                  className="text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/chat">
                <Button className="bg-white text-black hover:bg-zinc-200 font-medium">
                  Bắt đầu ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-500/15 via-indigo-500/10 to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI-Powered HR Assistant</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Trợ lý HR thông minh cho{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                GEM Corporation
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
              Tìm kiếm chính sách HR nhanh chóng với AI. Hỗ trợ song ngữ Tiếng Việt 
              và Tiếng Nhật, giúp nhân viên tiếp cận thông tin mọi lúc mọi nơi.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/chat">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 px-8 h-12 text-base font-medium">
                  Trải nghiệm ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/5 px-8 h-12 text-base bg-transparent"
              >
                <Play className="mr-2 h-4 w-4" />
                Xem demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-px overflow-hidden">
            <div className="rounded-2xl bg-[#0c0c0e] overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <span className="text-xs text-zinc-500 ml-2">GEM HR Copilot</span>
              </div>
              
              {/* Chat Demo */}
              <div className="p-6 space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-sm">
                    <p className="text-sm">Chính sách nghỉ phép năm của công ty là gì?</p>
                  </div>
                </div>
                
                {/* AI Response */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-zinc-800/50 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-md max-w-md">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Theo quy định của GEM Corporation, nhân viên chính thức được hưởng{" "}
                      <span className="text-blue-400 font-medium">12 ngày phép năm</span>. 
                      Số ngày phép sẽ tăng theo thâm niên công tác tại công ty.
                    </p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        95% confidence
                      </span>
                      <span className="text-xs text-zinc-500">Nguồn: HR Policy 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="px-6 py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-white mb-1">{stat.label}</div>
                <div className="text-xs text-zinc-500">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              GEM HR Copilot được thiết kế để giải quyết các thách thức thực tế 
              trong quản lý và tra cứu thông tin nhân sự.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:border-blue-500/40 transition-colors">
                  <feature.icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="px-6 py-24 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ai sử dụng?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              GEM HR Copilot phục vụ mọi thành viên trong tổ chức, 
              từ nhân viên mới đến phòng nhân sự.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${useCase.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <useCase.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{useCase.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{useCase.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-violet-500/5 p-12 text-center overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Sẵn sàng trải nghiệm?</h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Bắt đầu sử dụng GEM HR Copilot ngay hôm nay và khám phá cách AI 
                có thể hỗ trợ công việc HR của bạn.
              </p>
              
              <Link href="/chat">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 px-8 h-12 text-base font-medium">
                  Trải nghiệm miễn phí
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Không cần thẻ tín dụng</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Bắt đầu ngay lập tức</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-medium text-zinc-400">GEM HR Copilot</span>
            </div>
            <p className="text-sm text-zinc-600">
              2026 GEM Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
