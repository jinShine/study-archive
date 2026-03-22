import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 font-sans">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-10 text-center border border-slate-200">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">💱 글로벌 환율 센터</h1>
        <p className="text-slate-500 mb-8 leading-relaxed font-semibold">
          성능과 신선도의 궁극적 타협점인 SWR(Stale-While-Revalidate) 패턴을 증명하십시오.
        </p>
        
        <Link href="/exchange" className="block w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
          👉 실시간 글로벌 환율 지표 확인 (10초 ISR)
        </Link>
      </div>
    </div>
  );
}