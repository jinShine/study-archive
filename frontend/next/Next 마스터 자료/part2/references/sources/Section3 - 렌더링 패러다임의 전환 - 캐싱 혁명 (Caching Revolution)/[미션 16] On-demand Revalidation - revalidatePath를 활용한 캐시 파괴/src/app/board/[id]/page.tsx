import { Suspense } from 'react';
import SuggestionList from './SuggestionList';

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-10 font-sans">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200 p-10">
        
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
          🦆 글로벌 익명 건의함
        </h1>
        <p className="text-slate-500 font-medium mb-8">
          이 뼈대(Static Shell)는 번개처럼 나타납니다. 악성 스팸을 즉시 타격하십시오.
        </p>

        <hr className="mb-8 border-slate-200" />

        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span>📬</span> 접수된 건의사항
        </h3>

        {/* Suspense 방호벽으로 동적 데이터를 안전하게 격리합니다. */}
        <Suspense fallback={
          <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3 animate-pulse">
            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-indigo-600 font-bold">⏳ 최신 건의 데이터를 동기화 중입니다...</p>
          </div>
        }>
          <SuggestionList paramsPromise={params} />
        </Suspense>

      </div>
    </div>
  );
}