/* [Copyright]: © nhcodingstudio 소유 */
import React, { useRef } from 'react';
import { CustomInput } from './components/CustomInput';

export default function App() {
  const parentRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ padding: '50px' }}>
      <h1>13강 실습: 충돌 체험</h1>
      <CustomInput label="ID-REF 충돌 테스트" externalRef={parentRef} />
    </div>
  );
}