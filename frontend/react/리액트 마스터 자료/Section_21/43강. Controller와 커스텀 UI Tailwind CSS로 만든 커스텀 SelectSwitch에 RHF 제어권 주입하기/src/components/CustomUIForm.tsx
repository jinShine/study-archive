import React from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function CustomUIForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: { pushNotification: true }
  });

  return (
    <div className="p-10 bg-white min-h-screen font-sans">
      <h1 className="text-3xl font-extrabold mb-8 text-slate-900 tracking-tight">Controller Deep Dive</h1>
      <form onSubmit={handleSubmit(d => console.log(d))} className="max-w-md space-y-6">
        <Controller
          name="pushNotification"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700">실시간 푸시 알림</span>
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={`${field.value ? 'bg-emerald-500' : 'bg-slate-300'} w-14 h-8 rounded-full transition-all relative flex items-center shadow-inner`}
              >
                <div className={`${field.value ? 'translate-x-7' : 'translate-x-1'} w-6 h-6 bg-white rounded-full transition-all shadow-md`} />
              </button>
            </div>
          )}
        />
        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black transition-transform active:scale-95 shadow-xl shadow-slate-200">
          환경 설정 저장
        </button>
      </form>
    </div>
  );
}