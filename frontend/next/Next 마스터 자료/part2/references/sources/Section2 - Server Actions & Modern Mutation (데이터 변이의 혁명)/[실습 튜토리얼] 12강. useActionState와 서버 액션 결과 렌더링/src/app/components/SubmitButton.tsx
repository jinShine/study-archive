'use client';
import { useFormStatus } from 'react-dom';
export default function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`p-4 border-none rounded-md font-bold transition-all shadow-sm flex justify-center items-center ${pending ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#0070f3] hover:bg-blue-700 text-white cursor-pointer"}`}>
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          안전하게 저장 중...
        </span>
      ) : "상품 등록 시스템 가동"}
    </button>
  );
}