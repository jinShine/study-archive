export interface User { id: number; name: string; }
export interface Post { id: number; title: string; content: string; }

/**
 * [원칙] Waterfall 현상 관찰을 위한 지연 API
 * 각각 2초의 지연 시간을 주어 병렬 처리의 효율을 확인합니다.
 */
export const fetchUser = async (id: number): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 0) reject(new Error("존재하지 않는 유저입니다."));
      resolve({ id, name: "시니어 아키텍트" });
    }, 2000);
  });
};

export const fetchPosts = async (id: number): Promise<Post[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "첫 번째 게시글", content: "useSuspenseQueries 최적화 완료!" },
        { id: 2, title: "두 번째 게시글", content: "Waterfall 현상을 격파했습니다." },
      ]);
    }, 2000);
  });
};