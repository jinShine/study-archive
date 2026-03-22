'use server';

export interface ClearanceState {
  success: boolean;
  message: string;
  attemptCount: number;
  clearanceCode?: string;
}

export async function issueClearanceAction(
  prevState: ClearanceState,
  formData: FormData
): Promise<ClearanceState> {

  const currentAttempt = prevState.attemptCount + 1;
  console.log(`[보안 감시] 발급 시도: ${currentAttempt}회차`);

  const empId = formData.get("empId") as string;
  const department = formData.get("department") as string;

  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (!empId || empId.length < 4) {
    return { success: false, message: "사번은 최소 4자리 이상이어야 합니다.", attemptCount: currentAttempt };
  }
  if (!department) {
    return { success: false, message: "부서를 정확히 입력해 주십시오.", attemptCount: currentAttempt };
  }

  const generatedCode = `SEC-${Math.floor(1000 + Math.random() * 9000)}X`;
  console.log(`💾 [DB 기록] ${department} 소속 ${empId} 사번 발급 완료: ${generatedCode}`);

  return {
    success: true,
    message: `정상적으로 발급되었습니다.`,
    attemptCount: currentAttempt,
    clearanceCode: generatedCode
  };
}