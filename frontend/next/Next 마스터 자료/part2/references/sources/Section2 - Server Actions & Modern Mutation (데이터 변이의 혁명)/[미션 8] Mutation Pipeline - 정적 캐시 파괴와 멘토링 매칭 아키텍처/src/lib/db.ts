// [데이터 규격화] 시스템을 관통할 멘토링 신청 데이터의 뼈대
export interface MentoringRequest { id: string; studentName: string; topic: string; appliedAt: string; }

// [공용 인메모리 저장소] 
// 서버 컴포넌트가 localhost API를 찌르다 발생하는 빌드 에러를 방지하기 위해,
// 다이렉트로 데이터를 읽고 쓸 수 있도록 격리해 둔 메모리 DB입니다.
export const db = {
  mentoringList: [
    { 
      id: "1", 
      studentName: "김코딩", 
      topic: "파이썬 기초 문법과 반복문 원리 이해", 
      appliedAt: new Date().toISOString() 
    }
  ] as MentoringRequest[]
};