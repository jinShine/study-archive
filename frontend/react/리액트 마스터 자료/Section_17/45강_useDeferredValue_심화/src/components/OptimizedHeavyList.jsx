import { memo } from 'react';
const OptimizedHeavyList = memo(({ query }) => {
  console.log("🐢 [HeavyList] 연산 수행:", query);
  const items = Array.from({ length: 5000 }, (_, i) => <div key={i}>#{i} - {query}</div>);
  return <div style={{ height: '300px', overflowY: 'auto' }}>{items}</div>;
});
export default OptimizedHeavyList;