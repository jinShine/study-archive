import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-xl w-full bg-slate-800 shadow-2xl rounded-3xl p-10 text-center border border-slate-700">
        <h1 className="text-3xl font-black text-white mb-4">🛡️ 통합 보안 파이프라인</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          useActionState가 장착된 완벽한 피드백 시스템 작동을 검증하십시오.
        </p>
        <Link href="/security/clearance">
          <button className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all cursor-pointer shadow-md">
            👉 보안 인가 발급소 진입
          </button>
        </Link>
      </div>
    </div>
  );
}