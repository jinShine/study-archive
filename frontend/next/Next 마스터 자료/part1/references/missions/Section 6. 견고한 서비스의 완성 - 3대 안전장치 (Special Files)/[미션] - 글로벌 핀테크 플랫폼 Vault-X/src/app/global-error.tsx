'use client';

/**
 * GlobalError: 애플리케이션 최상위 에러 핸들러
 * root layout이 깨졌을 때를 대비해 <html>과 <body> 태그를 직접 포함해야 합니다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        {/* 시스템 전면 마비 시의 UI: 강렬한 경고 색상 사용 */}
        <h2 className="text-4xl font-black text-red-500 mb-6">CRITICAL SYSTEM FAILURE</h2>
        <p className="text-slate-400 mb-10">코어 시스템에 치명적인 오류가 발생했습니다.</p>
        {/* 앱 전체 시스템을 재부팅(초기화)하려는 시도 */}
        <button onClick={() => reset()} className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors">
          시스템 재부팅
        </button>
      </body>
    </html>
  );
}