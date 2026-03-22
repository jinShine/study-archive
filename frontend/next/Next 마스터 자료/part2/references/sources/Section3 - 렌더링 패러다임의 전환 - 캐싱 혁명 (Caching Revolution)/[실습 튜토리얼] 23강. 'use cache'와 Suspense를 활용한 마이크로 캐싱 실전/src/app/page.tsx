import Link from 'next/link';
export default function HomePage() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-black mb-6">Next.js 16 마이크로 캐싱 & 스트리밍 랩</h1>
      <Link href="/product/777" className="px-8 py-4 bg-[#0070f3] text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg inline-block">
        실시간 + 결빙 데이터 완벽 조립 테스트
      </Link>
    </div>
  );
}