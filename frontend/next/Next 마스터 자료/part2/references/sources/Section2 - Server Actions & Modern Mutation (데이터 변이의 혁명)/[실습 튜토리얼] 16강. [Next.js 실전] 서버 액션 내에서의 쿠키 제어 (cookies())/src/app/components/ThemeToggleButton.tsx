// src/app/components/ThemeToggleButton.tsx

'use client';

// 1. 상태 변화가 있으므로 클라이언트 컴포넌트로 선언하고, React 18의 핵심 훅인 useTransition을 불러옵니다.
import { useTransition } from 'react';
import { toggleThemeAction } from '../actions';

export default function ThemeToggleButton() {
  // [단계 1] useTransition 훅을 호출하여 상태 변화 우선순위를 제어할 준비를 합니다.
  // isPending: 백그라운드 통신 작업이 진행 중인지 알려주는 상태값
  // startTransition: 무거운 작업을 감싸는 래퍼(Wrapper) 함수
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // [단계 2] startTransition 안에 무거운 서버 통신 작업(toggleThemeAction)을 집어넣습니다.
    startTransition(() => {
      toggleThemeAction();
    });
  };

  return (
    <button
      onClick={handleToggle}
      // [단계 3] 통신이 진행되는 동안 isPending이 true로 바뀌며 버튼을 잠급니다.
      disabled={isPending}
      style={{
        padding: "10px 20px",
        borderRadius: "20px",
        cursor: isPending ? "not-allowed" : "pointer",
        backgroundColor: isPending ? "#888" : "#333",
        color: "#fff",
        border: "none"
      }}
    >
      {/* 통신 상태에 따라 텍스트를 동적으로 변경해주는 완벽한 설계입니다. */}
      {isPending ? '테마 변경 중...' : '다크 모드 전환'}
    </button>
  );
}