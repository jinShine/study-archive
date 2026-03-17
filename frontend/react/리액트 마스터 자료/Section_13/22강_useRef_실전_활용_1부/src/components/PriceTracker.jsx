import { useState, useEffect, useRef } from "react";
export default function PriceTracker() {
  const [price, setPrice] = useState(1000);
  const prevPriceRef = useRef();
  useEffect(() => { prevPriceRef.current = price; }, [price]);
  const prevPrice = prevPriceRef.current;
  return (
    <div style={{ padding: '20px', border: '1px solid #ddd' }}>
      <h3>📈 가격 추적기</h3>
      <p>현재가: {price}원 | 직전가: {prevPrice ?? "..."}원</p>
      <button onClick={() => setPrice(p => p + 100)}>UP</button>
      <button onClick={() => setPrice(p => p - 100)}>DOWN</button>
    </div>
  );
}