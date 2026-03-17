/* [File Path]: src/App.tsx
   [Copyright]: © nhcodingstudio 소유 */
import React, { useReducer } from 'react';
import { productReducer } from './store/productReducer';
import { taxCalculator } from './utils/taxCalculator';
import type { ProductState } from './types/product';

const initialState: ProductState = { productId: 101, price: 50000 };

function App() {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const trackingCode = taxCalculator(state);
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>07강. TS 마이그레이션 솔루션</h1>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <p>상품 번호: {state.productId}</p>
        <p>검증된 추적 코드: {trackingCode}</p>
        <button onClick={() => dispatch({ type: 'UPDATE_PRICE', payload: 65000 })}>가격 업데이트</button>
      </div>
    </div>
  );
}
export default App;
