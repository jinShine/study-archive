import { memo } from 'react';
const ExpensiveList = memo(({ items, onItemClick }) => {
  console.log("%c 🛡️ 리스트 파수꾼: 주소 검사 완료. 베일아웃!", "color: #10b981; font-weight: bold;");
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} style={{ marginBottom: '5px' }}>
          {item.text} <button onClick={() => onItemClick(item.id)}>삭제</button>
        </li>
      ))}
    </ul>
  );
});
export default ExpensiveList;