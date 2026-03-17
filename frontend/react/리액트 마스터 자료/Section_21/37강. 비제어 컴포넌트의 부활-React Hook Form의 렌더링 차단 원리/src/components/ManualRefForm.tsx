import React, { useRef } from 'react';

export default function ManualRefForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("수동 수집:", { name: nameRef.current?.value, email: emailRef.current?.value });
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid red', padding: '10px' }}>
      <h3>Manual (useRef)</h3>
      <input ref={nameRef} placeholder="이름" />
      <input ref={emailRef} placeholder="이메일" />
      <button type="submit">제출</button>
    </form>
  );
}