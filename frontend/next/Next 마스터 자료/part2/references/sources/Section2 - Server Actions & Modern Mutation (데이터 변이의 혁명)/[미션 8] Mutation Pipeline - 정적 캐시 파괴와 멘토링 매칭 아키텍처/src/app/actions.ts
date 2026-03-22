'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db, MentoringRequest } from '@/lib/db';

export interface MentoringFormState {
  success: boolean;
  message: string;
  attemptCount: number;
}

// 🚨 절대 규칙: 클라이언트의 useActionState 훅과 연결되기 위해 첫 번째 인자로 prevState를 받습니다.
export async function applyMentoringAction(
  prevState: MentoringFormState,
  formData: FormData
): Promise<MentoringFormState> {
  const currentAttempt = prevState.attemptCount + 1;
  const studentName = formData.get("studentName") as string;
  const topic = formData.get("topic") as string;

  // 1. 유효성 검사 (프론트엔드로 튕겨낼 에러 상태 객체 조립)
  if (!studentName || !topic) {
    return { success: false, message: "이름과 학습 주제를 모두 입력해야 합니다.", attemptCount: currentAttempt };
  }

  // 2. DB 저장 (1.5초 네트워크 지연 시뮬레이션)
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  db.mentoringList.unshift({
    id: Date.now().toString(), studentName, topic, appliedAt: new Date().toISOString()
  });
  console.log(`💾 [DB 저장 완료] ${studentName} 학생 멘토링 접수`);

  // =========================================================================
  // 💣 3. 캐시 폭파 명령 (Cache Invalidation)
  // =========================================================================
  // 빌드 시점에 굳어져 버린 정적 HTML 스냅샷(Full Route Cache)에
  // 'Stale(만료됨)' 낙인을 찍고 즉시 폐기하라고 명령합니다.
  revalidatePath('/korapaduck');

  // =========================================================================
  // 🚀 4. 사용자 동선 강제 이동 (Redirect)
  // =========================================================================
  // redirect 함수는 내부적으로 NEXT_REDIRECT 에러를 throw하여 
  // 함수의 실행 흐름을 중단시키고 브라우저를 이동시킵니다. (try-catch로 감싸면 안 됩니다)
  redirect('/korapaduck');
}