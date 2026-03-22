// src/app/product/[id]/page.tsx
import { Suspense } from 'react';
import HeavyProductDescription from './HeavyProductDescription';
import RealTimeCart from './RealTimeCart';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // 🚨 아키텍처 규칙: 이 부모 파일(껍데기) 안에서는 절대 `await params`를 수행하지 않습니다.

  return (
    <div className="max-w-3xl mx-auto p-10 bg-white shadow-xl mt-10 rounded-2xl">
      <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter">
        프리미엄 무선 헤드폰
      </h1>

      {/* 💡 캡슐화 1: 실시간 동적 부품 */}
      {/* 24강의 핵심인 스트리밍 방어막입니다. 프레임워크의 빌드 에러를 막아냅니다. */}
      <Suspense fallback={<p className="text-blue-500 font-bold p-6">🛒 실시간 장바구니 로딩중...</p>}>
        <RealTimeCart paramsPromise={params} />
      </Suspense>

      <hr className="my-8 border-gray-200" />

      {/* 💡 캡슐화 2: 무거운 결빙 부품 */}
      <Suspense fallback={<p className="text-red-500 font-bold p-8">❄️ 무거운 상품 설명 로딩중...</p>}>
        <HeavyProductDescription paramsPromise={params} />
      </Suspense>
    </div>
  );
}