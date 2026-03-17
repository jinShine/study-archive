import React from 'react';
import { PainfulCounter } from './components/PainfulCounter';

export default function App() {
  return (
    <div style={{ padding: '50px' }}>
      <h1>19강. useReducer의 보일러플레이트 고통</h1>
      <PainfulCounter />
    </div>
  );
}