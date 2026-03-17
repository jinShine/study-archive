import axios from 'axios';

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

/**
 * [원칙] 실제 API 호출 함수
 * JSONPlaceholder의 _page, _limit 파라미터를 활용합니다.
 */
export const fetchPosts = async (pageParam: number): Promise<Post[]> => {
  const response = await axios.get<Post[]>(
    `https://jsonplaceholder.typicode.com/posts?_page=${pageParam}&_limit=10`
  );
  // 0.5초의 지연을 주어 로딩 상태를 관찰합니다.
  await new Promise((resolve) => setTimeout(resolve, 500));
  return response.data;
};