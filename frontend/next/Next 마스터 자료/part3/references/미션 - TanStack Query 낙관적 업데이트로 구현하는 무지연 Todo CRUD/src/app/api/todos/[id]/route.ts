import { NextResponse } from 'next/server';
import { todos } from '../db';
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  await new Promise(r => setTimeout(r, 1500));
  // return NextResponse.json({ message: '에러 테스트' }, { status: 500 });
  const { completed } = await req.json();
  const id = parseFloat((await context.params).id);
  const idx = todos.findIndex(t => t.id === id);
  if (idx !== -1) todos[idx].completed = completed;
  return NextResponse.json(todos[idx]);
}
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  await new Promise(r => setTimeout(r, 1500));
  const id = parseFloat((await context.params).id);
  const idx = todos.findIndex(t => t.id === id);
  if (idx !== -1) todos.splice(idx, 1);
  return new NextResponse(null, { status: 204 });
}
