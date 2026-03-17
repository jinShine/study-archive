/* [Copyright]: © nhcodingstudio 소유 */
import React, { useState, useEffect } from 'react';

export function ManualStorage() {
  const [cart, setCart] = useState<string[]>(() => {
    const saved = localStorage.getItem('my-cart');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('my-cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (item: string) => setCart([...cart, item]);

  return (
    <div style={{ padding: '30px', border: '3px dashed #ff4757', textAlign: 'center' }}>
      <h3>수동 저장소 관리 (The Painful Way)</h3>
      <p>Items: {cart.length > 0 ? cart.join(', ') : 'Empty'}</p>
      <button onClick={() => addItem('신규 아이템')}>아이템 추가</button>
      <p style={{color: 'gray'}}>F5를 눌러 데이터가 유지되는지 확인하세요.</p>
    </div>
  );
}