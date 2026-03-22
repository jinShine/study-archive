export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="border-4 border-blue-500 m-6 p-6 rounded-2xl bg-white shadow-xl">
      <nav className="bg-blue-50 p-4 mb-6 rounded-xl border border-blue-100">
        <h2 className="text-lg font-bold text-blue-800 mb-2">
          🏢 About 섹션 전용 네비게이션 (Lv 2)
        </h2>
        <ul className="flex gap-4 text-sm font-semibold text-blue-600">
          <li className="hover:underline cursor-pointer">소개</li>
          <li className="hover:underline cursor-pointer">연혁</li>
          <li className="hover:underline cursor-pointer text-blue-800 border-b-2 border-blue-800">팀원</li>
        </ul>
      </nav>

      {/* [강의 핵심] 하위 page.tsx 혹은 하위 폴더의 레이아웃이 주입되는 위치 */}
      <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200">
        {children}
      </div>
      
      <p className="mt-4 text-[10px] text-blue-400 text-center font-mono">
        Nested Layout: src/app/about/layout.tsx
      </p>
    </section>
  );
}
