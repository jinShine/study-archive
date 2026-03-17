import { memo } from 'react';
export const HeavyView = memo(({ value }) => {
  const items = Array.from({ length: 3000 }, (_, i) => <div key={i}>Row {i}: {value}</div>);
  return <div style={{ height: '200px', overflowY: 'auto', border: '1px solid #ccc' }}>{items}</div>;
});