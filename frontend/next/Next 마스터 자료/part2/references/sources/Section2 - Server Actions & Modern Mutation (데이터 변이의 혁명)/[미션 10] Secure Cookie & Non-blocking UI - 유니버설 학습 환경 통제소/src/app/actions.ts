'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function toggleLearningModeAction() {
  const cookieStore = await cookies();
  const currentMode = cookieStore.get('learningMode')?.value || 'standard';
  const newMode = currentMode === 'standard' ? 'focus' : 'standard';

  // 논블로킹 UI 확인을 위한 1초 딜레이
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 🛡️ [보안 통제소] 클라이언트 JS 접근을 막고, 서버에서 직접 쿠키를 굽습니다.
  cookieStore.set('learningMode', newMode, {
    httpOnly: true, // XSS 공격 원천 차단 방패
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });

  console.log(`🌙 [환경 변경] 사용자의 학습 모드를 '${newMode}'로 안전하게 기억합니다.`);

  // 루트 레이아웃을 완전히 다시 그리도록 캐시를 파기합니다.
  revalidatePath('/', 'layout');
}