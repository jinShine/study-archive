import { Suspense } from 'react';
import ModalDetail from './ModalDetail';
export default function PhotoModalPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl relative">
        <Suspense fallback={<p className="text-gray-500 font-bold animate-pulse text-center">⏳ 모달 데이터 로딩 중...</p>}>
          <ModalDetail paramsPromise={params} />
        </Suspense>
      </div>
    </div>
  );
}