import { useState, useEffect, useRef } from "react";
export default function SkipFirstRender() {
  const [count, setCount] = useState(0);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    alert("수량이 변경되었습니다!");
  }, [count]);
  return (
    <div style={{ padding: '20px', background: '#f0f0f0' }}>
      <h3>🛒 수량 제어</h3>
      <p>수량: {count}</p>
      <button onClick={() => setCount(p => p + 1)}>추가</button>
    </div>
  );
}