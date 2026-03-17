/* [Copyright]: © nhcodingstudio 소유 */
import React from 'react';
import { useUserStore } from './store/useUserStore';

export default function App() {
  const { user, updateTheme, toggleNotifications } = useUserStore();
  const { theme, notifications } = user.profile.settings;

  return (
    <div style={{
      padding: '50px',
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
      color: theme === 'dark' ? '#ffffff' : '#000000',
      transition: 'all 0.3s'
    }}>
      <h1>24강. Zustand + Immer 중첩 객체 정복 (Proxy 기반)</h1>
      <h3>사용자: {user.profile.name}</h3>
      <p>현재 테마: <strong>{theme}</strong></p>
      <p>알림 여부: <strong>{notifications ? '활성화' : '비활성화'}</strong></p>

      <button onClick={() => updateTheme(theme === 'light' ? 'dark' : 'light')}>테마 전환</button>
      <button onClick={toggleNotifications} style={{ marginLeft: '10px' }}>알림 토글</button>
    </div>
  );
}