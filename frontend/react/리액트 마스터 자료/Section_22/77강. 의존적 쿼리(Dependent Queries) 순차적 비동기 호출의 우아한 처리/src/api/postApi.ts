export interface User { id: number; name: string; }
export interface Post { id: number; title: string; }

export const fetchUserByEmail = async (email: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: 101, name: '우리동네코딩' }), 500);
  });
};

export const fetchPostsByUserId = async (userId: number): Promise<Post[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: '의존적 쿼리 완벽 가이드' },
        { id: 2, title: 'TanStack Query 실무 팁' }
      ]);
    }, 500);
  });
};