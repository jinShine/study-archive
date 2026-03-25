'use client';
import { signup } from '@/app/actions/auth';
import { useActionState } from 'react';

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  return (
    <form action={action} className="flex flex-col gap-4 w-96 p-8 bg-white border border-gray-200 rounded-xl shadow-xl">
      <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-4">안전한 회원가입</h2>
      <div>
        <label htmlFor="name" className="text-sm font-bold text-gray-600">이름</label>
        <input id="name" name="name" placeholder="Name" className="w-full border p-3 rounded mt-1" />
        {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name}</p>}
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-bold text-gray-600">이메일</label>
        <input id="email" name="email" type="email" placeholder="Email" className="w-full border p-3 rounded mt-1" />
        {state?.errors?.email && <p className="text-red-500 text-sm mt-1">{state.errors.email}</p>}
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-bold text-gray-600">비밀번호</label>
        <input id="password" name="password" type="password" className="w-full border p-3 rounded mt-1" />
        {state?.errors?.password && (
          <div className="bg-red-50 p-3 rounded mt-2">
            <p className="text-red-600 text-sm font-bold">비밀번호 준수 사항:</p>
            <ul className="text-red-500 text-sm list-disc pl-5 mt-1">
              {state.errors.password.map((err: string) => <li key={err}>- {err}</li>)}
            </ul>
          </div>
        )}
      </div>
      <button disabled={pending} type="submit" className="mt-4 w-full bg-blue-600 text-white font-bold p-3 rounded hover:bg-blue-700 disabled:opacity-50 transition">
        {pending ? '가입 처리 중...' : '회원가입 완료'}
      </button>
    </form>
  );
}