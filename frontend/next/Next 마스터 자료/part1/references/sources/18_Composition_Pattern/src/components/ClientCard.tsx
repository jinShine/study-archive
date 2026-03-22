'use client';
import { ReactNode } from 'react';

export default function ClientCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
      <div className="flex justify-between items-center mb-8">
        <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-xs font-black uppercase">Client Shell</span>
        <button 
          onClick={() => alert('클라이언트 로직 작동!')}
          className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
        >
          상호작용 테스트 ⚡️
        </button>
      </div>

      {/* [강의 포인트] 서버에서 이미 구워진(Rendered) 결과물이 이 자리로 들어옵니다. */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-dashed border-slate-200">
        {children}
      </div>
    </div>
  );
}
