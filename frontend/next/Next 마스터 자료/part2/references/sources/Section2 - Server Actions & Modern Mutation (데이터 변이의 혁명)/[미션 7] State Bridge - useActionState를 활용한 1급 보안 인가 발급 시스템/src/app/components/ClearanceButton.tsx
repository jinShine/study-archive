'use client';

import { useFormStatus } from 'react-dom';

export default function ClearanceButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full p-4 rounded-xl font-black transition-all shadow-md text-white mt-4 ${
        pending ? "bg-slate-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 cursor-pointer"
      }`}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="<http://www.w3.org/2000/svg>" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          보안 망 통신 중...
        </span>
      ) : (
        "인가 코드 발급 요청"
      )}
    </button>
  );
}