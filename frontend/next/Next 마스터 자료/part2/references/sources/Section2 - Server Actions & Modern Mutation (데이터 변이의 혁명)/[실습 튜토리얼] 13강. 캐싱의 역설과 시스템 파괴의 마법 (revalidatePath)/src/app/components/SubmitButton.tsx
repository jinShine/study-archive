'use client';
import { useFormStatus } from 'react-dom';
export default function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`p-4 border-none rounded-md font-bold transition-all shadow-sm flex justify-center items-center ${pending ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#0070f3] hover:bg-blue-700 text-white cursor-pointer"}`}>
      {pending ? "안전하게 저장 중..." : "상품 등록 시스템 가동"}
    </button>
  );
}