export interface User {
  id: number;
  name: string;
  email: string;
}

let callCount = 0;

export const fetchUserById = async (id: number): Promise<User> => {
  callCount++;
  console.log(`📡 [Network Log] 서버 요청 발생! (ID: ${id}, 총 호출 횟수: ${callCount})`);
  
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!response.ok) throw new Error('서버 응답이 원활하지 않습니다.');
  return response.json();
};