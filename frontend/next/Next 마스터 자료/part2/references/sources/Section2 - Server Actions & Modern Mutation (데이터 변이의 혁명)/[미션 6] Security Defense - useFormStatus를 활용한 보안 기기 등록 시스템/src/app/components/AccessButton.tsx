'use client';
import { useFormStatus } from 'react-dom';

export default function AccessButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`p-4 rounded-xl font-black transition-all shadow-2xl text-white ${
        pending 
          ? "bg-red-500 animate-pulse cursor-not-allowed scale-95" 
          : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer hover:scale-105 active:scale-95"
      }`}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          ⏳ 보안 구역 통신 중...
        </span>
      ) : (
        "🔐 보안 기기 등록 실행"
      )}
    </button>
  );
}