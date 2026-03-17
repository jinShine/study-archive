import React from 'react';
import AsyncResetForm from './components/AsyncResetForm';
import './index.css';
export default function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-100 flex items-center justify-center p-6">
      <AsyncResetForm />
    </div>
  );
}