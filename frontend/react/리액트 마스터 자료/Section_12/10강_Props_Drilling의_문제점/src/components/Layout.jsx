import { Sidebar } from './Sidebar';
export function Layout({ user }) {
  return (<div style={{ border: '1px solid #999', padding: '10px' }}><h2>Layout</h2><Sidebar user={user} /></div>);
}