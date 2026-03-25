import Link from 'next/link';
export default function Home() {
  return (
    <main className="flex flex-col items-center gap-6 p-10 bg-white border border-gray-200 rounded-xl shadow-lg">
      <h1 className="text-3xl font-extrabold text-gray-800">정문 매표소</h1>
      <p className="text-gray-600">전역 프록시와 내부 프록시의 역할을 테스트합니다.</p>
      <div className="flex gap-4">
        <Link href="/login" className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200">로그인 페이지로</Link>
        <Link href="/dashboard" className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded hover:bg-red-200">VIP 대시보드 접근 시도 (보호구역)</Link>
      </div>
    </main>
  );
}
