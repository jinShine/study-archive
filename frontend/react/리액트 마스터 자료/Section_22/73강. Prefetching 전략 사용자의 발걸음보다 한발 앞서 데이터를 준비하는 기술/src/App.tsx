import { useState } from 'react';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';

export default function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Prefetching Lab 🛰️</h1>
      <hr />
      {selectedId ? (
        <PostDetail id={selectedId} onBack={() => setSelectedId(null)} />
      ) : (
        <PostList onSelect={setSelectedId} />
      )}
    </main>
  );
}