import { useState, useEffect } from 'react';
import { api } from '../api/mockApi';
import type { UserData } from '../api/mockApi'; // ✅ Type-only import 적용

export default function ManualUserFetcher() {
  // 1. 비즈니스 데이터와 UI 상태를 위해 각각 타입을 지정한 3개의 상태가 필요합니다.
  const [data, setData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // 2. 요청 시작 시 로딩 스피너를 켜고 이전 에러를 초기화합니다.
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await api.get<UserData>('/user');
        setData(result.data);
      } catch (err) {
        // 3. 에러 발생 시 타입을 확인하여 안전하게 상태에 저장합니다.
        setError(err instanceof Error ? err : new Error('Unknown Error'));
      } finally {
        // 4. 통신이 마무리되면 수동으로 로딩 스위치를 내려줍니다. (인적 오류 발생 포인트)
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div style={{color: '#666'}}>⌛ 수동으로 로딩 불을 켜두었습니다... (isLoading: true)</div>;
  if (error) return <div style={{ color: 'red' }}>❌ 에러 발생: {error.message}</div>;
  
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
      <h4>유저 정보</h4>
      <p>이름: {data?.name}</p>
    </div>
  );
}