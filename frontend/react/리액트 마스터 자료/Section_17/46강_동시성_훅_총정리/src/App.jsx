import { useState, useTransition, useDeferredValue } from 'react';
import { HeavyView } from './components/HeavyView';
export default function App() {
  const [query, setQuery] = useState("");
  const [transQuery, setTransQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const handleTrans = (e) => {
    setQuery(e.target.value);
    startTransition(() => { setTransQuery(e.target.value); });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Concurrency Summary</h2>
      <input value={query} onChange={handleTrans} placeholder="Type here..." />
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1 }}>
          <h4>useTransition</h4>
          {isPending ? <p>Pending...</p> : <p>Ready</p>}
          <HeavyView value={transQuery} />
        </div>
        <div style={{ flex: 1 }}>
          <h4>useDeferredValue</h4>
          {query !== deferredQuery ? <p>Stale...</p> : <p>Ready</p>}
          <HeavyView value={deferredQuery} />
        </div>
      </div>
    </div>
  );
}