import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/userApi';
import type { User } from '../api/userApi';

export const UserDisplay = () => {
  /**
   * [Case 1] 이름 목록만 추출
   * 제네릭: <User[](원본), Error, string[](결과)>
   */
  const { data: userNames } = useQuery<User[], Error, string[]>({
    queryKey: ['users', 'names'],
    queryFn: fetchUsers,
    // 원본에서 name만 발라내는 셰프의 칼질
    select: (users) => users?.map((u) => u.name) ?? [],
  });

  /**
   * [Case 2] 활성 유저 숫자만 추출 (어댑터 패턴)
   * 컴포넌트는 리스트 전체가 아닌 '숫자' 하나만 구독합니다.
   */
  const { data: activeCount } = useQuery<User[], Error, number>({
    queryKey: ['users', 'active-count'],
    queryFn: fetchUsers,
    select: (users) => users?.filter((u) => u.isActive).length ?? 0,
  });

  return (
    <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '12px', backgroundColor: '#fff' }}>
      <h2 style={{ color: '#007bff' }}>현재 활성 유저: {activeCount}명</h2>
      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '1rem 0' }} />
      <h4>전체 유저 이름 리스트</h4>
      <ul style={{ lineHeight: '1.8' }}>
        {userNames?.map((name) => (
          <li key={name}><strong>{name}</strong></li>
        ))}
      </ul>
      <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem' }}>
        💡 이메일이나 주소가 바뀌어도 '이름'이 그대로면 리렌더링되지 않습니다.
      </p>
    </div>
  );
};