import Link from 'next/link';

/**
 * Home Page: / (루트 경로)의 UI를 담당합니다.
 * - 이 파일이 src/app/에 있으므로 도메인의 첫 화면이 됩니다.
 */
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-bold mb-4">
        Lesson 07: Project Structure
      </div>
      <h2 className="text-4xl font-black mb-6 text-slate-800">파일 시스템 라우팅</h2>
      <p className="text-slate-500 mb-10 text-center max-w-md leading-relaxed">
        Next.js는 오직 약속된 이름을 가진 파일에게만 특별한 권한을 부여합니다.<br/>
        그 중 <strong>page.tsx</strong>는 해당 경로의 유일한 진입점입니다.
      </p>
      
      {/* 다음 실습을 위한 링크 */}
      <Link href="/dashboard" className="group px-8 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center gap-2">
        대시보드에서 Colocation 확인하기
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </Link>
    </div>
  );
}
