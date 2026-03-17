import { useState, useMemo } from 'react';
import { generateUsers } from '../utils/dataGenerator';
const users = generateUsers();
export default function UserList() {
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const filteredUsers = useMemo(() => {
    console.log("🔍 필터링 연산 가동 (1만 개)");
    return users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);
  return (
    <div style={{ backgroundColor: isDark ? '#333' : '#fff', color: isDark ? '#fff' : '#000', padding: '20px' }}>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="검색..." />
      <button onClick={() => setIsDark(!isDark)}>테마 전환</button>
      <p>결과: {filteredUsers.length}명</p>
    </div>
  );
}