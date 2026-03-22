'use server';
import { revalidatePath } from 'next/cache';

let mockReviews = [
  { id: '1', productId: '123', content: '정말 훌륭한 상품입니다!', author: '김유저' },
  { id: '2', productId: '123', content: '정말 최악의 쓰레기 상품이네요! (악성 리뷰)', author: '악플러' }
];

export async function getReviews(productId: string) {
  await new Promise(res => setTimeout(res, 500));
  return mockReviews.filter(r => r.productId === productId);
}

export async function deleteReviewAction(reviewId: string, productId: string) {
  try {
    mockReviews = mockReviews.filter(r => r.id !== reviewId);
    console.log(`🗑️ [DB 갱신] 리뷰 ${reviewId} 영구 삭제`);

    revalidatePath(`/product/${productId}`);
    console.log(`🔥 [캐시 파괴] /product/${productId} 최신화 완료`);
  } catch (error) {
    console.error("삭제 실패", error);
  }
}