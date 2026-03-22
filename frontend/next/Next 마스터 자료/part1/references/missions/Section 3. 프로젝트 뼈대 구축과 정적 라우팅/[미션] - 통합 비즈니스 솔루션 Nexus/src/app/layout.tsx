import "./globals.css";
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body>
        <header className="h-12 bg-emerald-600 text-white flex items-center justify-between px-6 font-bold shadow-md">
          <span>📢 NEXUS GLOBAL ANNOUNCEMENT</span>
          <input type="text" placeholder="전역 상태 테스트..." className="bg-emerald-700 rounded px-2 text-sm outline-none border border-emerald-500" />
        </header>
        {children}
      </body>
    </html>
  );
}
