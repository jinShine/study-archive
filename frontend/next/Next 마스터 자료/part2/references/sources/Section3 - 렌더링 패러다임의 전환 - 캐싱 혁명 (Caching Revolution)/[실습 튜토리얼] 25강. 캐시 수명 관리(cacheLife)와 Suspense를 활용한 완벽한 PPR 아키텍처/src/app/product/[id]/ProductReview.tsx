'use cache';
import { cacheLife } from 'next/cache';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export default async function ProductReview({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const resolvedParams = await paramsPromise;
  cacheLife('minutes');
  await delay(3000);
  const renderTime = new Date().toLocaleTimeString();

  return (
    <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
      <h3 className="text-xl font-bold mb-2">⭐ 실시간 구매 리뷰</h3>
      <p className="text-gray-700">정말 훌륭한 상품({resolvedParams.id})입니다! Suspense 방호벽 덕분에 살았네요.</p>
      <div className="mt-4 p-3 bg-white rounded-lg inline-block shadow-sm">
        <p className="text-blue-700 font-mono text-sm">
          마지막 서버 갱신 시간: <span className="font-bold">{renderTime}</span>
        </p>
      </div>
    </div>
  );
}