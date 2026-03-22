'use server';

interface NewProductData { title: string; price: number; }

export async function createProductAction(formData: FormData) {
  const title = formData.get("title") as string;
  const price = Number(formData.get("price"));

  if (!title || price <= 0) {
    throw new Error("상품명과 올바른 가격을 입력해주세요.");
  }

  console.log(`💾 [DB 저장 완료] 상품명: ${title}, 가격: ${price}원`);
  return { success: true, message: "시스템에 상품이 성공적으로 등록되었습니다." };
}