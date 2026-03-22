import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      <div className="p-10 bg-white shadow-2xl rounded-3xl border border-gray-100 max-w-lg w-full text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">통제 센터</h1>
        <p className="text-gray-500 mb-10 leading-relaxed">Next.js 15 비동기 파이프라인이<br/>성공적으로 가동되었습니다.</p>
        
        <Link href="/instances/AZ-999">
          <button className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-gray-800 transition-all shadow-xl active:scale-95 cursor-pointer">
            👉 AZ-999 실시간 모니터링 가동
          </button>
        </Link>
      </div>
    </div>
  );
}
