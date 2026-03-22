import { Suspense } from 'react';
import PhotoDetail from './PhotoDetail';

export default function StandardPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
      <Suspense fallback={<p className="text-emerald-400 font-bold animate-pulse">⏳ 단독 사진 페이지 동기화 중...</p>}>
        <PhotoDetail paramsPromise={params} />
      </Suspense>
    </div>
  );
}