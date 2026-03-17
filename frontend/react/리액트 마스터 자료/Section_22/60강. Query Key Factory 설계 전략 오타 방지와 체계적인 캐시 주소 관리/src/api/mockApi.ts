export interface UserData {
  id: number;
  name: string;
  email: string;
}

export const fetchUserData = async (id: number): Promise<UserData> => {
  console.log(`📡 [Network Log] 서버에서 유저 ${id} 데이터를 가져오는 중...`);
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!response.ok) throw new Error('네트워크 응답에 문제가 있습니다.');
  return response.json();
};