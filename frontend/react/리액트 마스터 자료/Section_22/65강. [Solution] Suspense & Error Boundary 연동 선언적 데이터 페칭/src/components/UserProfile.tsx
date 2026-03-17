import { useSuspenseQuery } from '@tanstack/react-query';
import { fetchUser } from '../api/mockApi';
import { userKeys } from '../queries/queryKeys';
import type { User } from '../api/mockApi'; // ✅ Type-only import

const styles = {
  container: { border: '2px solid #333', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#f8f9fa', textAlign: 'center' as const },
  avatar: { width: '80px', borderRadius: '50%', marginBottom: '10px' }
};

export default function UserProfile({ id }: { id: number }) {
  // 1. 데이터가 올 때까지 이 컴포넌트는 실행을 '중단(Suspend)'합니다.
  const { data: user } = useSuspenseQuery<User>({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
  });

  // 2. 이 지점부터는 user가 무조건 존재함이 보장됩니다. (if loading 분기 불필요)
  return (
    <div style={styles.container}>
      <img src={user.avatar} alt={user.name} style={styles.avatar} />
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}