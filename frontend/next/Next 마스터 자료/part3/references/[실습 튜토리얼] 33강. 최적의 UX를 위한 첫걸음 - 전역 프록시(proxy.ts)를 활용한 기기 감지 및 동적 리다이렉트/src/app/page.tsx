import Link from 'next/link';
export default function Home() {
  return (
    <main className="flex flex-col items-center gap-6 p-10 bg-white border border-gray-200 rounded-xl shadow-lg text-center">
      <h1 className="text-3xl font-extrabold text-gray-800">기기 감지 테스트</h1>
      <p className="text-gray-600 font-medium">현재 접속하신 기기에 따라 전역 프록시가 알맞은 페이지로 안내합니다.</p>
      <Link href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-md">
        대시보드 진입하기 (/dashboard)
      </Link>
    </main>
  );
}
