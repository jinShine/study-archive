import { useState, useDeferredValue } from 'react';
import OptimizedHeavyList from './components/OptimizedHeavyList';
export default function App() {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);
  const isStale = text !== deferredText;
  return (
    <div style={{ padding: '20px' }}>
      <h1>Deep Optimization</h1>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Type fast!" />
      <div style={{ opacity: isStale ? 0.3 : 1 }}>
        <p>{isStale ? "🔄 Computing..." : "✅ Ready"}</p>
        <OptimizedHeavyList query={deferredText} />
      </div>
    </div>
  );
}