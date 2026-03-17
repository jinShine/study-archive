export function UserName({ user }) {
  return (<div style={{ background: '#f0fff0', padding: '10px' }}><h5>UserName (Consumer)</h5><p>Welcome, {user.name}!</p></div>);
}