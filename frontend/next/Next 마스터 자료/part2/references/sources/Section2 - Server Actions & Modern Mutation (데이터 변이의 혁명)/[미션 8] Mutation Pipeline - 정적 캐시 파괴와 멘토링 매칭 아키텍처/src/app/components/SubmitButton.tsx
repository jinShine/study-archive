'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton() {
  // [물리적 방어선] 부모 폼의 제출 상태를 감지하는 레이더 훅입니다.
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending} // 전송 중 마우스 클릭, 엔터 키 입력을 엔진 레벨에서 차단합니다.
      className={`w-full p-4 rounded-xl font-black transition-all shadow-lg text-white mt-4 ${
        pending ? "bg-blue-400 cursor-not-allowed scale-95" : "bg-blue-600 hover:bg-blue-700 cursor-pointer active:scale-95"
      }`}
    >
      {pending ? "📡 시스템 전송 중..." : "🚀 멘토링 신청하기"}
    </button>
  );
}