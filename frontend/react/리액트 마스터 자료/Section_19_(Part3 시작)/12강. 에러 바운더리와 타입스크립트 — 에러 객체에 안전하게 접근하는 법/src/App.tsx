import React from 'react';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
const Bomb = () => { throw new Error("🚨 정밀 설계도 오류!"); };
export default function App() {
  return (
    <div style={{ padding: '50px' }}>
      <h1>12강 에러 바운더리 실습</h1>
      <GlobalErrorBoundary fallback={<p>안전하게 복구됨</p>}>
        <Bomb />
      </GlobalErrorBoundary>
      <p style={{ marginTop: '20px', color: 'green' }}>시스템 외부 정상 작동 중</p>
    </div>
  );
}