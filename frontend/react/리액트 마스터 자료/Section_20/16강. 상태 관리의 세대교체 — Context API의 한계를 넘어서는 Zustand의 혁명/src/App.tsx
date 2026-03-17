/* [Copyright]: © nhcodingstudio 소유 */
import React from 'react';
import { useCounterStore } from './store/useCounterStore';

function CounterControl() {
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  console.log("Button Component Rendered");
  return (
    <div>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

function CounterDisplay() {
  const count = useCounterStore((state) => state.count);

  console.log("Display Component Rendered");
  return <h1>Count: {count}</h1>;
}

export default function App() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <CounterDisplay />
      <CounterControl />
      <p>콘솔을 확인하여 리렌더링 최적화를 체감해보세요.</p>
    </div>
  );
}
