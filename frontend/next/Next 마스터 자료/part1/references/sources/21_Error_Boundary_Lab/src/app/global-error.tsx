'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="flex items-center justify-center min-h-screen bg-black text-white p-10">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-6">치명적인 시스템 오류 (Global)</h1>
          <button 
            onClick={() => reset()}
            className="px-8 py-3 bg-white text-black font-bold rounded-xl"
          >
            시스템 재시작
          </button>
        </div>
      </body>
    </html>
  );
}
