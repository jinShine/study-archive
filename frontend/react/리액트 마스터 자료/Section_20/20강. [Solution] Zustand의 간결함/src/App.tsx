import React from 'react';
import { SimpleCounter } from './components/SimpleCounter';

export default function App() {
  return (
    <div style={{ padding: '50px' }}>
      <h2 style={{ textAlign: 'center' }}>20강. Zustand의 선언적 상태 관리</h2>
      <SimpleCounter />
    </div>
  );
}