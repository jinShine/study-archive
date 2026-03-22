import Link from 'next/link';
export default function HomePage() {
  return (
    <div className="p-10"><h1 className="text-3xl font-bold mb-2">통합 데이터 파이프라인</h1>
      <p className="text-gray-500 mb-6">상태 피드백 시스템 작동을 검증하십시오.</p>
      <hr className="border-gray-200 mb-6" />
      <Link href="/products/new" className="p-3 bg-[#0070f3] hover:bg-blue-700 text-white rounded-md font-bold transition-colors">신규 상품 등록 통제소 진입</Link>
    </div>
  );
}