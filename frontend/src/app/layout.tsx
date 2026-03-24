import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "GEM HR Copilot Pro - AI HR Assistant",
  description:
    "Trợ lý AI HR thông minh cho GEM Corp. Tìm kiếm chính sách, hướng dẫn quy trình, hỗ trợ nhân viên 24/7 bằng tiếng Việt và tiếng Nhật.",
  keywords: ["HR", "AI", "Copilot", "GEM Corp", "Vietnam", "Japan"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
