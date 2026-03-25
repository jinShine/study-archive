'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { postQueries } from './queries';

interface Post {
  id: number;
  title: string;
}

export default function PostList() {
  const { data } = useSuspenseQuery<Post[]>(postQueries.all());

  return (
    <ul className="space-y-3">
      {data.slice(0, 5).map((post: Post) => (
        <li key={post.id} className="p-4 bg-white shadow-md rounded-lg text-gray-800">
          {post.title}
        </li>
      ))}
    </ul>
  );
}
