import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-xl w-full bg-slate-900 shadow-2xl rounded-3xl p-10 text-center border border-slate-800">
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">🦆 Korapaduck Gateway</h1>
        <p className="text-slate-400 mb-8 leading-relaxed font-medium">
          try-catch 함정을 돌파하는 안전한 리다이렉션 통제소를 검증하십시오.
        </p>
        <Link href="/admin/login" className="block w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
          👉 어드민 로그인 진입 (테스트 시작)
        </Link>
      </div>
    </div>
  );
}