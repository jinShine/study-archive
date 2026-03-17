import { useInfiniteQuery } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { fetchPosts } from '../api/jsonPlaceholder';
import type { Post } from '../api/jsonPlaceholder';

export default function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<Post[], Error, InfiniteData<Post[], number>, string[], number>({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
    
    // ✨ [Next Page Logic]: 다음 페이지 번호를 결정하는 엔진의 두뇌
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    
    initialPageParam: 1,

    // 🛡️ [Senior Point]: 메모리 과부하 방지 (최신 5페이지만 유지)
    maxPages: 5,
    staleTime: 1000 * 60 * 5,
  });

  // 이중 배열 주머니를 단일 배열로 가볍게 펼치기
  const allPosts = data?.pages.flatMap((page) => page) ?? [];

  if (status === 'pending') return <div style={{ padding: '2rem' }}>🚀 초기 데이터를 불러오는 중...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {allPosts.map((post) => (
          <li key={post.id} style={styles.card}>
            <strong>{post.id}. {post.title}</strong>
            <p style={{ color: '#666', fontSize: '14px' }}>{post.body.substring(0, 80)}...</p>
          </li>
        ))}
      </ul>

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        style={{ 
          ...styles.button, 
          backgroundColor: hasNextPage ? '#333' : '#ccc',
          cursor: hasNextPage ? 'pointer' : 'not-allowed'
        }}
      >
        {isFetchingNextPage ? '⏳ 불러오는 중...' : hasNextPage ? '➕ 게시글 더 보기' : '🏁 마지막 페이지입니다'}
      </button>
    </div>
  );
}

const styles = {
  card: { padding: '1.5rem', borderBottom: '1px solid #eee', marginBottom: '10px', backgroundColor: '#fff', borderRadius: '8px' },
  button: { width: '100%', padding: '1rem', color: '#fff', border: 'none', borderRadius: '8px' }
};