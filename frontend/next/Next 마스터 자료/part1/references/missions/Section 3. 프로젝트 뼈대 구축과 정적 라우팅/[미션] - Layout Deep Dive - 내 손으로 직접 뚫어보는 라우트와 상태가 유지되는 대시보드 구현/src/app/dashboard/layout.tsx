import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen text-white">
      <aside className="w-64 bg-gray-900 p-6 flex flex-col border-r border-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-emerald-400">Dev Dashboard</h1>
        
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="검색어 입력 후 메뉴 이동!" 
            className="w-full p-2 rounded bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
          />
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          <Link href="/dashboard" className="block p-3 rounded hover:bg-gray-800 transition-colors">
            📊 홈 (Overview)
          </Link>
          <Link href="/dashboard/settings" className="block p-3 rounded hover:bg-gray-800 transition-colors">
            ⚙️ 설정 (Settings)
          </Link>
        </nav>
      </aside>

      <main className="flex-1 bg-gray-100 text-black p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
