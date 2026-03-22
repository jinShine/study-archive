import Link from 'next/link';
export default function HomePage() {
  return (
    <div className="p-10 max-w-4xl mx-auto text-center mt-10">
      <h1 className="text-4xl font-black mb-4 text-gray-900">Next.js 15 렌더링 랩</h1>
      <p className="text-gray-500 mb-10 text-lg">3가지 캐싱 전략의 차이를 프로덕션 환경에서 검증하십시오.</p>
      <div className="flex justify-center gap-4 flex-wrap">
        <Link href="/product/dynamic" className="px-6 py-4 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors shadow-sm">
          🔥 동적 렌더링 (no-store)
        </Link>
        <Link href="/product/cached" className="px-6 py-4 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition-colors shadow-sm">
          ❄️ 강제 결빙 (force-cache)
        </Link>
        <Link href="/product/isr" className="px-6 py-4 bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 rounded-xl font-bold transition-colors shadow-sm">
          ⏳ 점진적 갱신 (ISR 60s)
        </Link>
      </div>
    </div>
  );
}