'use server';
export async function createProductAction(formData: FormData) {
  // 🚨 펜딩 UI 검증을 위한 2초 지연 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const title = formData.get("title") as string;
  const price = Number(formData.get("price"));
  if (!title || price <= 0) throw new Error("입력 오류");

  console.log(`💾 [DB 저장 완료] 상품명: ${title}, 가격: ${price}원`);
  return { success: true, message: "등록 성공" };
}