import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Step2() {
  const { register } = useFormContext();
  return (
    <div className="animate-in fade-in duration-500">
      <label className="block text-xs font-black text-indigo-500 uppercase mb-2 tracking-widest">Step 2: Brief Bio</label>
      <textarea {...register("step2.bio")} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all h-24" placeholder="짧은 소개글을 남겨주세요" />
    </div>
  );
}