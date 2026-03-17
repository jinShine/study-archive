import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../api/mockApi';
import { userKeys } from '../queries/queryKeys';
import type { User } from '../api/mockApi';

const styles = {
  container: { border: '2px solid #333', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#f8f9fa' },
  pending: { padding: '1rem', color: '#666', fontStyle: 'italic' },
  error: { color: 'red', fontWeight: 'bold' },
  fetching: { color: '#007bff', fontWeight: 'bold' },
  guide: { marginTop: '20px', fontSize: '14px', color: '#555', borderTop: '1px solid #ddd', paddingTop: '10px' }
};

export default function LifecycleDemo() {
  const { data, isPending, isFetching, error } = useQuery<User, Error>({
    queryKey: userKeys.detail(1),
    queryFn: () => fetchUser(1),
  });

  if (isPending) return <div style={styles.pending}>⌛ 최초 데이터를 가져오는 중입니다... (isPending: true)</div>;
  if (error) return <div style={styles.error}>❌ 에러 발생: {error.message}</div>;

  return (
    <div style={styles.container}>
      <h3>유저 이름: {data.name}</h3>
      {isFetching && <p style={styles.fetching}>🔄 백그라운드에서 데이터를 최신화하고 있습니다... (isFetching: true)</p>}
      <div style={styles.guide}>
        <p>💡 <strong>Fresh 테스트:</strong> 5분 내에 창을 다시 클릭해도 아무 일도 없습니다. (서버 요청 차단)</p>
        <p>💡 <strong>Stale 테스트:</strong> 5분 뒤 창을 다시 클릭하면 파란색 메시지가 깜빡입니다. (백그라운드 갱신)</p>
        <p>💡 <strong>Inactive 테스트:</strong> 컴포넌트를 끄고 10분 뒤 켜면 다시 로딩바부터 시작합니다. (메모리 삭제)</p>
      </div>
    </div>
  );
}