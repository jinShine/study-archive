import { useState, useCallback } from 'react';
import ExpensiveList from './ExpensiveList';
export default function SeniorReview() {
  const [items, setItems] = useState([
    { id: 1, text: "성능 측정 먼저 하기" },
    { id: 2, text: "구조적 최적화 우선하기" }
  ]);
  const [count, setCount] = useState(0);
  const handleDelete = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);
  return (
    <div style={{ padding: '20px' }}>
      <h2>최종 골든 룰 대시보드</h2>
      <button onClick={() => setCount(c => c + 1)}>부모 카운트: {count}</button>
      <ExpensiveList items={items} onItemClick={handleDelete} />
    </div>
  );
}