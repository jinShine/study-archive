import { useState, useMemo } from 'react';

export default function CalculationConsole() {
  const [number, setNumber] = useState(0);
  const [isDark, setIsDark] = useState(false);

  const result = useMemo(() => {
    console.log("%c ⚙️ 연산 가동!", "color: red; font-weight: bold;");
    for (let i = 0; i < 1000000000; i++) {} 
    return number * 100;
  }, [number]);

  return (
    <div style={{ backgroundColor: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#000', padding: '40px' }}>
      <input type="number" value={number} onChange={(e) => setNumber(Number(e.target.value))} />
      <p>결과: {result}</p>
      <button onClick={() => setIsDark(!isDark)}>테마 변경</button>
    </div>
  );
}