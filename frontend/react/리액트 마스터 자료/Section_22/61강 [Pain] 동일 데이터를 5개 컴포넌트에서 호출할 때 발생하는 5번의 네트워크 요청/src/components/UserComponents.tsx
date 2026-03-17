import { useState, useEffect } from 'react';
import { fetchUser } from '../api/mockApi';
import type { User } from '../api/mockApi';

// 1. 네비게이션 바
export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { fetchUser().then(setUser); }, []);
  return (
    <nav style={{ borderBottom: '2px solid #333', padding: '10px', background: '#fff' }}>
      <strong>👤 {user ? `${user.name}님 환영합니다` : '로딩 중...'}</strong>
    </nav>
  );
};

// 2. 사이드바
export const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { fetchUser().then(setUser); }, []);
  return (
    <aside style={{ width: '200px', background: '#f0f0f0', padding: '15px', minHeight: '150px' }}>
      <h4>📝 프로필 요약</h4>
      <p>{user?.bio || '로딩 중...'}</p>
    </aside>
  );
};

// 3. 퀵메뉴
export const QuickMenu = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { fetchUser().then(setUser); }, []);
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#ffeb3b', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
      📧 연락처: {user?.email || '...'}
    </div>
  );
};