import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-10 border border-slate-100 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-4">⚡ 성능 통제 대시보드</h1>
        <p className="text-slate-500 mb-8">Next.js 15의 캐시 엔진과 엑스레이를 가동하십시오.</p>

        <div className="space-y-4">
          <Link href="/performance">
            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg block cursor-pointer">
              1. 미시적 방어 (Memoization) 테스트
            </button>
          </Link>

          <Link href="/api/metrics">
            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg block cursor-pointer">
              2. 거시적 방어 (60초 Segment Cache) 타격
            </button>
          </Link>
        </div>

        <p className="mt-8 text-xs text-red-500 font-bold">
          🚨 2번 테스트는 반드시 npm run build 후 npm start로 실행해야 완벽히 증명됩니다!
        </p>
      </div>
    </div>
  );
}