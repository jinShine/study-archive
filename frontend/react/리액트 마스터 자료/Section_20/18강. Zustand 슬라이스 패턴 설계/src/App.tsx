/* [Copyright]: © nhcodingstudio 소유 */
import React from 'react';
import { useDepartmentStore } from './store';

export default function App() {
  const { perfumeStock, sellPerfume, shirtStock, sellShirt } = useDepartmentStore();
  return (
    <div style={{ padding: '40px' }}>
      <h1>🏬 백화점 관리 (Slice Pattern)</h1>
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        💄 향수 재고: {perfumeStock} <button onClick={sellPerfume}>판매</button>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '15px', borderRadius: '8px' }}>
        👕 셔츠 재고: {shirtStock} <button onClick={sellShirt}>판매</button>
      </div>
    </div>
  );
}