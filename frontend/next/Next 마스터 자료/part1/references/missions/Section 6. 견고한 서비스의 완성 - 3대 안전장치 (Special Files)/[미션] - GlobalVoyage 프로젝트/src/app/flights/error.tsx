'use client';

import { useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function FlightsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  const router = useRouter();

  useEffect(() => { console.error("🚨 캡처된 에러:", error); }, [error]);

  return (
    <div className="m-10 p-16 bg-red-50 border-4 border-red-100 rounded-[4rem] text-center shadow-2xl">
      <div className="text-8xl mb-8">🛠️</div>
      <h2 className="text-4xl font-black text-red-900 tracking-tighter uppercase mb-4 italic">System Disruption</h2>
      <p className="text-red-700 font-bold mb-10">연결이 원활하지 않습니다. 아래 버튼으로 재접속을 시도하세요.</p>
      <button 
        onClick={() => {
          startTransition(() => {
            router.refresh();
            reset();
          });
        }} 
        className="px-14 py-6 bg-red-600 text-white rounded-full font-black text-xl shadow-2xl hover:bg-red-700 active:scale-95 transition-all"
      >
        데이터 다시 불러오기
      </button>
      {error.digest && <p className="mt-10 text-[10px] text-red-300 font-mono uppercase opacity-50">Trace-ID: {error.digest}</p>}
    </div>
  );
}
