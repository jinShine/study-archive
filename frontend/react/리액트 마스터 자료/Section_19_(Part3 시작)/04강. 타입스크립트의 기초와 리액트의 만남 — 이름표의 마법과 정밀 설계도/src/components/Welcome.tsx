/* [File Path]: src/components/Welcome.tsx
   [Copyright]: © nhcodingstudio 소유 */
import React from 'react';

interface WelcomeProps {
  name: string;
  age: number;
  isVIP?: boolean;
}

export function Welcome({ name, age, isVIP }: WelcomeProps) {
  return (
    <div style={{ border: isVIP ? '3px solid gold' : '1px solid #ddd', padding: '1.5rem', borderRadius: '10px' }}>
      <h2>{name}님, {age}살이 되신 것을 축하합니다! {isVIP && '👑'}</h2>
      {isVIP && <p style={{ color: 'gold' }}>VIP 프리미엄 서비스 가동 중</p>}
    </div>
  );
}
