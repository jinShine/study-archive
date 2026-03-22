'use client'; // 클라이언트 컴포넌트 필수: reset() 함수 호출 및 상태 관리가 필요함

import { useEffect } from 'react';

/**
 * error: 발생한 에러 객체
 * reset: 에러가 발생한 컴포넌트를 다시 렌더링하려고 시도하는 함수
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  // 에러 로깅: 실무에서는 여기서 에러 정보를 서버나 Sentry로 전송합니다.
  useEffect(() => {
    console.error('🚨 Vault-X 시스템 에러 캡처:', error);
  }, [error]);

  return (
    <div className="bg-red-50 p-16 rounded-3xl border-4 border-red-100 text-center shadow-2xl">
      <div className="text-6xl mb-6">📉</div>
      <h2 className="text-3xl font-black text-red-900 mb-4 tracking-tight">
        일시적인 연결 장애
      </h2>
      <p className="text-red-700 font-medium max-w-md mx-auto mb-10 leading-relaxed">
        금융 서버에서 데이터를 불러오는 중 문제가 발생했습니다. <br />
        전체 페이지를 새로고침할 필요 없이 아래 버튼을 눌러주세요.
      </p>
      
      {/* reset()을 실행하면 해당 경로의 컴포넌트만 다시 불러오기를 시도합니다. */}
      <button
        onClick={() => reset()}
        className="px-10 py-4 bg-red-600 text-white font-black rounded-full hover:bg-red-700 active:scale-95 transition-all shadow-xl shadow-red-200"
      >
        데이터 다시 불러오기
      </button>

      {/* error.digest: 에러 고유 ID. 보안상 민감한 에러 내용은 숨기고 ID만 노출해 개발자 추적을 돕습니다. */}
      {error.digest && (
        <p className="mt-8 text-xs text-red-400 font-mono bg-red-100 inline-block px-3 py-1 rounded">
          Trace ID: {error.digest}
        </p>
      )}
    </div>
  );
}