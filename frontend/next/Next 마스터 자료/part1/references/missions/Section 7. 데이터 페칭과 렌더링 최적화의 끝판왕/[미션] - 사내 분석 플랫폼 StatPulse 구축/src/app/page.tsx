export default async function Page() {
  // Dynamic: Next.js 15 기본값 (매번 새로고침)
  const dRes = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul');
  const dData = await dRes.json();

  // Static: 강제 캐싱 (빌드 시점에 고정)
  const sRes = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul', {
    cache: 'force-cache'
  });
  const sData = await sRes.json();

  return (
    <div className="p-20 text-white font-sans">
      <h1 className="text-5xl font-black mb-16 italic underline decoration-orange-500">CACHE STRATEGY</h1>
      <div className="grid grid-cols-2 gap-10">
        <div className="p-10 bg-slate-800 rounded-3xl border-b-8 border-orange-500">
          <p className="text-orange-500 font-bold mb-2">DYNAMIC (Always Fresh)</p>
          <p className="text-4xl font-mono">{dData.dateTime.split('T')[1].split('.')[0]}</p>
        </div>
        <div className="p-10 bg-slate-800 rounded-3xl border-b-8 border-slate-600">
          <p className="text-slate-400 font-bold mb-2">STATIC (Build-time Cached)</p>
          <p className="text-4xl font-mono">{sData.dateTime.split('T')[1].split('.')[0]}</p>
        </div>
      </div>
      <p className="mt-20 text-slate-500 font-bold">터미널 명령: npm run build && npm start</p>
    </div>
  );
}
