import Link from 'next/link';
export default function HomePage() {
  return (
    <div className="p-10 max-w-2xl mx-auto"><h1 className="text-3xl font-bold mb-2 text-[#0070f3]">Mutation 파이프라인 대시보드</h1>
      <p className="text-gray-500 mb-6">데이터 변이와 캐시 파괴 메커니즘을 테스트하십시오.</p><hr className="border-gray-200 mb-6" />
      <div className="flex gap-4">
        <Link href="/products" className="p-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-md font-bold transition-colors">목록 페이지 (캐시 확인)</Link>
        <Link href="/products/new" className="p-3 bg-[#0070f3] hover:bg-blue-700 text-white rounded-md font-bold transition-colors">신규 등록 (캐시 파괴)</Link>
      </div>
    </div>
  );
}