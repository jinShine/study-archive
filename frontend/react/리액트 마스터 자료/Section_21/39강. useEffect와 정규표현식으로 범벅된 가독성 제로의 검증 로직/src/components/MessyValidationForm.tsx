import React, { useState, useEffect } from 'react';

export default function MessyValidationForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");

  // 이메일 검증 로직
  useEffect(() => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && !emailRegex.test(email)) {
      setEmailError("유효하지 않은 이메일 주소입니다.");
    } else {
      setEmailError("");
    }
  }, [email]);

  // 비밀번호 검증 로직 (8자 이상)
  useEffect(() => {
    if (password && password.length < 8) {
      setPwError("비밀번호는 최소 8자 이상이어야 합니다.");
    } else {
      setPwError("");
    }
  }, [password]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff5f5' }}>
      <h2>⚠️ 수동 검증 스파게티 폼</h2>
      <div style={{ marginBottom: '15px' }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" />
        {emailError && <p style={{ color: 'red', fontSize: '12px' }}>{emailError}</p>}
      </div>
      <div style={{ marginBottom: '15px' }}>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" />
        {pwError && <p style={{ color: 'red', fontSize: '12px' }}>{pwError}</p>}
      </div>
      <p style={{ fontSize: '11px', color: '#888' }}>* 필드가 늘어날수록 이 useEffect 뭉치들은 감당할 수 없게 됩니다.</p>
    </div>
  );
}