import Link from 'next/link';
export default function HomePage() {
  return (
    <div className="p-10 max-w-2xl mx-auto text-center mt-10">
      <h1 className="text-4xl font-black mb-4 text-gray-900">Next.js 15 렌더링 랩</h1>
      <p className="text-gray-500 mb-10 text-lg">동적 렌더링의 강제 통제와 Opt-in 캐싱의 차이를 프로덕션 환경에서 검증하십시오.</p>
      <div className="flex justify-center gap-6">
        <Link href="/product/dynamic" className="px-6 py-4 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors shadow-sm">
          🔥 동적 렌더링 (no-store 통제)
        </Link>
        <Link href="/product/cached" className="px-6 py-4 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition-colors shadow-sm">
          ❄️ force-cache (강제 결빙)
        </Link>
      </div>
    </div>
  );
}