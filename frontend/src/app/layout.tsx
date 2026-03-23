import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GEM HR Copilot Pro",
  description: "AI-powered HR assistant for GEM Corporation — bilingual Vietnamese & Japanese policy search",
  keywords: ["HR", "policy", "AI", "assistant", "GEM", "copilot"],
  openGraph: {
    title: "GEM HR Copilot Pro",
    description: "AI-powered bilingual HR assistant",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
