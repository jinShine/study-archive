import Link from 'next/link';

// 진입점 컴포넌트 (정적 렌더링)
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-10 border border-slate-100 text-center">
        <h1 className="text-3xl font-black text-slate-800 mb-4">🌐 웹훅 파이프라인 관제소</h1>
        <p className="text-slate-500 mb-8">외부 교육 플랫폼의 이벤트를 수신할 준비가 되었습니다.</p>

        {/* Next.js의 클라이언트 내비게이션: 페이지 전체 새로고침 없이 광속으로 화면을 전환합니다. */}
        <Link href="/dashboard">
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all cursor-pointer">
            👉 강사용 실시간 대시보드 입장
          </button>
        </Link>
      </div>
    </div>
  );
}