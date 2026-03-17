import React from 'react';
import http from './api/http';

export default function App() {
  const handleRequest = () => http.get('/posts/1');
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>25강. Vanilla JS 단절의 고통</h1>
      <p>버튼을 누르면 인터셉터 내부에서 훅 호출 에러가 발생합니다.</p>
      <button onClick={handleRequest} style={{padding: '10px 20px'}}>API 요청 보내기</button>
      <p style={{color: 'red', marginTop: '20px'}}>콘솔(F12)을 확인하세요!</p>
    </div>
  );
}