import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h1 className="text-9xl font-black text-blue-100 relative mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-4">목적지를 찾을 수 없습니다.</h2>
      <p className="text-slate-500 mb-8">요청하신 페이지가 삭제되었거나 잘못된 경로입니다.</p>
      <Link href="/" className="bg-blue-600 text-white px-10 py-4 rounded-full font-black shadow-xl hover:bg-blue-700 transition-all">
        안전한 곳으로 돌아가기
      </Link>
    </div>
  );
}
