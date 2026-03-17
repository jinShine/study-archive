import React from 'react';
import { Sidebar } from './components/Sidebar';
import { useDashboardStore } from './store/useDashboardStore';

export default function App() {
  const count = useDashboardStore((state) => state.count);
  const increment = useDashboardStore((state) => state.increment);

  return (
    <div style={{ padding: '40px' }}>
      <Sidebar />
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h1>카운트: {count}</h1>
        <button onClick={increment} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          단순 카운트 증가
        </button>
        <p style={{ color: '#666' }}>
          버튼을 눌러 카운트만 올렸는데, 왜 왼쪽 사이드바가 다시 그려질까요? (F12 콘솔 확인)
        </p>
      </div>
    </div>
  );
}