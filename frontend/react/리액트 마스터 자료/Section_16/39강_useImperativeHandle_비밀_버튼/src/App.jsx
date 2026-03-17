import { useRef } from 'react';
import MyInput from './components/MyInput';
export default function App() {
  const inputControlRef = useRef();
  return (
    <div style={{ padding: '20px' }}>
      <MyInput ref={inputControlRef} />
      <button onClick={() => inputControlRef.current.focus()}>포커스</button>
      <button onClick={() => inputControlRef.current.clear()}>비우기</button>
    </div>
  );
}