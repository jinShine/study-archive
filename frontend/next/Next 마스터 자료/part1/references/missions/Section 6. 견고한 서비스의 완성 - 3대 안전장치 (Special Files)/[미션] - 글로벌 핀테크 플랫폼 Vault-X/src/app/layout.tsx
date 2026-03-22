import "./globals.css";
import Link from "next/link";

/**
 * RootLayout: 앱의 최상위 레이아웃
 * 이 컴포넌트는 모든 페이지를 감싸며, 하위 페이지에서 에러가 발생해도 
 * 상단 네비게이션(Nav) 바는 그대로 살아남아 서비스 이탈을 막습니다.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col font-sans">
        {/* 공통 헤더: 대시보드에서 에러가 터져도 이 메뉴는 끄떡없음 (유지성 보장) */}
        <nav className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-10 sticky top-0 z-50">
          <Link href="/" className="text-2xl font-black text-emerald-400 tracking-tighter">
            VAULT-X
          </Link>
          <div className="flex gap-6 text-sm font-bold text-slate-300">
            {/* 클라이언트 사이드 네비게이션: 새로고침 없는 부드러운 이동 */}
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          </div>
        </nav>
        
        {/* 실제 페이지 콘텐츠가 렌더링되는 영역 */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-10">{children}</main>
      </body>
    </html>
  );
}