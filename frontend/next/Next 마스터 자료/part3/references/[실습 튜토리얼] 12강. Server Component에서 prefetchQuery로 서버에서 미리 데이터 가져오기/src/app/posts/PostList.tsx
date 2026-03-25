'use client';

import { useQuery } from '@tanstack/react-query';

export default function PostList() {
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts');
      if (!res.ok) throw new Error('네트워크 응답이 좋지 않습니다.');
      return res.json();
    },
  });

  if (isLoading) return <p className="text-gray-500">로딩 중...</p>;
  if (isError) return <p className="text-red-500">에러가 발생했습니다.</p>;

  return (
    <ul className="mt-6">
      {posts?.slice(0, 5).map((post: any) => (
        <li key={post.id} className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl text-blue-600 font-semibold mb-2">{post.title}</h2>
          <p className="text-gray-700">{post.body}</p>
        </li>
      ))}
    </ul>
  );
}