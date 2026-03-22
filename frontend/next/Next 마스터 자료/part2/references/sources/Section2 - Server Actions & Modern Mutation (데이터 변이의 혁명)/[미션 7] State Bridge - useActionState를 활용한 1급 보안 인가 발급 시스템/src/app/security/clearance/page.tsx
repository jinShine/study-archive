'use client';

import { useActionState } from 'react';
import { issueClearanceAction, ClearanceState } from '../../actions';
import ClearanceButton from '../../components/ClearanceButton';

export default function ClearancePage() {
  const initialState: ClearanceState = {
    success: false,
    message: '',
    attemptCount: 0,
  };

  const [state, formAction] = useActionState(issueClearanceAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 font-sans">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <h1 className="text-red-500 text-2xl font-black mb-2 text-center">🛡️ 1급 보안 인가 센터</h1>
        <p className="text-slate-400 text-xs mb-8 text-center font-mono">useActionState Protocol</p>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="text" name="empId" placeholder="사번 (4자리 이상)" className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-red-500 transition-colors" />
          <input type="text" name="department" placeholder="소속 부서" className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-red-500 transition-colors" />

          <ClearanceButton />

          {state.message && (
            <div className={`mt-4 p-4 rounded-xl border ${state.success ? "bg-emerald-950/50 border-emerald-800 text-emerald-400" : "bg-red-950/50 border-red-800 text-red-400"}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm">
                  {state.success ? "✅ 발급 성공" : "❌ 보안 경고"}
                </span>
                <span className="text-xs opacity-70 font-mono">시도: {state.attemptCount}회</span>
              </div>
              <p className="text-sm">{state.message}</p>

              {state.clearanceCode && (
                <div className="mt-3 p-3 bg-black rounded-lg text-center font-mono text-lg tracking-widest text-emerald-300 font-bold border border-emerald-900">
                  {state.clearanceCode}
                </div>
              )}
            </div>
          )}

          {!state.success && state.attemptCount >= 3 && (
            <p className="text-center text-xs text-red-500 font-bold mt-2 animate-pulse">
              ⚠️ 비정상적인 접근 시도가 감지되었습니다. 보안팀에 기록됩니다.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}