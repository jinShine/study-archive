'use client';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-red-50 border border-red-200 rounded-lg text-center shadow-sm">
      <h2 className="text-xl font-bold text-red-700 mb-2">데이터 로드 실패</h2>
      <p className="text-red-600 mb-6 text-sm">{error.message}</p>
      <button onClick={() => reset()} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">다시 시도하기</button>
    </div>
  );
}
