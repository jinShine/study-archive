import { useQuery } from '@tanstack/react-query';
import { fetchPostById } from '../api/mockApi';

export default function PostDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPostById(id),
  });

  if (isLoading) return <div style={{ padding: '2rem' }}>⌛ 프리페칭 실패 시 보이는 로딩 화면...</div>;

  return (
    <div style={{ padding: '1.5rem', border: '2px solid #007bff', borderRadius: '12px', backgroundColor: '#f0f7ff' }}>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← 목록으로 돌아가기</button>
      <h2 style={{ color: '#007bff' }}>{post?.title}</h2>
      <p style={{ lineHeight: '1.6' }}>{post?.body}</p>
    </div>
  );
}