import Link from "next/link";
export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex h-[calc(100vh-48px)]">
      <aside className="w-64 bg-slate-900 text-slate-300 p-6 flex flex-col gap-4 border-r border-slate-800">
        <h2 className="text-xl font-black text-white italic uppercase">Dashboard</h2>
        <input type="text" placeholder="사이드바 상태 유지..." className="bg-slate-800 p-2 rounded text-sm" />
        <nav className="flex flex-col gap-2 mt-4 text-sm font-medium">
          <Link href="/dashboard" className="hover:text-white transition-colors">📊 메인 통계</Link>
          <Link href="/dashboard/settings/profile" className="hover:text-white transition-colors">⚙️ 시스템 설정</Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </div>
  );
}
