import { useState, useCallback } from 'react';
import UserItem from './UserItem';
export default function UserList() {
  const [users, setUsers] = useState([
    { id: 1, name: '홍길동' }, { id: 2, name: '김철수' }, { id: 3, name: '이영희' }
  ]);
  const [count, setCount] = useState(0);
  const handleDelete = useCallback((id) => {
    setUsers((prev) => prev.filter(u => u.id !== id));
  }, []);
  return (
    <div style={{ padding: '20px' }}>
      <h3>클릭 횟수: {count}</h3>
      <button onClick={() => setCount(p => p + 1)}>리렌더링 유발</button>
      <ul>
        {users.map(user => <UserItem key={user.id} user={user} onDelete={handleDelete} />)}
      </ul>
    </div>
  );
}