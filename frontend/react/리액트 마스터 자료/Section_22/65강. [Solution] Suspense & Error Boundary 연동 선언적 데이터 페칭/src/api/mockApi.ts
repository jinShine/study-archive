export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export const fetchUser = async (id: number): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // id가 0이면 에러 발생 (ErrorBoundary 테스트용)
      if (id === 0) reject(new Error("존재하지 않는 유저입니다."));
      resolve({
        id,
        name: "선언적 아키텍트",
        email: "decl@dev.com",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
      });
    }, 2000);
  });
};