"use client";

import { useState } from "react";
import { Bot, User, ChevronRight, CheckCircle2, Circle, ExternalLink, Sparkles } from "lucide-react";

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  innovation: string;
  conversation: {
    role: "user" | "assistant";
    content: string;
    highlight?: string;
    checklist?: { text: string; completed: boolean; link?: string }[];
  }[];
}

const scenarios: DemoScenario[] = [
  {
    id: "intent",
    title: "Smart Intent Understanding",
    description: "LLM hiểu ngữ nghĩa thay vì keyword matching",
    innovation: "Innovation #1",
    conversation: [
      {
        role: "user",
        content: "Em mới vào công ty được 2 tháng, muốn hỏi về chế độ nghỉ phép",
      },
      {
        role: "assistant",
        content:
          "Chào bạn! Với nhân viên mới dưới 12 tháng, số ngày phép được tính pro-rata theo số tháng làm việc.\n\nVới 2 tháng, bạn được hưởng: 12 × (2/12) = **2 ngày phép năm**.\n\nNgoài ra, bạn vẫn được nghỉ các ngày lễ theo quy định và nghỉ ốm có lương.",
        highlight: "Detect intent: policy_question + context: new employee",
      },
      {
        role: "user",
        content: "Vậy em xin nghỉ thì làm sao?",
      },
      {
        role: "assistant",
        content: "Đây là quy trình xin nghỉ phép tại GEM Corp:",
        highlight: "Detect intent: process_guide + context từ câu trước",
        checklist: [
          { text: "Kiểm tra số ngày phép còn lại trên HR Portal", completed: false, link: "#" },
          { text: "Tạo đơn xin nghỉ phép trên hệ thống", completed: false, link: "#" },
          { text: "Thông báo cho quản lý trực tiếp", completed: false },
          { text: "Chờ phê duyệt (1-2 ngày làm việc)", completed: false },
        ],
      },
    ],
  },
  {
    id: "memory",
    title: "Follow-up với Memory",
    description: "AI nhớ context và xử lý câu hỏi tiếp theo",
    innovation: "Innovation #2",
    conversation: [
      {
        role: "user",
        content: "Chính sách bảo hiểm y tế của công ty như thế nào?",
      },
      {
        role: "assistant",
        content:
          "GEM Corp cung cấp gói **bảo hiểm BSH 2025** cho nhân viên:\n\n• Khám ngoại trú: tối đa 2,000,000 VNĐ/lần\n• Nội trú: 100% phòng (max 1,500,000/ngày)\n• Phẫu thuật: bảo lãnh đến 200,000,000 VNĐ/năm",
      },
      {
        role: "user",
        content: "Còn cho người thân thì sao?",
      },
      {
        role: "assistant",
        content:
          "Về bảo hiểm **cho người thân** (vợ/chồng, con):\n\n• Nhân viên có thể mua thêm gói bảo hiểm cho người thân với **giá ưu đãi** qua công ty\n• Quyền lợi tương tự nhân viên nhưng mức chi trả **thấp hơn 20%**\n• Đăng ký qua HR trong vòng 30 ngày kể từ ngày vào công ty hoặc khi có thay đổi gia đình",
        highlight: "Memory biết đang nói về bảo hiểm → không cần nhắc lại",
      },
    ],
  },
  {
    id: "process",
    title: "Interactive Process Guide",
    description: "Hướng dẫn quy trình với checklist tương tác",
    innovation: "Innovation #3",
    conversation: [
      {
        role: "user",
        content: "Hướng dẫn em quy trình claim bảo hiểm",
      },
      {
        role: "assistant",
        content: "Quy trình claim bảo hiểm BSH gồm 4 bước. Bạn có thể tick từng bước khi hoàn thành:",
        checklist: [
          { text: "Thu thập hóa đơn/chứng từ gốc", completed: true, link: "#" },
          { text: "Điền form claim bảo hiểm", completed: true, link: "#" },
          { text: "Nộp HR qua email hr@gemcorp.com", completed: false },
          { text: "Chờ phê duyệt (3-5 ngày làm việc)", completed: false },
        ],
      },
    ],
  },
];

export default function DemoSection() {
  const [activeScenario, setActiveScenario] = useState(0);
  const scenario = scenarios[activeScenario];

  return (
    <section id="demo" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Demo Scenarios
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Xem <span className="gradient-text">AI hoạt động</span>
          </h2>
          <p className="text-gray-400 text-lg">3 kịch bản demo thể hiện sức mạnh của hệ thống</p>
        </div>

        {/* Scenario tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(i)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeScenario === i
                  ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-white/10"
              }`}
            >
              <span className="text-xs font-bold opacity-60">{s.innovation}</span>
              <ChevronRight className="w-3 h-3 opacity-40" />
              {s.title}
            </button>
          ))}
        </div>

        {/* Chat demo window */}
        <div className="max-w-3xl mx-auto">
          <div className="glass-card overflow-hidden">
            {/* Window header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-gray-500 ml-2">
                GEM HR Copilot — {scenario.title}
              </span>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {scenario.conversation.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "" : ""}`}>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === "user"
                        ? "bg-gray-700"
                        : "bg-gradient-to-br from-primary-500 to-accent-500"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4 text-gray-300" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    {msg.highlight && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
                        <Sparkles className="w-3 h-3" />
                        {msg.highlight}
                      </div>
                    )}
                    <div
                      className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary-500/20 text-gray-200"
                          : "bg-white/5 text-gray-300"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    {msg.checklist && (
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-400">Quy trình</span>
                          <span className="text-xs text-primary-400">
                            {msg.checklist.filter((c) => c.completed).length}/{msg.checklist.length} hoàn thành
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                            style={{
                              width: `${(msg.checklist.filter((c) => c.completed).length / msg.checklist.length) * 100}%`,
                            }}
                          />
                        </div>
                        {msg.checklist.map((item, j) => (
                          <div key={j} className="flex items-center gap-3 py-1.5">
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-accent-400 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-600 shrink-0" />
                            )}
                            <span
                              className={`text-sm flex-1 ${
                                item.completed ? "text-gray-500 line-through" : "text-gray-300"
                              }`}
                            >
                              {item.text}
                            </span>
                            {item.link && (
                              <ExternalLink className="w-3.5 h-3.5 text-primary-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
