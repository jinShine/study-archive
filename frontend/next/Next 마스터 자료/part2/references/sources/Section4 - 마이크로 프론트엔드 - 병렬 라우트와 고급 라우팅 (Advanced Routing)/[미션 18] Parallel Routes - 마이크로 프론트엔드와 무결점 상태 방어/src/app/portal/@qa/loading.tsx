export default function QaLoading() {
  return (
    <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 h-full flex flex-col items-center justify-center animate-pulse">
      <span className="text-3xl mb-2">💬</span>
      <p className="text-emerald-600 font-bold text-sm">Q&A 대기열 로딩 중...</p>
    </div>
  );
}