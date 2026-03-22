'use server';

import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { cookies } from 'next/headers';

export async function safeCreatePostAction(formData: FormData) {
  let isSuccess = false;
  try {
    const title = formData.get('title');
    if (!title) throw new Error("제목 필수");
    console.log(`💾 [DB 저장 완료] 제목: ${title}`);
    const cookieStore = await cookies();
    cookieStore.set('author_badge', 'true', { httpOnly: true, secure: true });
    isSuccess = true;
  } catch (error) {
    if (isRedirectError(error)) throw error; 
    console.error("서버 처리 중 오류:", error);
    return { success: false, message: "작성 실패" };
  }
  if (isSuccess) { redirect('/posts'); }
}