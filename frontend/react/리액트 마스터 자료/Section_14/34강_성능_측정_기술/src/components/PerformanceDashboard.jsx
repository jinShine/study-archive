import { useState } from 'react';
import HeavyComponent from './HeavyComponent';
export default function PerformanceDashboard() {
  const [text, setText] = useState("");
  return (
    <div style={{ padding: '20px' }}>
      <h2>성능 진단 대시보드</h2>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="프로파일러를 켜고 입력하세요" />
      <HeavyComponent />
    </div>
  );
}