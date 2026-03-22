import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-10 text-center border border-slate-200">
        <h1 className="text-4xl font-black text-blue-600 mb-4 tracking-tighter">🦆 Korapaduck 시스템</h1>
        <p className="text-slate-500 mb-8 leading-relaxed font-semibold">
          교육의 평등을 실현하는 파이프라인 아키텍처를 검증하십시오.
        </p>
        <div className="space-y-4">
          {/* <Link> 컴포넌트는 일반 <a> 태그와 달리 브라우저 전체 새로고침(White Flash)을 
              방지하고 목적지의 데이터만 가져와 부드럽게 라우팅을 수행합니다. */}
          <Link href="/korapaduck" className="block w-full bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-900 transition-all shadow-md">
            📚 멘토링 대기열 확인 (정적 캐시 화면)
          </Link>
          <Link href="/korapaduck/apply" className="block w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md">
            🙋‍♂️ 신규 멘토링 신청 (캐시 파괴 통제소)
          </Link>
        </div>
      </div>
    </div>
  );
}