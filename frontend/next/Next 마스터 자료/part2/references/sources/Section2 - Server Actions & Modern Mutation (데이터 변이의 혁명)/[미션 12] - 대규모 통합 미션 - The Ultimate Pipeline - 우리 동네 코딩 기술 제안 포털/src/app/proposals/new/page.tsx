'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createProposalAction, FormState } from '../../actions';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`w-full p-4 rounded-xl font-black text-white ${pending ? 'bg-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer active:scale-95'}`}>
      {pending ? "📡 제안서 암호화 전송 중..." : "🚀 제안서 제출"}
    </button>
  );
}

export default function NewProposalPage() {
  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useActionState(createProposalAction, initialState);
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
      <div className="max-w-md w-full p-8 rounded-3xl shadow-2xl bg-white border border-slate-200">
        <h1 className="text-3xl font-black mb-8 text-center text-slate-900 tracking-tighter">📝 새 기술 제안</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="text" name="title" placeholder="제안서 제목 (5자 이상)" className="p-4 rounded-xl border border-slate-200 outline-none text-slate-900 focus:border-indigo-500 transition-colors" />
          <SubmitBtn />
          {state.message && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold text-center border border-red-100">❌ {state.message}</div>}
        </form>
      </div>
    </div>
  );
}