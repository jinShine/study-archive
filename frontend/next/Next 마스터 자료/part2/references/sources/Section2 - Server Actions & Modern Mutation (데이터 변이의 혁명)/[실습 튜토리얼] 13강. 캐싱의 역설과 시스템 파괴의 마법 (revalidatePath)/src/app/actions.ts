'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface ProductFormState { success: boolean; message: string; attemptCount: number; }

export async function createProductAction(prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const currentAttempt = prevState.attemptCount + 1;
  const title = formData.get("title") as string;
  const price = Number(formData.get("price"));

  if (!title || title.length < 2) return { success: false, message: "상품명은 2글자 이상", attemptCount: currentAttempt };
  if (price <= 0) return { success: false, message: "가격은 0보다 커야 합니다.", attemptCount: currentAttempt };

  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Mock DB에 실제 데이터 밀어넣기
  await fetch("http://localhost:3000/api/mock-products", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, price })
  });
  console.log(`💾 [DB 저장 완료] 상품명: ${title}`);

  // 💣 캐시 파괴 및 동선 강제 이동
  revalidatePath('/products');
  redirect('/products');
}