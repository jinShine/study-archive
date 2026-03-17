import { useId } from 'react';
export default function RegistrationForm() {
  const baseId = useId();
  return (
    <form style={{ padding: '20px', border: '1px solid #ccc' }}>
      <label htmlFor={baseId + '-email'}>이메일</label>
      <input id={baseId + '-email'} type="email" style={{ width: '100%' }} />
    </form>
  );
}