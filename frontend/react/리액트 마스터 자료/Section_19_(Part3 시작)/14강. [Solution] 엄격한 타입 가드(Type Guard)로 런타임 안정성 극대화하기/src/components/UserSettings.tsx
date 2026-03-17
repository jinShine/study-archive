import React, { useId, useRef, useState } from 'react';
import { isUserProfile } from '../guards/userGuard';
export function UserSettings() {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("대기 중");
  const handleVerify = () => {
    const val = ref.current?.value || "";
    const raw: unknown = { id: "test-id", nickname: val };
    if (isUserProfile(raw)) {
      setMsg(`✅ 승인: ${raw.nickname}`);
      if (ref.current) ref.current.style.borderColor = "blue";
    } else {
      setMsg("❌ 차단: 2자 이상의 문자열이 필요합니다.");
      if (ref.current) { ref.current.style.borderColor = "red"; ref.current.focus(); }
    }
  };
  return (
    <div style={{padding: '20px', border: '1px solid #ccc'}}>
      <label htmlFor={id}>닉네임: </label>
      <input id={id} ref={ref} placeholder="입력 후 버튼 클릭" />
      <button onClick={handleVerify} style={{marginLeft: '10px'}}>검증</button>
      <p>{msg}</p>
    </div>
  );
}