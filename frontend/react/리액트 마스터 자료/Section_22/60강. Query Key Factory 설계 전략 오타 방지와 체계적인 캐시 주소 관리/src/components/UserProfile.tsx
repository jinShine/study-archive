import { useQuery } from '@tanstack/react-query';
import { fetchUserData } from '../api/mockApi';
import { userKeys } from '../queries/queryKeys';
import type { UserData } from '../api/mockApi';

export default function UserProfile({ userId }: { userId: number }) {
  const { data, isPending, error } = useQuery<UserData, Error>({
    // Factory를 통해 안전하게 키를 생성합니다.
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUserData(userId),
  });

  if (isPending) return <div>⌛ 엔진이 데이터를 찾는 중...</div>;
  if (error) return <div>❌ 에러 발생: {error.message}</div>;

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', background: '#f9f9f9' }}>
      <h4>유저 정보 (ID: {userId})</h4>
      <p>이름: <strong>{data.name}</strong></p>
      <p>이메일: {data.email}</p>
    </div>
  );
}