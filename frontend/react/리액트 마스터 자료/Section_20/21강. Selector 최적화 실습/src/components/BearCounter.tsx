import React from 'react';
import { useZooStore } from '../store/useZooStore';

export function BearCounter() {
  const bears = useZooStore((state) => state.bears);
  const addBear = useZooStore((state) => state.addBear);
  console.log('🐻 곰 컴포넌트 렌더링');
  return (
    <div style={{ border: '2px solid brown', padding: '20px', borderRadius: '10px' }}>
      <h3>곰 우리 (Selector 사용)</h3>
      <p>Bears: {bears}</p>
      <button onClick={addBear}>곰 추가</button>
    </div>
  );
}