import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function AsyncResetForm() {
  const [loading, setLoading] = useState(false);
  const { register, reset, formState: { isDirty } } = useForm();

  const loadFromServer = async () => {
    setLoading(true);
    // 2초의 지연 시간을 시뮬레이션합니다.
    await new Promise(resolve => setTimeout(resolve, 2000));
    const userData = { name: "홍길동", email: "hong@example.com" };

    // 💡 핵심: 비동기 데이터가 도착한 직후 reset 호출
    reset(userData);
    setLoading(false);
  };

  return (
    <div className="p-12 max-w-md w-full bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Lifecycle Reset</h1>
        <p className="text-slate-400 text-sm mt-1">비동기 데이터 로딩과 상태 초기화</p>
      </header>

      <div className="space-y-8">
        <button
          onClick={loadFromServer}
          disabled={loading}
          className="w-full py-4 bg-indigo-50 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-100 transition-all disabled:opacity-50"
        >
          {loading ? "📦 서버에서 가져오는 중..." : "서버 데이터 불러오기"}
        </button>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input {...register("name")} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all" placeholder="불러오기 버튼을 누르세요" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <input {...register("email")} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all" placeholder="불러오기 버튼을 누르세요" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 rounded-[1.5rem] text-xs font-mono text-white shadow-inner">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">formState.isDirty</span>
            <span className={isDirty ? "text-rose-400" : "text-emerald-400"}>{String(isDirty).toUpperCase()}</span>
          </div>
          <p className="mt-3 text-[10px] text-slate-400 leading-relaxed italic border-t border-slate-800 pt-3">
            💡 데이터를 불러오면 reset이 실행되어 isDirty가 다시 FALSE로 돌아갑니다.
          </p>
        </div>
      </div>
    </div>
  );
}