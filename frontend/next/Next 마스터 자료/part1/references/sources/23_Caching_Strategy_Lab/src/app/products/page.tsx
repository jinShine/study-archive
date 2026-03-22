import React from 'react';

/**
 * ProductsPage: 시간을 통해 캐싱 여부를 확인하는 실습 페이지
 */
export default async function ProductsPage() {
  // [실습 1] Next.js 15 기본 동작 (Dynamic)
  // 별도 옵션이 없으면 매 요청마다 API를 호출합니다.
  // const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul');

  // [실습 2] 정적 렌더링 강제 (Static)
  // 아래 주석을 해제하고 빌드하면 시간 데이터가 빌드 시점에 고정됩니다.
  const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul', {
    cache: 'force-cache', // 데이터를 강제로 저장소에 보관하고 재사용!
  });

  const timeData = await res.json();

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 p-10 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Server-side Clock</span>
          </div>
          
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">
            {timeData.time}
          </h1>
          <p className="text-slate-500 font-medium">
            Data DateTime: <span className="text-indigo-600 font-mono">{timeData.dateTime}</span>
          </p>
          
          <div className="mt-8 pt-8 border-t border-slate-50">
            <p className="text-sm text-slate-400 leading-relaxed">
              💡 <strong>테스트 방법:</strong> <br/>
              1. <code className="bg-slate-100 px-1 rounded text-pink-500 font-bold">npm run build</code> 후 <code className="bg-slate-100 px-1 rounded text-pink-500 font-bold">npm start</code>를 실행하세요. <br/>
              2. 새로고침을 해도 시간이 변하지 않는다면 <strong>Static Rendering</strong>이 성공적으로 적용된 것입니다!
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-lg shadow-indigo-100">
            <h3 className="font-black text-xl mb-2">Dynamic (기본값)</h3>
            <p className="opacity-70 text-sm italic">"항상 최신이지만 서버는 매번 요리해야 합니다."</p>
          </div>
          <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-lg shadow-slate-200">
            <h3 className="font-black text-xl mb-2">Static (force-cache)</h3>
            <p className="opacity-70 text-sm italic">"빛처럼 빠르지만 데이터가 얼어붙어 있습니다."</p>
          </div>
        </section>
      </div>
    </div>
  );
}
