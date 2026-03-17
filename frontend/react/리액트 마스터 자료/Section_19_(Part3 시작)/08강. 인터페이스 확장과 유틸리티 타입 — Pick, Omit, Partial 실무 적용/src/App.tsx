import React from 'react';
import { PrimaryButton } from './components/PrimaryButton';
import { ProductDetail } from './components/ProductDisplay';
import { ProfileEditor } from './components/ProfileEditor';

export default function App() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>08강 실습</h1>
      <PrimaryButton variant="solid" onClick={() => alert('Click!')}>버튼</PrimaryButton>
      <ProductDetail product={{ id: "1", name: "TS 실전", price: 45000 }} />
      <ProfileEditor />
    </div>
  );
}