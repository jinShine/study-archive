'use client'; 

import { useTransition } from 'react';
import { toggleLearningModeAction } from '../actions';

export default function FocusModeButton({ currentMode }: { currentMode: string }) {
  // [논블로킹의 핵심] 상태 변화 우선순위를 늦추는 React 19 훅
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // startTransition 없이 서버 통신을 하면 브라우저 렌더링 엔진이 멈춥니다(Blocking).
    // 이 래퍼로 감싸면 통신이 진행되는 1초 동안에도 사용자가 자유롭게 스크롤을 내릴 수 있습니다.
    startTransition(async () => {
      await toggleLearningModeAction();
    });
  };

  const isFocus = currentMode === 'focus';

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`
        px-8 py-4 rounded-2xl font-black shadow-xl transition-all duration-300 flex items-center justify-center gap-3 min-w-[240px]
        ${isPending 
          ? "bg-slate-300 text-slate-500 cursor-not-allowed scale-95" 
          : isFocus 
            ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95" 
            : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95"}
      `}
    >
      {isPending ? (
        <>
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          환경 설정 중...
        </>
      ) : (
        isFocus ? '📖 일반 학습 모드로 복귀' : '👁️ 집중 학습 모드 켜기'
      )}
    </button>
  );
}