import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '../api/mockApi';
import { userKeys } from '../queries/queryKeys';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function UserProfile({ userId }: { userId: number }) {
  const { data, isPending, error } = useQuery<User, Error>({
    // 1. 바코드(Key): 중복 요청을 걸러내는 식별자
    queryKey: userKeys.detail(userId),
    
    // 2. 지침서(Fn): 실제로 어떻게 가져올 것인가?
    queryFn: () => fetchUserById(userId),

    // 3. 신선도(staleTime): 5분간은 '신선함'을 보장 (추가 요청 방지)
    staleTime: 1000 * 60 * 5,

    // 4. 보관소(gcTime): 안 쓰는 데이터도 10분간 메모리에 유지
    gcTime: 1000 * 60 * 10,
  });

  if (isPending) return <div style={styles.card}>⌛ 엔진이 데이터를 동기화 중...</div>;
  if (error) return <div style={{...styles.card, borderColor: 'red'}}>❌ 에러: {error.message}</div>;

  return (
    <div style={styles.card}>
      <h4>👤 {data.name}</h4>
      <p>📧 {data.email}</p>
      <small style={{color: '#888'}}># {userKeys.detail(userId).join(' > ')}</small>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ddd',
    padding: '1rem',
    margin: '10px',
    borderRadius: '8px',
    minWidth: '200px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }
};