import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '20px', background: '#f1f5f9' }}>
        <Outlet />
      </main>
    </div>
  );
}