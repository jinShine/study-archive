import { useState, useDeferredValue } from 'react';
import HeavyResultList from './components/HeavyResultList';
export default function App() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  return (
    <div style={{ padding: '20px' }}>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Type fast..." />
      <div style={{ opacity: isStale ? 0.4 : 1 }}>
        <p>{isStale ? "Syncing..." : "Ready"}</p>
        <HeavyResultList deferredQuery={deferredQuery} />
      </div>
    </div>
  );
}