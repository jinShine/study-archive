import { useRef } from 'react';
import ValidatedInput from './components/ValidatedInput';
import AnimatedBox from './components/AnimatedBox';
export default function App() {
  const inputRef = useRef();
  const boxRef = useRef();
  const handleSubmit = () => {
    if (!inputRef.current.validate()) {
      inputRef.current.focus();
      boxRef.current.startShake();
    } else { alert("성공!"); }
  };
  return (
    <div style={{ padding: '20px' }}>
      <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }`}</style>
      <ValidatedInput ref={inputRef} placeholder="이름을 입력하세요" />
      <AnimatedBox ref={boxRef} />
      <button onClick={handleSubmit}>가입하기</button>
    </div>
  );
}