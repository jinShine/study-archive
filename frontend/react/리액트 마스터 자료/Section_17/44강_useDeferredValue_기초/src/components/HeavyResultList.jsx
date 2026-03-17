import { memo } from 'react';
const HeavyResultList = memo(({ deferredQuery }) => {
  const items = [];
  for (let i = 0; i < 3000; i++) {
    if (`Item ${i}`.includes(deferredQuery)) {
      items.push(<li key={i}>Result: Item {i}</li>);
    }
  }
  return <ul style={{ border: '1px solid gray' }}>{items}</ul>;
});
export default HeavyResultList;