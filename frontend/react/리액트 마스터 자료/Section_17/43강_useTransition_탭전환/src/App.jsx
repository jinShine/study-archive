import { useState, useTransition } from 'react';
import HomeTab from './components/HomeTab';
import PostsTab from './components/PostsTab';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const handleTabSelect = (next) => {
    startTransition(() => { setTab(next); });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tab Transition optimization</h1>
      <button onClick={() => handleTabSelect('home')}>Home</button>
      <button onClick={() => handleTabSelect('posts')}>Posts</button>
      <button onClick={() => handleTabSelect('admin')}>Admin (Heavy)</button>
      <hr />
      {isPending && <p style={{color: 'blue'}}>Working in background...</p>}
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        {tab === 'home' && <HomeTab />}
        {tab === 'posts' && <PostsTab />}
        {tab === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
}