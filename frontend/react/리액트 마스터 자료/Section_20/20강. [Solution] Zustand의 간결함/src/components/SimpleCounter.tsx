/* [Copyright]: © nhcodingstudio 소유 */
import React from 'react';
import { useSimpleStore } from '../store/useSimpleStore';

export function SimpleCounter() {
  const { count, message, increase, updateMessage } = useSimpleStore();
  return (
    <div style={{ padding: '40px', textAlign: 'center', border: '2px solid #646cff', borderRadius: '15px' }}>
      <h1>{message}</h1>
      <div style={{ fontSize: '3rem', margin: '20px' }}>{count}</div>
      <button onClick={increase} style={{ fontSize: '1.2rem', padding: '10px 20px' }}>증가</button>
      <button onClick={() => updateMessage('Zustand는 사랑입니다!')} style={{ fontSize: '1.2rem', padding: '10px 20px', marginLeft: '10px' }}>메시지 변경</button>
    </div>
  );
}