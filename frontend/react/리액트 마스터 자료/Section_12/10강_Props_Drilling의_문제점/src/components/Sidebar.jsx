import { UserPanel } from './UserPanel';
export function Sidebar({ user }) {
  return (<div style={{ border: '1px solid #bbb', padding: '10px' }}><h3>Sidebar</h3><UserPanel user={user} /></div>);
}