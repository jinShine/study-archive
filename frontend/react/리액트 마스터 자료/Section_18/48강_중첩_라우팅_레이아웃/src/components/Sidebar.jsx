import { NavLink } from 'react-router';
export default function Sidebar() {
  const linkStyle = ({ isActive }) => ({
    display: 'block', padding: '10px', color: isActive ? 'blue' : 'black', fontWeight: isActive ? 'bold' : 'normal'
  });
  return (
    <nav style={{ width: '200px', borderRight: '1px solid #ccc' }}>
      <NavLink to="/" style={linkStyle}>Inventory</NavLink>
      <NavLink to="/analytics" style={linkStyle}>Analytics</NavLink>
    </nav>
  );
}