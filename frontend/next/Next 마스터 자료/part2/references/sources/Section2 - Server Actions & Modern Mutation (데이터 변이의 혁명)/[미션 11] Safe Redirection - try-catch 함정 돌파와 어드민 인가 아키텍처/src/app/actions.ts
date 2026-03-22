'use server';

import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { cookies } from 'next/headers';

export interface AuthState {
  success: boolean;
  message: string;
}

export async function authenticateAdminAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const secretCode = formData.get('secretCode') as string;
  
  // 상태 추적 깃발(Flag)
  let isSuccess = false;

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); 

    if (!secretCode) throw new Error("인가 코드가 비어있습니다.");
    if (secretCode !== "ARCHITECT_2026") throw new Error("유효하지 않은 인가 코드! 보안팀에 기록됩니다.");

    console.log(`🔐 [보안 통과] 관리자 인가 성공`);
    
    // 쿠키 배지 발급
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'true', { httpOnly: true, secure: true, path: '/' });

    // 안전하게 성공 깃발만 들어 올립니다.
    isSuccess = true;

  } catch (error) {
    // 💡 [방어 코드] 하위 함수에서 발생한 리다이렉트 에러를 구출하여 밖으로 던집니다.
    if (isRedirectError(error)) throw error;

    console.error("서버 인가 에러:", error);
    return { success: false, message: error instanceof Error ? error.message : "서버 오류" };
  }

  // 🚨 [안전 지대] try-catch 바깥 여백에서 브라우저를 이동시킵니다.
  if (isSuccess) {
    redirect('/admin/dashboard');
  }

  return { success: true, message: "" };
}