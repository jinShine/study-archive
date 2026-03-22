import Link from "next/link";

/**
 * DashboardLayout: 관리자 페이지의 고정 뼈대
 * - aside: 페이지가 바뀌어도 새로고침되지 않는 고정 영역
 * - main: page.tsx가 교체되는 가변 영역
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen text-white font-sans">
      {/* [강의 포인트] 왼쪽 사이드바: 페이지 이동 시에도 이 영역은 파괴되지 않습니다. */}
      <aside className="w-64 bg-gray-900 p-6 flex flex-col border-r border-gray-800">
        <h1 className="text-2xl font-black mb-8 text-emerald-400 tracking-tight">
           Dev Dashboard
        </h1>

        {/* ★ 상태 유지 테스트용 검색창 ★ */}
        <div className="mb-8">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">
                State Test
            </label>
            <input
                type="text"
                placeholder="여기에 글을 써보세요..."
                className="w-full p-3 rounded-xl bg-gray-800 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
                💡 여기에 내용을 입력한 뒤,<br/> 아래 메뉴를 클릭해 보세요!
            </p>
        </div>

        {/* [강의 포인트] Link 컴포넌트: 전체 새로고침 없이 필요한 부분만 교체합니다. */}
        <nav className="space-y-1 flex-1">
          <Link href="/dashboard" className="block p-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-gray-300 hover:text-white">
            📊 홈 (Overview)
          </Link>
          <Link href="/dashboard/settings" className="block p-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-gray-300 hover:text-white">
            ⚙️ 설정 (Settings)
          </Link>
        </nav>

        <Link href="/" className="block p-4 rounded-xl bg-gray-800/50 hover:bg-red-900/20 text-red-400 text-xs font-bold mt-auto text-center transition-all border border-red-900/30">
            ⬅️ EXIT SYSTEM
        </Link>
      </aside>

      {/* 오른쪽 콘텐츠 영역: 오직 이 부분({children})만 갈아 끼워집니다. */}
      <main className="flex-1 bg-slate-50 text-slate-900 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
