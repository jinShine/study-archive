import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { fetchPosts, fetchPostById } from '../api/mockApi';
import type { Post } from '../api/mockApi';

export default function PostList({ onSelect }: { onSelect: (id: number) => void }) {
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam as number),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    maxPages: 3, // ✨ 추가된 속성: 메모리 관리를 위해 최대 3페이지만 유지
  });

  // [상황 1] 마우스 호버 프리페칭
  const handleMouseEnter = async (id: number) => {
    await queryClient.prefetchQuery({
      queryKey: ['post', id],
      queryFn: () => fetchPostById(id),
      staleTime: 1000 * 60 * 5,
    });
  };

  // [상황 2] 선제적 무한 스크롤 트리거
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {allPosts.map((post) => (
          <li
            key={post.id}
            onMouseEnter={() => handleMouseEnter(post.id)}
            onClick={() => onSelect(post.id)}
            style={{ padding: '1rem', border: '1px solid #eee', marginBottom: '0.5rem', cursor: 'pointer', borderRadius: '8px' }}
          >
            <strong>{post.id}. {post.title}</strong>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>마우스를 올리면 미리 가져옵니다</div>
          </li>
        ))}
      </ul>
      <div ref={loadMoreRef} style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isFetchingNextPage && '🛰️ 발바닥이 닿기 전 다음 데이터를 당겨오는 중...'}
      </div>
    </div>
  );
}

