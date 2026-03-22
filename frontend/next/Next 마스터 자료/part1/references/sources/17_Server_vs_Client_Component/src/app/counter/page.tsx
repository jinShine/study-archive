'use client'; // [강의 포인트] 이 지시어가 없으면 useState 사용 시 에러가 발생합니다.

import { useState } from 'react';

export default function CounterPage() {
  // 브라우저의 메모리를 사용하는 상태 관리
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 bg-white rounded-[3rem] shadow-2xl shadow-blue-100 border border-slate-100 m-10">
      <div className="text-center">
        <span className="bg-blue-100 text-blue-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
            Client Component
        </span>
        <h1 className="text-6xl font-black text-slate-800 mt-6 tracking-tighter">
          Count: <span className="text-blue-600">{count}</span>
        </h1>
      </div>

      <div className="flex gap-4">
        {/* [강의 포인트] onClick과 같은 이벤트 리스너는 서버 컴포넌트에서는 동작하지 않습니다. */}
        <button
          onClick={() => setCount(count + 1)}
          className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-100"
        >
          Increase +
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-10 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
        >
          Reset
        </button>
      </div>

      <p className="text-slate-400 text-sm italic font-medium">
        💡 'use client' 덕분에 브라우저에서 실시간 상호작용이 가능해졌습니다!
      </p>
    </div>
  );
}
