import { useRef } from "react";

export default function FocusManager() {
  const inputRef = useRef(null);

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.backgroundColor = "#fff9db";
      inputRef.current.style.border = "2px solid #fab005";
      inputRef.current.placeholder = "입력을 시작하세요!";
    }
  };

  return (
    <div style={{ padding: '30px', border: '1px solid #eee', borderRadius: '15px' }}>
      <h3>⌨️ DOM 접근 및 포커스 제어</h3>
      <input
        ref={inputRef}
        type="text"
        placeholder="버튼을 눌러보세요"
        style={{ padding: '10px', marginRight: '10px' }}
      />
      <button onClick={handleFocus}>포커스 이동</button>
    </div>
  );
}