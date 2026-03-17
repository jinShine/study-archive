import { useQuery } from '@tanstack/react-query';
import { fetchUserApi, userKeys } from '../api/mockApi';

export default function UserProfile({ id }: { id: number }) {
  const { data: user, isLoading, isFetching } = useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUserApi(id),
    staleTime: 1000 * 60, // 1분간 신선함 유지
  });

  if (isLoading) return <div>유저 정보 로딩 중...</div>;

  return (
    <div style={{ padding: '1rem', border: '2px solid #333', borderRadius: '8px', flex: 1 }}>
      <h2>현재 유저 이름: {user?.name} {isFetching && '🔄'}</h2>
      <p>ID: {user?.id}</p>
      {isFetching && <small style={{color: 'blue'}}>백그라운드에서 신선한 데이터 배달 중...</small>}
    </div>
  );
}