'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticateAdminAction, AuthState } from '../../actions';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full p-4 rounded-xl font-black transition-all shadow-lg text-white mt-2 ${
        pending ? "bg-slate-600 cursor-not-allowed scale-95" : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
      }`}
    >
      {pending ? "📡 암호화 통신 중..." : "🔐 게이트웨이 진입"}
    </button>
  );
}

export default function AdminLoginPage() {
  const initialState: AuthState = { success: false, message: '' };
  const [state, formAction] = useActionState(authenticateAdminAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-white text-3xl font-black mb-2 text-center tracking-tighter">🛡️ Korapaduck Admin</h1>
        <p className="text-slate-500 text-xs mb-8 text-center font-mono">Safe Redirection Protocol</p>

        <form action={formAction} className="flex flex-col gap-4">
          <input 
            type="password" 
            name="secretCode" 
            placeholder="마스터 인가 코드 입력" 
            className="p-4 bg-slate-950 border border-slate-700 rounded-xl text-center text-white tracking-[0.2em] font-mono focus:border-indigo-500 outline-none transition-colors" 
          />
          <LoginButton />

          {state.message && (
            <div className="mt-4 p-4 rounded-xl bg-red-950/50 border border-red-900 text-red-400 text-center text-sm font-bold animate-pulse">
              ❌ {state.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}