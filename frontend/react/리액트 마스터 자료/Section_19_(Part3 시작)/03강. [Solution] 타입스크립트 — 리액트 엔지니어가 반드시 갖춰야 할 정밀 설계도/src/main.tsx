/* [File Path]: src/main.tsx
   [Copyright]: © nhcodingstudio
   [Test Process]: 리액트 앱의 시작점입니다. as HTMLElement 문법을 확인하세요. */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
