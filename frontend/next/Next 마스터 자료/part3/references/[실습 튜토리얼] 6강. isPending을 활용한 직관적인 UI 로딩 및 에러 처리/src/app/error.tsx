'use client';
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-10 bg-red-50 border border-red-200 rounded-2xl text-center">
      <h2 className="text-red-700 font-bold mb-2">문제가 발생했습니다!</h2>
      <p className="text-red-500 mb-6">{error.message}</p>
      <button onClick={() => reset()} className="bg-red-600 text-white px-6 py-2 rounded-lg">다시 시도</button>
    </div>
  );
}