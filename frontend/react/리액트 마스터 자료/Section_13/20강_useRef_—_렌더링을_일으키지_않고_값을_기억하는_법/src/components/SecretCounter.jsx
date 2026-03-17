import { useRef, useState } from "react";

export default function SecretCounter() {
  const [renderCount, setRenderCount] = useState(0);
  const secretRef = useRef(0);
  let localVariable = 0;

  const increaseSecret = () => {
    secretRef.current = secretRef.current + 1;
    localVariable = localVariable + 1;
    console.log("🤫 수첩:", secretRef.current, " | 📦 일반 변수:", localVariable);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>🤫 비밀 수첩 카운터</h2>
      <p>📢 전광판(useState): <b>{renderCount}</b></p>
      <p>🤫 수첩(useRef): <b>{secretRef.current}</b></p>
      <p>📦 일반 변수: <b>{localVariable}</b></p>
      <button onClick={increaseSecret}>비밀 숫자 올리기</button>
      <button onClick={() => setRenderCount(p => p + 1)}>화면 새로고침</button>
    </div>
  );
}