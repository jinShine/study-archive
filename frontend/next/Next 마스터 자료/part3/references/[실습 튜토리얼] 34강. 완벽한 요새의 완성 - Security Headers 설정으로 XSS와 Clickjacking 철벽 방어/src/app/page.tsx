import Link from 'next/link';
export default function Home() {
  return (
    <main className="flex flex-col items-center gap-6 p-10 bg-white border border-gray-200 rounded-xl shadow-lg text-center">
      <h1 className="text-3xl font-extrabold text-gray-800">보안 헤더 방어 테스트</h1>
      <p className="text-gray-600 font-medium">클릭재킹 공격을 시뮬레이션합니다.</p>
      <div className="flex gap-4">
        <Link href="/bank" className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200">1. 타겟 은행 페이지</Link>
        <Link href="/hacker" className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200">2. 해커의 미끼 페이지</Link>
      </div>
    </main>
  );
}
