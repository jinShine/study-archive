import React from 'react';

/**
 * ProductsPage: ISR(점진적 정적 재생성)을 확인하는 실습 페이지
 */
export default async function ProductsPage() {
  // [강의 포인트] 3초마다 재검증하도록 설정된 fetch 요청
  const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul', {
    next: { revalidate: 3 }, // 주의: 밀리초(3000)가 아닌 초(3) 단위입니다!
  });

  const timeData = await res.json();

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 p-10 bg-white rounded-[3rem] shadow-xl shadow-indigo-100/20 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </div>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">ISR Active (3s Window)</span>
          </div>
          
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">
            {timeData.time}
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            마지막 갱신 시점: <span className="text-pink-600 font-mono font-bold">{timeData.dateTime}</span>
          </p>
          
          <div className="mt-10 p-6 bg-slate-900 rounded-3xl text-white">
            <h4 className="font-bold mb-2 flex items-center gap-2">
               <span>💡</span> ISR 작동 테스트 가이드
            </h4>
            <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
              <li><code className="text-indigo-300">npm run build</code> 실행 후 <code className="text-indigo-300">npm start</code>를 하세요.</li>
              <li>페이지를 빠르게 연타하면 시간이 변하지 않습니다 (Cache Hit).</li>
              <li>3초가 지난 뒤 새로고침을 하면 <strong>처음엔 그대로</strong>지만, <strong>한 번 더</strong> 하면 시간이 바뀝니다!</li>
            </ul>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 mb-2">Stale (오래된 데이터)</h3>
            <p className="text-slate-500 text-sm italic">유효기간이 지났지만 사용자 대기를 방지하기 위해 먼저 보여주는 데이터입니다.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 mb-2">Revalidate (재검증)</h3>
            <p className="text-slate-500 text-sm italic">사용자가 옛날 데이터를 보는 동안 백그라운드에서 API를 호출해 캐시를 최신화합니다.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
