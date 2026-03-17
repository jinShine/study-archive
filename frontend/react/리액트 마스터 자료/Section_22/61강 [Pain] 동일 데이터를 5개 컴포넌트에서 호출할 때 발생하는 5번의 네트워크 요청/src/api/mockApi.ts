export interface User {
  id: number;
  name: string;
  email: string;
  bio: string;
}

// 호출 횟수를 추적하기 위한 전역 변수 (실습용)
let callCount = 0;

export const fetchUser = async (): Promise<User> => {
  callCount++;
  console.log(`📡 [Network Log] 서버 요청 발생! (총 호출 횟수: ${callCount})`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: "프론트엔드 시니어",
        email: "senior@dev.com",
        bio: "리액트 아키텍처를 설계하는 개발자입니다."
      });
    }, 1000); // 1초 지연
  });
};