import React from 'react';
import MessyValidationForm from './components/MessyValidationForm';

export default function App() {
  return (
    <div style={{ padding: '50px' }}>
      <h1>React 폼 아키텍처 비극의 현장</h1>
      <MessyValidationForm />
    </div>
  );
}