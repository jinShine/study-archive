'use server';

import { updateTag, revalidateTag } from 'next/cache';

let mockEvaluations = [
  { id: '1', content: '디자인이 정말 아름답네요. 문제 해결의 정수가 담겨있습니다.', author: 'Stella' },
  { id: '2', content: '강의가 너무 지루해요! 당장 환불해주세요!!! (악성 리뷰)', author: 'Oliver' },
  { id: '3', content: '배송도 빠르고 기술력이 돋보입니다.', author: 'Chloe' },
  { id: '4', content: '최고의 사용자 경험입니다.', author: 'Noah' }
];

export async function getEvaluations() {
  await new Promise(res => setTimeout(res, 500));
  return mockEvaluations;
}

export async function deleteEvalSoftAction(evalId: string) {
  mockEvaluations = mockEvaluations.filter(r => r.id !== evalId);
  revalidateTag('global-evals', 'max');
}

export async function deleteEvalInstantAction(evalId: string) {
  mockEvaluations = mockEvaluations.filter(r => r.id !== evalId);
  updateTag('global-evals');
}