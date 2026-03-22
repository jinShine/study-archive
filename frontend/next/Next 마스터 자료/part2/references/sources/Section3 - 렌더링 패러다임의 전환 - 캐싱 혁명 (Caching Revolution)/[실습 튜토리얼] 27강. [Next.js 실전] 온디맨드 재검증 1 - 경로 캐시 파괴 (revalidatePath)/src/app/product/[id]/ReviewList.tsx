'use cache';

import { getReviews, deleteReviewAction } from '@/app/actions';

export default async function ReviewList({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const resolvedParams = await paramsPromise;
  const productId = resolvedParams.id;
  const reviews = await getReviews(productId);

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {reviews.map(review => (
        <li key={review.id} style={{ marginBottom: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
          <strong>{review.author}</strong>: {review.content}
          <form action={deleteReviewAction.bind(null, review.id, productId)} style={{ display: 'inline' }}>
            <button type="submit" style={{ marginLeft: '15px', color: 'white', backgroundColor: '#ef4444', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '12px' }}>
              리뷰 삭제
            </button>
          </form>
        </li>
      ))}
      {reviews.length === 0 && <p style={{ color: 'gray' }}>등록된 리뷰가 없습니다.</p>}
    </ul>
  );
}