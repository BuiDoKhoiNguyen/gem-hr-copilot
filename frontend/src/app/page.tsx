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
  Search,
  FileText,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MessageSquare,
    title: "Instant Answers",
    titleVi: "Tra Loi Tuc Thi",
    description: "Get accurate HR policy answers in seconds, available 24/7.",
  },
  {
    icon: Globe2,
    title: "Bilingual Support",
    titleVi: "Song Ngu Viet - Nhat",
    description: "Full Vietnamese and Japanese support with automatic language detection.",
  },
  {
    icon: Database,
    title: "Knowledge Base",
    titleVi: "Co So Kien Thuc",
    description: "Smart RAG system for efficient policy document management and retrieval.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    titleVi: "Bao Mat Doanh Nghiep",
    description: "Data encrypted and protected according to enterprise security standards.",
  },
  {
    icon: Zap,
    title: "Real-time Response",
    titleVi: "Phan Hoi Real-time",
    description: "Smooth streaming responses with low latency for natural chat experience.",
  },
  {
    icon: Sparkles,
    title: "Advanced AI",
    titleVi: "AI Tien Tien",
    description: "Latest LLM with context understanding and accurate source citations.",
  },
];

const stats = [
  { value: "90%", label: "Time Saved", sublabel: "vs traditional methods" },
  { value: "24/7", label: "Always Available", sublabel: "support anytime" },
  { value: "2", label: "Languages", sublabel: "Vietnamese & Japanese" },
  { value: "<2s", label: "Response Time", sublabel: "fast answers" },
];

const useCases = [
  {
    icon: Users,
    title: "New Employees",
    description: "Quickly learn company policies during onboarding process.",
  },
  {
    icon: Building2,
    title: "HR Department",
    description: "Reduce repetitive questions, focus on strategic tasks.",
  },
  {
    icon: Clock,
    title: "Remote Work",
    description: "Access HR information anytime, no waiting for responses.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white tracking-tight">GEM HR Copilot</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#stats" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Stats
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
                  Sign In
                </Button>
              </Link>
              <Link href="/chat">
                <Button className="bg-white text-zinc-900 hover:bg-zinc-100 font-medium shadow-lg shadow-white/10">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-400 mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI-Powered HR Assistant</span>
              <span className="text-zinc-600">|</span>
              <span className="text-blue-400">Now Available</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              <span className="text-white">Smart HR Assistant for</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                GEM Corporation
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {"Search HR policies instantly with AI. Bilingual support for Vietnamese and Japanese, helping employees access information anytime, anywhere."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/chat">
                <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 px-8 h-12 text-base font-medium shadow-xl shadow-white/10 group">
                  Start Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/10 text-white hover:bg-white/5 px-8 h-12 text-base bg-transparent backdrop-blur-sm"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
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
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-50" />
            
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c0f] overflow-hidden shadow-2xl">
              {/* Window Controls */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] text-xs text-zinc-500">
                    <Search className="h-3 w-3" />
                    <span>GEM HR Copilot</span>
                  </div>
                </div>
                <div className="w-16" />
              </div>
              
              {/* Chat Demo */}
              <div className="p-6 space-y-5">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-sm shadow-lg shadow-blue-500/20">
                    <p className="text-sm">What is the company annual leave policy?</p>
                  </div>
                </div>
                
                {/* AI Response */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="space-y-3 max-w-md">
                    <div className="bg-white/[0.03] border border-white/[0.06] px-4 py-3 rounded-2xl rounded-tl-md">
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        According to GEM Corporation policy, permanent employees are entitled to{" "}
                        <span className="text-blue-400 font-medium">12 days of annual leave</span>. 
                        Leave days increase based on tenure at the company.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        95% confidence
                      </span>
                      <span className="text-xs text-zinc-600 flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        Source: HR Policy 2024
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="px-6 py-24 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-white mb-1">{stat.label}</div>
                <div className="text-xs text-zinc-500">{stat.sublabel}</div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium mb-4">
              <Zap className="h-3 w-3" />
              Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
              Everything you need for HR support
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              GEM HR Copilot is designed to solve real challenges in 
              managing and searching HR information.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:border-blue-500/40 group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all">
                  <feature.icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 font-medium mb-4">
              <Users className="h-3 w-3" />
              Use Cases
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">Who uses GEM HR Copilot?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Serving all members of the organization, from new employees to HR department.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center hover:border-white/[0.1] transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
                  <useCase.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{useCase.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-50" />
            
            <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-12 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-blue-500/15 to-transparent blur-3xl pointer-events-none" />
              
              <div className="relative">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">Ready to get started?</h2>
                <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                  Start using GEM HR Copilot today and discover how AI can support your HR work.
                </p>
                
                <Link href="/chat">
                  <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 px-8 h-12 text-base font-medium shadow-xl shadow-white/10 group">
                    Try for Free
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-6 mt-8 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Start immediately</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-medium text-zinc-400">GEM HR Copilot</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-600">
              <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Contact</a>
            </div>
            <p className="text-sm text-zinc-600">
              2026 GEM Corporation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
