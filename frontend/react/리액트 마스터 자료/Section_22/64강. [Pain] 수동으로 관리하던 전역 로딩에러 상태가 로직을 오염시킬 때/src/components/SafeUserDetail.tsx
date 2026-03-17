import { useState, useEffect } from 'react';
import { api } from '../api/mockApi';
import type { UserData } from '../api/mockApi'; // ✅ Type-only import 적용

export default function SafeUserDetail({ id }: { id: number }) {
  const [data, setData] = useState<UserData | null>(null);

  useEffect(() => {
    // 1. 경합 조건 방어를 위한 '무시 플래그'
    let isCurrentRequest = true;

    const fetchDetail = async () => {
      const result = await api.get<UserData>(`/detail/${id}`);

      // 2. 배달 사고 방지: 오직 클린업 함수가 실행되기 전인 '유효한' 요청일 때만 업데이트
      if (isCurrentRequest) {
        setData(result.data);
      }
    };

    fetchDetail();

    // 3. 클린업 함수: 다음 요청이 시작되거나 컴포넌트가 사라질 때 무효화 선언
    return () => { isCurrentRequest = false; };
  }, [id]);

  return (
    <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px', marginTop: '10px' }}>
      <h4>상세 정보 (Race Condition 방어 중)</h4>
      <p>{data ? data.name : '데이터를 가져오는 중...'}</p>
    </div>
  );
}