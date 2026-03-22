import Link from 'next/link';
export default function HomePage() {
  return (
    <div className="p-10 max-w-2xl mx-auto text-center mt-20">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-900">낙관적 업데이트 통제소</h1>
      <p className="text-gray-500 mb-8">네트워크 지연을 0초로 단축시키는 마법을 시연합니다.</p>
      <Link href="/products/777" className="px-6 py-3 bg-[#0070f3] hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-md">
        777번 상품 테스트 진입
      </Link>
    </div>
  );
}