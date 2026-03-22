export default async function ArchiveInsightPage() {
  // 외과의사의 메스처럼 정확하게 성능 극대화 스위치를 켭니다.
  const res = await fetch('https://dummyjson.com/quotes/random', {
    cache: 'force-cache'
  });
  const data = await res.json();

  console.log(`❄️ [Archive Fetch] 코어 철학 박제: ${data.quote.slice(0, 15)}...`);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-emerald-500/30 max-w-2xl w-full">
        <h1 className="text-3xl font-black text-slate-900 mb-6 text-center">❄️ 강제 동결 (force-cache)</h1>
        <p className="text-slate-500 mb-8 font-semibold text-center leading-relaxed">
          최초 1회만 API를 호출하고 결과물을 영구 박제합니다. 절대 변하지 않는 교육 커리큘럼이나 회사의 핵심 비전을 전달할 때 서버 비용을 0원으로 만듭니다.
        </p>
        <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200 relative">
          <span className="text-6xl text-emerald-500/20 absolute top-4 left-4">"</span>
          <p className="text-xl text-slate-800 font-medium leading-loose relative z-10 text-center px-4">
            {data.quote}
          </p>
          <p className="text-right text-emerald-600 font-bold mt-6">- {data.author}</p>
        </div>
      </div>
    </div>
  );
}