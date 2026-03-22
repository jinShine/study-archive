import "./globals.css";

/**
 * RootLayout: 앱의 최상위 법전
 * - 모든 페이지는 이 레이아웃 안의 {children} 자리에 렌더링됩니다.
 * - 네비게이션 바처럼 모든 화면에서 유지되어야 할 UI를 여기에 작성합니다.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900">
        {/* [강의 내용] 네비게이션 바를 여기에 두면 페이지 이동 시에도 다시 렌더링되지 않고 유지됩니다. */}
        <nav className="p-4 bg-white border-b shadow-sm flex justify-between items-center sticky top-0 z-50">
          <h1 className="font-black text-orange-500 text-xl tracking-tighter">Nyan-Match Project</h1>
          <div className="flex gap-6 font-bold text-sm text-slate-600">
            <span className="cursor-pointer hover:text-orange-500 transition">홈</span>
            <span className="cursor-pointer hover:text-orange-500 transition">대시보드</span>
          </div>
        </nav>

        {/* [강의 내용] 우리가 만든 page.tsx가 바로 이 {children} 자리에 갈아 끼워집니다. */}
        <main className="max-w-4xl mx-auto p-8 min-h-screen">
          {children}
        </main>
        
        <footer className="p-10 bg-slate-100 text-center text-slate-400 text-xs">
          © 2026 Next.js App Router Structure Lab.
        </footer>
      </body>
    </html>
  );
}
