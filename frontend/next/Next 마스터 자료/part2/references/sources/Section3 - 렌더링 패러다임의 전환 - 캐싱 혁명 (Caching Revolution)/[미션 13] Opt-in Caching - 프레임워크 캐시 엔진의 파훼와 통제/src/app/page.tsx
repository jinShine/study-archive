import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 font-sans">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-10 text-center border border-slate-200">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">🦆 코라파덕 인사이트 통제소</h1>
        <p className="text-slate-500 mb-8 leading-relaxed font-semibold">
          교육적 평등을 위해, 성능과 신선도의 딜레마를 렌더링 아키텍처로 돌파하십시오.
        </p>

        <div className="flex flex-col gap-4">
          <Link href="/insight/live" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
            🌊 실시간 인사이트 (no-store 파훼)
          </Link>
          <Link href="/insight/archive" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95">
            ❄️ 아카이브 철학 (force-cache 동결)
          </Link>
        </div>
      </div>
    </div>
  );
}