/* [File Path]: src/App.tsx
   [Copyright]: © nhcodingstudio 소유 */
import React from 'react';
import { Welcome } from './components/Welcome';
import { StatusDisplay } from './components/StatusDisplay';
import { CustomButton } from './components/CustomButton';
import { InputField } from './components/InputField';

function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>04강 실전 실습</h1>
      <Welcome name="React with TypeScript" age={25} isVIP={true} />
      <StatusDisplay status={{ state: 'success', data: '시스템 정상' }} />
      <InputField />
      <CustomButton customColor="primary">가동하기</CustomButton>
    </div>
  );
}
export default App;
