import React from 'react';
import { Content } from './components/Content';
export default function App() {
  const user = { name: "chulsoo", isAdmin: true };
  return (
    <div style={{ padding: '20px' }}>
      <h1>Owner (App)</h1>
      <Content user={user} />
    </div>
  );
}