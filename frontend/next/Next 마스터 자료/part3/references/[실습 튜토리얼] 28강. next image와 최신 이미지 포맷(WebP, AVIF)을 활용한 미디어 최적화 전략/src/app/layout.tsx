import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이미지 최적화 실습",
  description: "Next.js next/image 튜토리얼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
