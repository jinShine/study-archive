'use client'; 
// 화면 상태(에러 메시지 등)를 실시간 갱신하기 위해 클라이언트 경계(Client Boundary) 선언

import { useActionState } from 'react';
import SubmitButton from '@/app/components/SubmitButton';
import { applyMentoringAction, MentoringFormState } from '@/app/actions';

export default function ApplyPage() {
  const initialState: MentoringFormState = { success: false, message: '', attemptCount: 0 };
  
  // [상태 브릿지] 원본 서버 액션을 폼 전송 규격에 맞게 래핑(formAction)하고, 
  // 서버가 튕겨준 최신 결과값을 화면의 상태(state)에 동기화시킵니다.
  const [state, formAction] = useActionState(applyMentoringAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-slate-900 text-3xl font-black mb-8 text-center tracking-tighter">🦆 멘토링 신청소</h1>

        {/* 원본 함수 대신 훅이 만들어준 formAction을 부착해야 완벽히 작동합니다. */}
        <form action={formAction} className="flex flex-col gap-4">
          <input type="text" name="studentName" placeholder="학생 이름 (예: 이지원)" className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-semibold text-slate-800" />
          <textarea name="topic" placeholder="어떤 소프트웨어 지식이 필요한가요?" className="p-4 h-32 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-semibold resize-none text-slate-800" />

          {/* 물리적 다중 클릭 방어선을 캡슐화한 버튼 컴포넌트 */}
          <SubmitButton />

          {/* 에러 발생 시(success: false) 클라이언트의 useState 없이 서버 상태를 투영하여 렌더링 */}
          {state.message && (
            <div className="mt-4 p-4 rounded-xl border bg-red-50 border-red-200 text-red-600">
              <p className="text-sm font-bold text-center">{state.message}</p>
              <p className="text-xs text-center opacity-70 mt-1">시도 횟수: {state.attemptCount}회</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}