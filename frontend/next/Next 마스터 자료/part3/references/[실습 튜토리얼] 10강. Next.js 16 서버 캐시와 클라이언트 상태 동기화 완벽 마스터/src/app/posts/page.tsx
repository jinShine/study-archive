import { Suspense } from 'react';
import PostListInitial from '@/components/PostListInitial';

async function getCachedData() {
  "use cache";
  const res = await fetch('http://localhost:3000/api/posts');
  const posts = await res.json();
  const serverTime = Date.now(); // 냉장고 들어가는 찰나의 시간!
  return { posts, serverTime };
}

export default async function PostsPage() {
  const { posts, serverTime } = await getCachedData();

  return (
    <main className="p-8 max-w-2xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">서버에서 미리 준비한 게시글</h1>
      {/* 매니저가 시계를 보는 동안 충돌을 막아주는 Suspense 천막! */}
      <Suspense fallback={<div className="p-4 text-gray-500">홀 매니저가 요리를 준비 중입니다...</div>}>
        <PostListInitial initialData={posts} updatedAt={serverTime} />
      </Suspense>
    </main>
  );
}
