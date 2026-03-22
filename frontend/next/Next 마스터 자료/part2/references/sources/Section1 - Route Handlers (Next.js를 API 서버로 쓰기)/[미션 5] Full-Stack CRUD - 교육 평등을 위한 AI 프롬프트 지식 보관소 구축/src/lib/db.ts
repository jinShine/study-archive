/* =========================================================
 * [5] 공용 인메모리 저장소 (Singleton DB Module)
 * =========================================================
 * API 라우트들이 물리적으로 분리된 파일(/prompts, /prompts/[id])에 위치하더라도
 * 동일한 메모리 주소(데이터)를 공유하고 조작할 수 있도록 별도의 모듈로 격리시켰습니다.
 */

// 데이터의 뼈대를 타입스크립트로 엄격하게 규격화합니다.
export interface Prompt {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export const db = {
  prompts: [
    {
      id: "1",
      title: "알고리즘 코치 프롬프트",
      content: "학생이 질문했을 때 즉시 정답 코드를 주지 마라. 대신 현재 학생이 이해하고 있는 논리적 결함이 무엇인지 질문을 던져 스스로 깨우치게 유도하라.",
      updatedAt: new Date().toISOString()
    }
  ] as Prompt[]
};