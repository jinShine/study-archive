export interface Post {
  id: number;
  title: string;
}

/**
 * [원칙] 수동 구현 테스트를 위한 페이지네이션 API
 * 5페이지가 마지막이며, 요청 시마다 1초의 지연이 발생합니다.
 */
export const fetchPostsManual = async (page: number): Promise<Post[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (page > 5) return resolve([]);
      const data = Array.from({ length: 10 }, (_, i) => ({
        id: (page - 1) * 10 + i + 1,
        title: `${page}페이지의 ${i + 1}번째 게시글`
      }));
      resolve(data);
    }, 1000);
  });
};