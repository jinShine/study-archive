import { useState } from 'react';
export default function InputBox() {
  const [text, setText] = useState("");
  return (
    <div style={{ padding: '10px', border: '1px solid blue' }}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="상태 격리 중..." />
    </div>
  );
}