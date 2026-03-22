import { Suspense } from 'react';
import ReviewList from './ReviewList';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>프리미엄 헤드폰 상세 페이지</h1>
      <hr style={{ margin: '20px 0' }} />
      <h3>⭐ 고객 리뷰</h3>
      <Suspense fallback={<p style={{ color: 'red', fontWeight: 'bold' }}>⏳ 최신 리뷰를 동기화 중입니다...</p>}>
        <ReviewList paramsPromise={params} />
      </Suspense>
    </div>
  );
}