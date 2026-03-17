import { memo } from 'react';
const HeavyList = memo(({ items }) => (
  <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
));
export default HeavyList;