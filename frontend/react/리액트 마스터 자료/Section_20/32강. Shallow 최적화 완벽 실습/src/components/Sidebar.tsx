import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../store/useAuthStore';

export const Sidebar = () => {
  // useShallow를 사용하여 객체 내부의 1단계 프로퍼티(name, role)만 비교합니다.
  // 껍데기(참조)가 바뀌어도 알맹이가 같으면 리액트에게 '변화 없음'을 알립니다.
  const { name, role } = useAuthStore(
    useShallow((state) => ({
      name: state.user?.name,
      role: state.user?.role,
    }))
  );

  console.log('✅ [Optimization Success] 사이드바 컴포넌트가 렌더링되었습니다.');

  return (
    <aside style={{ 
      padding: '20px', 
      border: '2px solid #4CAF50', 
      borderRadius: '10px',
      backgroundColor: '#f9fff9',
      width: '250px' 
    }}>
      <h3 style={{ marginTop: 0 }}>Sidebar (Shallow)</h3>
      <p>사용자: <strong>{name || 'N/A'}</strong></p>
      <p>권한: <strong>{role || 'N/A'}</strong></p>
      <small style={{ color: '#888' }}>* 데이터가 실제 변할 때만 이 영역이 다시 그려집니다.</small>
    </aside>
  );
};
