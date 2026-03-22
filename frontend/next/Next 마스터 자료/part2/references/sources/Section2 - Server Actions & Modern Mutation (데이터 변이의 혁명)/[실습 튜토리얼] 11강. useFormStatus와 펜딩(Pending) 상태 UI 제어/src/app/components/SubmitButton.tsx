// src/app/components/SubmitButton.tsx

// 1. 브라우저의 상호작용(상태 변화, 클릭 방어)이 필요하므로 클라이언트 컴포넌트로 선언합니다.
'use client';

// 2. 외부 라이브러리가 아닌 React 코어(react-dom)에서 상태 추적 훅을 불러옵니다.
import { useFormStatus } from 'react-dom';

export default function SubmitButton() {
  // [단계 1] 부모 폼의 상태 컨텍스트를 빼냅니다.
  // 서버가 응답을 처리하는 지연(Latency) 동안 이 값은 true가 됩니다.
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      // [단계 2] 물리적 차단: pending이 true일 때 버튼을 강제 비활성화하여 다중 클릭을 막습니다.
      disabled={pending}
      className={`
        p-4 border-none rounded-md font-bold transition-all shadow-sm flex justify-center items-center
        ${pending
          ? "bg-gray-400 text-white cursor-not-allowed" // 처리 중 시각적 피드백
          : "bg-[#0070f3] hover:bg-blue-700 text-white cursor-pointer" // 평상시 상태
        }
      `}
    >
      {/* [단계 3] 시스템 상태에 따라 사용자 안내 텍스트를 동적으로 렌더링합니다. */}
      {pending ? (
        <span className="flex items-center gap-2">
          {/* Tailwind CSS를 활용한 로딩 스피너 */}
          <svg className="animate-spin h-5 w-5 text-white" xmlns="<http://www.w3.org/2000/svg>" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          안전하게 저장 중...
        </span>
      ) : (
        "상품 등록 시스템 가동"
      )}
    </button>
  );
}