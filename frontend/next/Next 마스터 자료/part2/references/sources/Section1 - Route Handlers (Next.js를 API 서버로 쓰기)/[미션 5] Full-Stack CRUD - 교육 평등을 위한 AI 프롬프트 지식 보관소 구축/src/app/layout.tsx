import type { Metadata } from "next";
import "./globals.css";

/* =========================================================
 * [2] 서버사이드 메타데이터 (Next.js SEO 최적화)
 * =========================================================
 * 이 객체는 브라우저가 아닌 '서버'에서 읽혀져 HTML의 <head> 영역으로 조립됩니다.
 * 자바스크립트가 로드되기 전에 이미 완성된 타이틀과 설명을 검색 엔진 크롤러에게 제공합니다.
 */
export const metadata: Metadata = {
  title: "AI 지식 보관소",
  description: "Next.js 15 기반 완벽한 Full CRUD 파이프라인"
};

/* =========================================================
 * [3] RootLayout (시스템의 최상위 껍데기)
 * =========================================================
 * App Router의 뼈대입니다. 모든 하위 페이지(page.tsx)는 이 {children} 영역으로
 * 쏙 들어가서 렌더링됩니다. 반드시 <html>과 <body> 태그를 보유해야 합니다.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-slate-50 font-sans">
        {children}
      </body>
    </html>
  );
}