import React from 'react';
import { DesignButton } from './components/DesignButton';

export default function App() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>11강. 정밀 디자인 토큰 시스템</h1>
      <DesignButton token="primary-500" label="확인" />
      <DesignButton token="accent-300" label="알림" />
    </div>
  );
}