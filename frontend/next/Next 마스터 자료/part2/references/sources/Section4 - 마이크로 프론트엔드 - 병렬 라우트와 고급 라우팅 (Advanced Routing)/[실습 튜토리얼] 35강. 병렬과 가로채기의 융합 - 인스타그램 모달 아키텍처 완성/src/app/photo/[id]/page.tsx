import { Suspense } from 'react';
import StandardDetail from './StandardDetail';
export default function StandardPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
      <Suspense fallback={<p className="text-emerald-400 font-bold animate-pulse text-xl">⏳ 단독 페이지 동기화 중...</p>}>
        <StandardDetail paramsPromise={params} />
      </Suspense>
    </div>
  );
}