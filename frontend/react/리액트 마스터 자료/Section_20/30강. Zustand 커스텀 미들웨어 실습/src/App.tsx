import React from 'react';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const { user, login } = useAuthStore();
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>30강. 커스텀 로거 미들웨어</h1>
      <p>상태: <strong>{user || '로그인 안 됨'}</strong></p>
      <button onClick={() => login('리액트 시니어')} style={{ padding: '10px 20px' }}>
        '리액트 시니어'로 로그인
      </button>
      <p style={{ marginTop: '20px', color: '#666' }}>버튼을 누른 뒤 F12 콘솔을 확인하세요!</p>
    </div>
  );
}