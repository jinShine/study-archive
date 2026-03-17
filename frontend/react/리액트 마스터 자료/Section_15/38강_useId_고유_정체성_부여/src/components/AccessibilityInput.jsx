import { useId } from 'react';
export default function AccessibilityInput({ label }) {
  const id = useId();
  return (
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor={id} style={{ display: 'block', fontWeight: 'bold' }}>{label}</label>
      <input id={id} type="text" style={{ width: '100%', padding: '8px' }} />
    </div>
  );
}