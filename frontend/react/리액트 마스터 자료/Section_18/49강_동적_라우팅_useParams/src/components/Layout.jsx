import { Outlet, Link } from 'react-router';
export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <nav style={{ width: '200px', borderRight: '1px solid #ccc', padding: '20px' }}>
        <Link to="/inventory/101">상품 101 상세</Link><br/>
        <Link to="/inventory/202">상품 202 상세</Link>
      </nav>
      <main style={{ flex: 1 }}><Outlet /></main>
    </div>
  );
}