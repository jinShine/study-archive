import React from 'react';
import { useZooStore } from '../store/useZooStore';

export function FishCounter() {
  const fish = useZooStore((state) => state.fish);
  const addFish = useZooStore((state) => state.addFish);
  console.log('🐟 물고기 컴포넌트 렌더링');
  return (
    <div style={{ border: '2px solid blue', padding: '20px', marginTop: '10px', borderRadius: '10px' }}>
      <h3>물고기 연못 (Selector 사용)</h3>
      <p>Fish: {fish}</p>
      <button onClick={addFish}>물고기 추가</button>
    </div>
  );
}