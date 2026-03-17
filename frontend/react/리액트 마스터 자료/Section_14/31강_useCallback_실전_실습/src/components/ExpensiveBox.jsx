import { memo } from 'react';
const ExpensiveBox = memo(({ createBoxStyle }) => {
  console.log("%c 👶 자식: 렌더링 스킵!", "color: #10b981; font-weight: bold;");
  const style = createBoxStyle();
  return <div style={{ ...style, border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>무거운 박스</div>;
});
export default ExpensiveBox;