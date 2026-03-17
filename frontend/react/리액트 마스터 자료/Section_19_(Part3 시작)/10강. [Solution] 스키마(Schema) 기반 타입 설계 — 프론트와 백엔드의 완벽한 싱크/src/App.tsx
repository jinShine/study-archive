/* [Copyright]: © nhcodingstudio 소유 */
import React from 'react';
import { ProductPage } from './components/ProductPage';

export default function App() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>10강. 스키마 기반 방어 아키텍처</h1>
      <ProductPage productId={101} />
    </div>
  );
}