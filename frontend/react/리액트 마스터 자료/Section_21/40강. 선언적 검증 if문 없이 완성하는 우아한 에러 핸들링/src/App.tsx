import React from 'react';
import CleanValidationForm from './components/CleanValidationForm';

export default function App() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f4f7fa',
      fontFamily: '-apple-system, system-ui, sans-serif'
    }}>
      <CleanValidationForm />
    </div>
  );
}