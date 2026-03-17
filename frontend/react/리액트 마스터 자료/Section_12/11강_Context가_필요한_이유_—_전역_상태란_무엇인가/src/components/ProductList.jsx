export function ProductList({ user }) {
  return (
    <div style={{ padding: '10px', border: '2px solid #4f46e5', backgroundColor: '#eef2ff' }}>
      <h4>ProductList (Consumer)</h4>
      <p>User: {user.name}</p>
    </div>
  );
}