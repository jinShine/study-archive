import React from 'react';
import { useHistoryStore } from './store/useHistoryStore';

export default function App() {
  const { count, past, future, increment, undo, redo } = useHistoryStore();
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>🕒 Zustand Time Travel System</h1>
      <div style={{ padding: '30px', backgroundColor: '#f0f0f0', borderRadius: '15px' }}>
        <h2 style={{ fontSize: '64px', margin: '10px 0' }}>{count}</h2>
        <button onClick={increment} style={{ padding: '10px 20px', fontSize: '16px' }}>증가 (+)</button>
        <button onClick={undo} disabled={past.length === 0} style={{ padding: '10px 20px', marginLeft: '10px' }}>Undo</button>
        <button onClick={redo} disabled={future.length === 0} style={{ padding: '10px 20px', marginLeft: '10px' }}>Redo</button>
      </div>
      <div style={{ display: 'flex', gap: '50px', marginTop: '30px' }}>
        <div style={{ flex: 1 }}>
          <h4>📜 과거 (Past Stack)</h4>
          {past.map((v, i) => <div key={i} style={{ borderBottom: '1px solid #ddd', padding: '5px 0' }}>Snapshot: {v}</div>)}
        </div>
        <div style={{ flex: 1 }}>
          <h4>🔮 미래 (Future Stack)</h4>
          {future.map((v, i) => <div key={i} style={{ borderBottom: '1px solid #ddd', padding: '5px 0' }}>Snapshot: {v}</div>)}
        </div>
      </div>
    </div>
  );
}