import React from 'react';
import { useZustandStore } from './store/useZustandStore';
import { ThemeProvider, useThemeContext } from './store/ThemeContext';

const Dashboard = () => {
  const { count, inc } = useZustandStore();
  const { isDark, toggle } = useThemeContext();
  
  return (
    <div style={{ padding: '30px', border: '2px solid #ddd', borderRadius: '10px' }}>
      <h2>📊 기술 비교 대시보드</h2>
      <div style={{ marginBottom: '20px' }}>
        <strong>Zustand (Selector 방식):</strong> {count} 
        <button onClick={inc} style={{ marginLeft: '10px' }}>증가 (+)</button>
      </div>
      <div>
        <strong>Context (Provider 방식):</strong> {isDark ? '🌙 다크' : '☀️ 라이트'} 
        <button onClick={toggle} style={{ marginLeft: '10px' }}>전환</button>
      </div>
      <p style={{ color: '#888', marginTop: '20px' }}>* F12 렌더링 하이라이트를 켜고 최적화 차이를 확인하세요.</p>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h1>Context vs Zustand 명확한 기준</h1>
        <Dashboard />
      </div>
    </ThemeProvider>
  );
}