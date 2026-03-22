'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  // 에러 발생 시 외부 서비스(Sentry 등)에 리포팅하는 로직이 들어갈 자리
  useEffect(() => {
    console.error('🚨 [System Error Log]:', error);
  }, [error]);

  return (
    <div className="m-10 p-12 bg-rose-50 border-2 border-rose-100 rounded-[3rem] text-center shadow-2xl shadow-rose-100 animate-in zoom-in-95 duration-300">
      <div className="text-6xl mb-6">💣</div>
      <h2 className="text-3xl font-black text-rose-900 mb-4 tracking-tight">시스템 오류가 발생했습니다.</h2>
      <p className="text-rose-700/70 mb-8 max-w-md mx-auto leading-relaxed font-medium">
        일시적인 통신 장애 혹은 서버 오류로 데이터를 불러오지 못했습니다. <br/>
        아래 버튼을 눌러 다시 연결을 시도해 보세요.
      </p>

      {error.digest && (
        <div className="mb-8 inline-block px-4 py-1.5 bg-rose-200/30 rounded-full text-[10px] font-mono font-bold text-rose-400">
          Error Digest: {error.digest}
        </div>
      )}

      <div>
        <button
          onClick={() => reset()} // [강의 포인트] 페이지 새로고침 없이 해당 부분만 재시도!
          className="px-10 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95"
        >
          데이터 다시 불러오기
        </button>
      </div>
    </div>
  );
}
