import { UserName } from './UserName';
export function UserPanel({ user }) {
  return (<div style={{ border: '1px solid #ddd', padding: '10px' }}><h4>UserPanel</h4><UserName user={user} /></div>);
}