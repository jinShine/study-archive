import { Suspense } from 'react';
import InterceptedDetail from './InterceptedDetail';

export default function InterceptedPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl my-8 shadow-md">
      <Suspense fallback={<p className="text-blue-500 font-bold animate-pulse">⏳ 낚아챈 화면을 구성 중입니다...</p>}>
        <InterceptedDetail paramsPromise={params} />
      </Suspense>
    </div>
  );
}