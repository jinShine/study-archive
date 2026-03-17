import React from 'react';
import { BearCounter } from './components/BearCounter';
import { FishCounter } from './components/FishCounter';

export default function App() {
  return (
    <div style={{ padding: '50px' }}>
      <h1>21강. Selector 최적화 테스트</h1>
      <p>콘솔을 열고 버튼을 눌러보세요. 구독하지 않은 조각은 렌더링되지 않습니다.</p>
      <BearCounter />
      <FishCounter />
    </div>
  );
}