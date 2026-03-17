import { Outlet, Link } from 'react-router';
export default function Layout() {
  return (
    <div>
      <nav style={{ padding: '10px', background: '#eee' }}>
        <Link to="/">Home</Link> | <Link to="/analytics">Analytics</Link>
      </nav>
      <div style={{ padding: '20px' }}><Outlet /></div>
    </div>
  );
}