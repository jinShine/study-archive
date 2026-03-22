'use server';
export interface ProductFormState { success: boolean; message: string; attemptCount: number; }

export async function createProductAction(prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const currentAttempt = prevState.attemptCount + 1;
  console.log(`[시스템 감시] 폼 제출 시도: ${currentAttempt}회차 (직전 메시지: ${prevState.message || '없음'})`);

  const title = formData.get("title") as string;
  const price = Number(formData.get("price"));

  if (!title || title.length < 2) return { success: false, message: "상품명은 최소 2글자 이상 입력해야 합니다.", attemptCount: currentAttempt };
  if (price <= 0) return { success: false, message: "가격은 0원보다 커야 합니다.", attemptCount: currentAttempt };

  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log(`💾 [DB 저장 완료] 상품명: ${title}, 가격: ${price}원`);

  return { success: true, message: `성공적으로 등록되었습니다: ${title}`, attemptCount: currentAttempt };
}