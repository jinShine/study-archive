import { memo } from 'react';
const AdminDashboard = memo(() => {
  const items = Array.from({ length: 8000 }, (_, i) => `Report #${i + 1}`);
  return (
    <div>
      <h3>📊 Heavy Admin Dashboard</h3>
      <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
    </div>
  );
});
export default AdminDashboard;