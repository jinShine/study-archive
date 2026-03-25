import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '../lib/get-query-client';
import PostList from './PostList';

async function PrefetchedPostList() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts');
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  );
}

export default function PostsPage() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-gray-900">서버에서 미리 가져온 게시글</h1>
      <p className="text-gray-600 mt-2">로딩 스피너 없이 0.1초만에 그려지는 화면을 경험해보세요!</p>

      <Suspense fallback={<p className="text-blue-500 mt-4">주방에서 요리를 준비 중입니다...</p>}>
        <PrefetchedPostList />
      </Suspense>
    </main>
  );
}