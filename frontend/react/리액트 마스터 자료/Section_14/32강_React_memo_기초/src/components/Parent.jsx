import { useState, useCallback } from 'react';
import ChildComponent from './ChildComponent';
export default function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => console.log("Action!"), []);
  return (
    <div style={{ padding: '30px', border: '2px solid #3b82f6', borderRadius: '20px' }}>
      <h2>부모 카운트: {count}</h2>
      <button onClick={() => setCount(prev => prev + 1)}>리렌더링 유발</button>
      <ChildComponent onAction={handleClick} />
    </div>
  );
}