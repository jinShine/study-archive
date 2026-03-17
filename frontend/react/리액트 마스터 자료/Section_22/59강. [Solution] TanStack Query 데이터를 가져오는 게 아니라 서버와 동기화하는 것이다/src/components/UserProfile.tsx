import { useQuery } from '@tanstack/react-query';
import { fetchUserData } from '../api/mockApi';
import type { UserData } from '../api/mockApi';

export default function UserProfile({ userId }: { userId: number }) {
  const { data, isPending, error } = useQuery<UserData, Error>({
    queryKey: ['user', userId],
    queryFn: () => fetchUserData(userId),
    staleTime: 1000 * 60 * 5, // 5분간 신선함 유지
  });

  if (isPending) return <div>⌛ 엔진이 서버와 데이터를 동기화 중입니다...</div>;
  if (error) return <div>❌ 에러 발생: {error.message}</div>;

  return (
    <div style={{ border: '2px solid #3498db', padding: '1rem', margin: '10px', borderRadius: '8px' }}>
      <h4>유저 정보 (실시간 동기화) 🛰️</h4>
      <p>이름: <strong>{data?.name}</strong></p>
      <p>이메일: {data?.email}</p>
      <small style={{ color: '#666' }}>💡 동일 ID의 컴포넌트가 여러 개여도 네트워크 요청은 1번만 발생합니다.</small>
    </div>
  );
}