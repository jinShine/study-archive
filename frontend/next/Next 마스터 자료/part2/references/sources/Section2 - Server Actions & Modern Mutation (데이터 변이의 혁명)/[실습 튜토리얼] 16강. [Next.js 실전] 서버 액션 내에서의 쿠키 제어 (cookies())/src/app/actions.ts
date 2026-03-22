// src/app/actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function toggleThemeAction() {
  const cookieStore = await cookies();
  const currentTheme = cookieStore.get('theme')?.value || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  // 로딩 UI(isPending)를 육안으로 감상하기 위한 1초 의도적 지연
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 🚨 아키텍트의 보안 통제: 클라이언트의 JS가 접근하지 못하도록 강력한 속성을 주입합니다.
  cookieStore.set('theme', newTheme, {
    httpOnly: true, // XSS 공격 원천 차단
    secure: process.env.NODE_ENV === 'production', // 실서버 HTTPS 강제
    sameSite: 'lax', // CSRF 방어
    maxAge: 60 * 60 * 24 * 365, // 1년 유지
    path: '/',
  });

  console.log(`🌙 [테마 변경] 서버가 사용자의 테마를 '${newTheme}'로 기억합니다.`);

  // 화면이 새로운 테마를 즉시 반영할 수 있도록 루트 레이아웃 캐시 무효화
  revalidatePath('/', 'layout');
}