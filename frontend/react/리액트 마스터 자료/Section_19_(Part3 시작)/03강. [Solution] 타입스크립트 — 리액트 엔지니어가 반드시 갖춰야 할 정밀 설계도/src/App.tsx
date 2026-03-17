/* [File Path]: src/App.tsx
   [Copyright]: © nhcodingstudio
   [Test Process]: 데이터를 주입하고 컴포넌트를 조립하는 메인 로직입니다. */
import React from 'react';
import { UserProfile } from './components/UserProfile';
import type { User } from './types/user';

function App() {
  const currentUser: User = {
    id: 1004,
    displayName: 'React with TypeScript'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>03강. 정밀 설계도 시스템</h1>
      <p>TypeScript Interface & import type 최적화 실습</p>
      <hr style={{ margin: '2rem 0' }} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <UserProfile user={currentUser} />
      </div>
    </div>
  );
}

export default App;
