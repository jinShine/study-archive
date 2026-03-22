import { Suspense } from 'react';
import ProductReview from './ProductReview';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-4xl font-black mb-4">프리미엄 무선 헤드폰</h1>
      <p className="text-gray-500 mb-8">1년 내내 변하지 않는 아주 빠른 상품 기본 정보입니다. (Static Shell)</p>
      <hr className="my-8 border-gray-200" />
      <Suspense fallback={
        <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-red-500 font-bold animate-pulse">
          ⏳ 리뷰 데이터를 불러오는 중입니다...
        </div>
      }>
        <ProductReview paramsPromise={params} />
      </Suspense>
      <hr className="my-8 border-gray-200" />
      <p className="text-gray-400 mt-8 text-sm text-center">하단 푸터 영역입니다. (Static Shell)</p>
    </div>
  );
}