import type { Metadata } from "next";
import "./globals.css";

// Next.js SEO 최적화의 핵심: 서버에서 HTML의 <head> 태그를 미리 조립합니다.
export const metadata: Metadata = {
  title: "수강평 대시보드",
  description: "Next.js 15 Webhook Pipeline"
};

// RootLayout: 시스템의 가장 거대한 뼈대.
// 하위 컴포넌트들이 이 HTML, BODY 태그의 {children} 영역으로 주입되어 렌더링됩니다.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}