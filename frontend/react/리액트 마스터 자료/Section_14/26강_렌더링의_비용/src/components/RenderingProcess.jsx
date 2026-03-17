import { useState } from "react";
import { ChildComponent } from "./ChildComponent";
export default function RenderingProcess() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  console.log("%c 부모 렌더링!", "color: red; font-weight: bold;");
  return (
    <div style={{ padding: '20px', border: '2px solid red' }}>
      <h2>부모</h2>
      <button onClick={() => setCount(count + 1)}>카운트: {count}</button>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ChildComponent />
    </div>
  );
}