/* [Copyright]: © nhcodingstudio 소유 */
import React from 'react';
import { ProductPage } from './components/ProductPage';

function App() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>09강. API 명세 변경의 비극</h1>
      <ProductPage productId={101} />
    </div>
  );
}
export default App;