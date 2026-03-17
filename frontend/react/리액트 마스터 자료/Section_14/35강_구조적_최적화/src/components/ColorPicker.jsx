import { useState } from 'react';
export default function ColorPickerWrapper({ children }) {
  const [color, setColor] = useState("white");
  return (
    <div style={{ backgroundColor: color, padding: '20px' }}>
      <button onClick={() => setColor("#eee")}>배경색 변경</button>
      {children}
    </div>
  );
}