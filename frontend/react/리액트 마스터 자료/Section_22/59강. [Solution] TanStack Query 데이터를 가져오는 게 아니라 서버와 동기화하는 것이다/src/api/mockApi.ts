export interface UserData {
  id: number;
  name: string;
  email: string;
}

/**
 * [원칙] 실제 서버와 동기화하는 비동기 함수
 * 중복 요청 확인을 위해 콘솔 로그를 남깁니다.
 */
export const fetchUserData = async (userId: number): Promise<UserData> => {
  console.log(`📡 [Network Log] 실제 API 서버에 유저(${userId}) 정보 요청 중...`);
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
  if (!response.ok) throw new Error("네트워크 응답에 문제가 있습니다.");
  return response.json();
};