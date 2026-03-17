import { useQuery } from '@tanstack/react-query';
import { fetchUserByEmail, fetchPostsByUserId } from '../api/postApi';

export const UserPosts = ({ email }: { email: string }) => {
  const { data: user } = useQuery({
    queryKey: ['user', email],
    queryFn: () => fetchUserByEmail(email),
  });

  const userId = user?.id;

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPostsByUserId(userId!),
    enabled: !!userId,
  });

  if (!user || isPostsLoading) {
    return <div style={{ padding: '1rem' }}>데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div style={{ padding: '1.5rem', border: '1px solid #4a90e2', borderRadius: '12px' }}>
      <h1>{user.name}님의 게시글</h1>
      <hr />
      <ul>
        {posts?.map(post => (
          <li key={post.id} style={{ marginBottom: '10px' }}>
            <strong>{post.title}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};