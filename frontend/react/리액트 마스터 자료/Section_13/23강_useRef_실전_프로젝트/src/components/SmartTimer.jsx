import { useState, useEffect, useRef } from "react";
export default function SmartTimer() {
  const [count, setCount] = useState(0);
  const inputRef = useRef(null);
  const timerIdRef = useRef(null);
  const isFirstRender = useRef(true);
  const prevCountRef = useRef();
  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    console.log(`현재: ${count}, 이전: ${prevCountRef.current}`);
    prevCountRef.current = count;
  }, [count]);
  const startTimer = () => {
    if (timerIdRef.current) return;
    timerIdRef.current = setInterval(() => setCount(p => p + 1), 1000);
  };
  const stopTimer = () => { clearInterval(timerIdRef.current); timerIdRef.current = null; };
  return (
    <div style={{ padding: '20px', border: '1px solid #ddd' }}>
      <h3>⏱️ 스마트 타이머</h3>
      <input ref={inputRef} placeholder="자동 포커스" />
      <h1>{count}s</h1>
      <button onClick={startTimer}>시작</button>
      <button onClick={stopTimer}>정지</button>
    </div>
  );
}