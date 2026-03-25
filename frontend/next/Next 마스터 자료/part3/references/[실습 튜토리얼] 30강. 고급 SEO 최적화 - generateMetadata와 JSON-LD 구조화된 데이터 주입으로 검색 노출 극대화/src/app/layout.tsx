import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | AI 스터디 플래너',
    default: 'AI 스터디 플래너 - 당신의 학습 혁신', 
  },
  description: "검색 엔진 최적화를 완벽하게 마스터한 AI 스터디 플래너 서비스입니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
