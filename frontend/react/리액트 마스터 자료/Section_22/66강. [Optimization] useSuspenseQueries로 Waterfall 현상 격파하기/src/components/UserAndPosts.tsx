import { useSuspenseQueries } from '@tanstack/react-query';
import { fetchUser, fetchPosts } from '../api/mockApi';
import { userKeys, postKeys } from '../queries/queryKeys';
import type { User, Post } from '../api/mockApi'; // ✅ Type-only import

export default function UserAndPosts({ id }: { id: number }) {
  /**
   * [Solution] useSuspenseQueries를 활용한 병렬 페칭 최적화
   * 엔진은 배열 안의 모든 요청을 동시에 실행합니다.
   */
  const [userQuery, postsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: userKeys.detail(id),
        queryFn: () => fetchUser(id),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: postKeys.list(id),
        queryFn: () => fetchPosts(id),
        staleTime: 1000 * 60 * 1,
      },
    ],
  });

  return (
    <section style={{ border: '2px solid #333', padding: '1.5rem', borderRadius: '12px', background: '#fff' }}>
      <h2>🚀 {userQuery.data.name}님의 대시보드</h2>
      <hr />
      <h3>최신 게시글 목록</h3>
      <ul style={{ lineHeight: '1.8' }}>
        {postsQuery.data.map((post) => (
          <li key={post.id}><strong>{post.title}</strong></li>
        ))}
      </ul>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        💡 2개의 요청(각 2초)이 동시에 시작되어 총 2초 만에 완료되었습니다.
      </p>
    </section>
  );
}