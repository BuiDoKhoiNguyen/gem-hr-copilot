import Link from "next/link";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_70%)]" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass-card p-10 sm:p-14 glow-blue">
          <Sparkles className="w-10 h-10 text-primary-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Thử ngay GEM HR Copilot Pro — hỏi bất kỳ câu hỏi nào về chính sách HR,
            quy trình, phúc lợi bằng tiếng Việt hoặc tiếng Nhật.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold text-lg hover:from-primary-500 hover:to-accent-500 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
          >
            <MessageSquare className="w-5 h-5" />
            Mở Chat AI
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
