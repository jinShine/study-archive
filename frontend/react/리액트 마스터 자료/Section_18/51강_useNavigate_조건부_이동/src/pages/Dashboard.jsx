import { useNavigate } from 'react-router';
export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '50px' }}>
      <h1>Main Dashboard</h1>
      <button onClick={() => navigate(-1)}>뒤로 가기 (navigate -1)</button>
    </div>
  );
}