import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Architecture from "@/components/landing/Architecture";
import DemoSection from "@/components/landing/DemoSection";
import Impact from "@/components/landing/Impact";
import TechStack from "@/components/landing/TechStack";
import QASection from "@/components/landing/QASection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/ui/Footer";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <DemoSection />
      <Architecture />
      <Impact />
      <TechStack />
      <QASection />
      <CTASection />
      <Footer />
    </main>
  );
}
