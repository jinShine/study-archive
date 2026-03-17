import React from 'react';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const { isLoggedIn, username, login, logout } = useAuthStore();
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>23강. Persist 자동 저장 테스트</h1>
      {isLoggedIn ? (
        <div>
          <h2>환영합니다, {username}님!</h2>
          <button onClick={logout}>로그아웃</button>
        </div>
      ) : (
        <div>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="이름을 입력하세요"
          />
          <button onClick={() => login(inputValue)}>로그인</button>
        </div>
      )}
      <p style={{ marginTop: '20px', color: 'blue' }}>
        ※ 로그인 후 새로고침(F5)을 눌러보세요. 상태가 유지됩니다!
      </p>
    </div>
  );
}