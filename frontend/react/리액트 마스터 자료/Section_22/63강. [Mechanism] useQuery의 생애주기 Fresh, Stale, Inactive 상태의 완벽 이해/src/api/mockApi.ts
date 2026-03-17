export interface User { id: number; name: string; }
export const fetchUser = async (id: number): Promise<User> => {
  console.log(`📡 [Network Log] 서버와 데이터(ID: ${id}) 동기화 시도 중...`);
  return new Promise((resolve) => {
    setTimeout(() => { resolve({ id, name: "시니어 아키텍트" }); }, 1000);
  });
};