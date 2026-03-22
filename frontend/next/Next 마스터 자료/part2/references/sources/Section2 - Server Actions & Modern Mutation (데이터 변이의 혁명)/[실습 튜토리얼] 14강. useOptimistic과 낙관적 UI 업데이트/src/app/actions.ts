'use server';
import { revalidatePath } from 'next/cache';

export async function toggleProductLikeAction(productId: string, newLikeStatus: boolean) {
  // 1초 지연 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 10% 확률로 서버 통신 실패 시뮬레이션
  if (Math.random() < 0.1) {
    throw new Error("서버 통신 중 알 수 없는 에러가 발생했습니다.");
  }

  console.log(`💾 [DB 업데이트 완료] 상품 ${productId} 좋아요 상태: ${newLikeStatus}`);
  revalidatePath(`/products/${productId}`);
  return newLikeStatus;
}