import { useState, useTransition } from 'react';
import HeavyList from './components/HeavyList';
const data = Array.from({ length: 5000 }, (_, i) => `Data ${i}`);
export default function App() {
  const [text, setText] = useState('');
  const [list, setList] = useState(data);
  const [isPending, startTransition] = useTransition();
  const handle = (e) => {
    setText(e.target.value);
    startTransition(() => {
      setList(data.filter(i => i.includes(e.target.value)));
    });
  };
  return (
    <div style={{ padding: '20px' }}>
      <input value={text} onChange={handle} />
      {isPending && <p>Loading...</p>}
      <div style={{ opacity: isPending ? 0.5 : 1 }}><HeavyList items={list} /></div>
    </div>
  );
}