export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased" suppressHydrationWarning>
        <div className="flex h-screen overflow-hidden">
          {/* 사이드바 영역 */}
          <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20">
            <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-slate-900 text-white font-black text-xl">
              Admin Pro
            </div>
            <div className="flex-1 py-6 px-4 space-y-2">
              {['Dashboard', 'Analytics', 'Settings'].map((item) => (
                <div key={item} className="px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                  {item}
                </div>
              ))}
            </div>
          </aside>
          {/* 콘텐츠 영역 */}
          <main className="flex-1 overflow-y-auto p-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
