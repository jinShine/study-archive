import { useRouteError, Link } from 'react-router';
export default function ErrorPage() {
  const error = useRouteError();
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '100px' }}>⚠️</h1>
      <h2 style={{ fontWeight: '900' }}>SYSTEM INTERRUPTED</h2>
      <p>Error Status: {error.status || "Unknown"}</p>
      <Link to="/" style={{ color: 'indigo', fontWeight: 'bold' }}>Back to Dashboard</Link>
    </div>
  );
}