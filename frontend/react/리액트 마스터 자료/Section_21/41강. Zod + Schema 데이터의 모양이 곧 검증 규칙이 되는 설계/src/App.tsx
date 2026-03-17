import React from 'react';
import SignupForm from './components/SignupForm';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa' }}>
      <SignupForm />
    </div>
  );
}