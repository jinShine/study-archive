import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 font-sans">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-10 text-center border border-slate-200">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">🎯 흐름 통제소</h1>
        <p className="text-slate-500 mb-8 leading-relaxed font-semibold">
          사용자의 라우팅 흐름을 기민하게 낚아채는 함정을 검증하십시오.
        </p>

        <Link href="/feed" className="block w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
          👉 멘토링 피드 진입 (테스트 시작)
        </Link>
      </div>
    </div>
  );
}