import { Outlet, Link } from 'react-router';
export default function Layout() {
  return (
    <div>
      <nav style={{ padding: '10px', background: '#333', color: 'white' }}>
        <Link to="/" style={{ color: 'white' }}>🏠 Home (Loader Applied)</Link>
      </nav>
      <Outlet />
    </div>
  );
}