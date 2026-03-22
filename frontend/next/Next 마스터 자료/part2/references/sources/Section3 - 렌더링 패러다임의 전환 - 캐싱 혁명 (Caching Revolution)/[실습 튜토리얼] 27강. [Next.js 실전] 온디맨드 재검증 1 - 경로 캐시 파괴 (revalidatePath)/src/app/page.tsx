import Link from 'next/link';
export default function HomePage() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-black mb-6">Next.js 16 온디맨드 재검증 랩</h1>
      <p className="text-gray-500 mb-8">revalidatePath를 활용하여 단단히 얼어붙은 캐시를 강제 파괴합니다.</p>
      <Link href="/product/123" className="px-8 py-4 bg-[#0070f3] text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg inline-block">
        캐시 무효화 테스트 진입
      </Link>
    </div>
  );
}