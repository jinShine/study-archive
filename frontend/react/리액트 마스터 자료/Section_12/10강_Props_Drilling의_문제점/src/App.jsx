import React from 'react';
import { Layout } from './components/Layout';
export default function App() {
  const user = { name: "철수", id: "user-001" };
  return (
    <div style={{ padding: '20px' }}>
      <h1>App (Owner)</h1>
      <Layout user={user} />
    </div>
  );
}