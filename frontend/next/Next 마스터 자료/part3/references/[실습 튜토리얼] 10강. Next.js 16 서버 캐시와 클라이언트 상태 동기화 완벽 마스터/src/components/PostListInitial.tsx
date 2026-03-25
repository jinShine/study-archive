'use client';

import { useQuery } from '@tanstack/react-query';

interface Post { id: number; title: string; }

export default function PostListInitial({ initialData, updatedAt }: { initialData: Post[], updatedAt: number }) {
  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(res => res.json()),
    initialData: initialData,
    initialDataUpdatedAt: updatedAt,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <ul className="space-y-4">
      {posts?.map((post) => (
        <li key={post.id} className="p-6 bg-white shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition">
          <span className="text-lg font-medium text-gray-700">{post.title}</span>
        </li>
      ))}
    </ul>
  );
}
