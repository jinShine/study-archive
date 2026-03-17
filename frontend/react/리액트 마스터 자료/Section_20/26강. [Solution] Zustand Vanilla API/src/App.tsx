import React from 'react';
import { useAuth, authStore } from './store/authStore';
import http from './api/http';

export default function App() {
  const { isLoggedIn, token } = useAuth();

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>26강. Vanilla API 실습</h1>
      <p>로그인 상태: {isLoggedIn ? '✅' : '❌'}</p>
      <p>현재 토큰: {token || '없음'}</p>

      <button onClick={() => http.get('/posts/1')}>API 호출 테스트</button>
      <button
        onClick={() => authStore.setState({ token: null, isLoggedIn: false })}
        style={{ marginLeft: '10px', color: 'red' }}
      >
        외부에서 로그아웃 (setState)
      </button>
    </div>
  );
}