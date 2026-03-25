import { NextResponse } from 'next/server';
import { cart } from '@/app/api/db';
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  await new Promise(r => setTimeout(r, 1500));
  
  // 테스트용: 수량 조절 낙관적 업데이트 롤백을 확인하려면 아래 줄의 주석을 해제하세요.
  // return NextResponse.json({ message: '수량 변경 에러!' }, { status: 500 });
  
  const { quantity } = await req.json();
  const id = parseFloat((await context.params).id);
  const idx = cart.findIndex(t => t.id === id);
  if (idx !== -1) cart[idx].quantity = quantity;
  return NextResponse.json(cart[idx]);
}
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  await new Promise(r => setTimeout(r, 1500));
  const id = parseFloat((await context.params).id);
  const idx = cart.findIndex(t => t.id === id);
  if (idx !== -1) cart.splice(idx, 1);
  return new NextResponse(null, { status: 204 });
}