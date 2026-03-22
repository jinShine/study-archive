import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 font-sans">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-10 text-center border border-slate-200">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">🚀 PPR Architecture</h1>
        <p className="text-slate-500 mb-8 leading-relaxed font-semibold">
          속도(SSG)와 신선도(SSR)의 완벽한 융합을 증명하십시오.
        </p>
        
        <Link href="/dashboard/SEOUL_HQ" className="block w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
          👉 글로벌 대시보드 진입 (PPR 테스트)
        </Link>
      </div>
    </div>
  );
}