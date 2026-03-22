import Link from 'next/link';
export default function HomePage() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-black mb-6">Next.js 16 PPR & Suspense 랩</h1>
      <p className="text-gray-500 mb-8">동적 데이터로 인한 렌더링 블로킹 에러를 파훼합니다.</p>
      <Link href="/product/777" className="px-8 py-4 bg-[#0070f3] text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg inline-block">
        무결점 스트리밍 테스트 진입
      </Link>
    </div>
  );
}