import Link from 'next/link';
export default function LoginPage() {
  return (
    <main className="p-10 bg-white border border-gray-200 rounded-xl shadow-lg text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">로그인 (임시)</h1>
      <p className="text-gray-600 mb-6">전역 프록시가 토큰이 없는 사용자를 이리로 쫓아냈습니다!</p>
      <Link href="/" className="text-blue-600 underline">홈으로 돌아가기</Link>
    </main>
  );
}
