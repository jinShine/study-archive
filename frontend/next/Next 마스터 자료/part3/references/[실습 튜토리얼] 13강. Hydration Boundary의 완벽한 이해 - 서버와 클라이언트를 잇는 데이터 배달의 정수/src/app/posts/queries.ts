import { queryOptions } from '@tanstack/react-query';

export const fetchPosts = async () => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!res.ok) throw new Error('데이터를 가져오는 데 실패했습니다.');
  return res.json();
};

export const postQueries = {
  all: () => queryOptions({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 60 * 1000,
  })
};
