import { memo } from 'react';
const UserItem = memo(({ user, onDelete }) => {
  console.log(`%c 🛡️ ${user.name} 아이템 최적화 적용 중`, "color: #10b981; font-weight: bold;");
  return (
    <li style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
      {user.name} <button onClick={() => onDelete(user.id)}>삭제</button>
    </li>
  );
});
export default UserItem;