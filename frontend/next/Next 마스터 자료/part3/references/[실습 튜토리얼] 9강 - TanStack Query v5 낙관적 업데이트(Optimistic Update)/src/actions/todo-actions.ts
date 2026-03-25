'use server';
import { revalidatePath } from 'next/cache';

export async function updateTodoAction(todo: any) {
  await new Promise(r => setTimeout(r, 1500));
  if (Math.random() < 0.1) {
    throw new Error('서버 에러 발생');
  }
  revalidatePath('/todos');
  return todo;
}