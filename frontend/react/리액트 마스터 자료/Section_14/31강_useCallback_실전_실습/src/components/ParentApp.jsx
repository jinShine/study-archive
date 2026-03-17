import { useState, useCallback } from 'react';
import ExpensiveBox from './ExpensiveBox';
export default function ParentApp() {
  const [size, setSize] = useState(100);
  const [isDark, setIsDark] = useState(false);
  const createBoxStyle = useCallback(() => {
    return {
      backgroundColor: 'pink',
      width: `${size}px`,
      height: `${size}px`,
    };
  }, [size]);
  return (
    <div style={{ backgroundColor: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#000', padding: '50px', minHeight: '100vh' }}>
      <h2>🏠 최적화 부모 관제탑</h2>
      <button onClick={() => setIsDark(!isDark)}>배경색 전환</button>
      <input type="number" value={size} onChange={(e) => setSize(Number(e.target.value))} />
      <hr />
      <ExpensiveBox createBoxStyle={createBoxStyle} />
    </div>
  );
}