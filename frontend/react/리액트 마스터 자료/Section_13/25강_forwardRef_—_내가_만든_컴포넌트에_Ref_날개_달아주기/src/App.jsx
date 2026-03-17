import { useRef } from "react";
import MyInput from "./components/MyInput";
export default function App() {
  const inputRef = useRef(null);
  const handleFocus = () => { if (inputRef.current) inputRef.current.focus(); };
  return (
    <div style={{ padding: '40px' }}>
      <h2>forwardRef 실습</h2>
      <MyInput ref={inputRef} label="사용자 ID" />
      <button onClick={handleFocus}>자식 입력창 활성화</button>
    </div>
  );
}