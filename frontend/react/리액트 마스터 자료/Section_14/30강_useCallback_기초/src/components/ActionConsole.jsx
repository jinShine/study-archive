import { useState, useCallback } from 'react';
import ExpensiveChild from './ExpensiveChild';

export default function ActionConsole() {
  const [count, setCount] = useState(0);
  const [isDark, setIsDark] = useState(false);

  const handleAction = useCallback(() => {
    console.log("액션 실행!");
  }, []);

  return (
    <div style={{ backgroundColor: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#000', padding: '20px' }}>
      <h2>부모 컴포넌트</h2>
      <button onClick={() => setCount(count + 1)}>카운트: {count}</button>
      <button onClick={() => setIsDark(!isDark)}>배경색 전환</button>
      <ExpensiveChild onAction={handleAction} />
    </div>
  );
}