'use server';
import { updateTag, revalidateTag } from 'next/cache';

let mockReviews = [
  { id: '1', content: '디자인이 정말 아름답네요. 문제 해결의 정수가 담겨있습니다.', author: 'Stella' },
  { id: '2', content: '음질이 끔찍하네요! 당장 환불해주세요!!! (악성 리뷰)', author: 'Oliver' },
  { id: '3', content: '배송도 빠르고 기술력이 돋보입니다.', author: 'Chloe' },
  { id: '4', content: '최고의 사용자 경험입니다.', author: 'Noah' },
  { id: '5', content: '아키텍처 설계가 예술의 경지네요.', author: 'Leo' },
  { id: '6', content: '모든 컴포넌트가 유기적으로 연결되어 있습니다.', author: 'Elena' }
];

export async function getReviews() {
  await new Promise(res => setTimeout(res, 500)); 
  return mockReviews;
}

export async function deleteReviewSoftAction(reviewId: string) {
  mockReviews = mockReviews.filter(r => r.id !== reviewId);
  revalidateTag('global-reviews', 'max'); 
}

export async function deleteReviewInstantAction(reviewId: string) {
  mockReviews = mockReviews.filter(r => r.id !== reviewId);
  updateTag('global-reviews'); 
}