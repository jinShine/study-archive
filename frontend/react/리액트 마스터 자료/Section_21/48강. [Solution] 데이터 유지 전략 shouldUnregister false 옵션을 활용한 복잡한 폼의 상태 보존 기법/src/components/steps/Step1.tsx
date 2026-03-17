import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Step1() {
  const { register } = useFormContext();
  return (
    <div className="animate-in fade-in duration-500">
      <label className="block text-xs font-black text-indigo-500 uppercase mb-2 tracking-widest">Step 1: Your Name</label>
      <input {...register("step1.name")} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all" placeholder="성함을 적어주세요" />
    </div>
  );
}