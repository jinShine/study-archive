'use client';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import PostList from './PostList';

export default function PostsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl text-gray-900 mb-8">서버와 클라이언트의 완벽한 조화</h1>
      <ErrorBoundary fallback={<div className="text-red-500 font-medium p-4 bg-red-50 rounded-lg">데이터를 불러오는 중 문제가 발생했습니다.</div>}>
        <Suspense fallback={<div className="text-blue-500 font-medium p-4 bg-blue-50 rounded-lg animate-pulse">포스트 목록을 화려하게 스켈레톤 UI로 그리는 중...</div>}>
          <PostList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
