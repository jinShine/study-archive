import React from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

export const Sidebar = () => {
  // 🚨 고통의 원인: 매번 새로운 객체 { name, role }를 생성하여 반환합니다.
  const { name, role } = useDashboardStore((state) => ({
    name: state.user.name,
    role: state.user.role,
  }));

  console.log('🚨 [렌더링 발생] 유저 정보는 변하지 않았는데 사이드바가 다시 그려졌습니다!');

  return (
    <aside style={{ padding: '20px', border: '2px solid red', width: '250px' }}>
      <h3>Sidebar Area</h3>
      <p>유저명: {name}</p>
      <p>권한: {role}</p>
    </aside>
  );
};