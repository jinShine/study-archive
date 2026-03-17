import React from 'react';

const ExpensiveChild = React.memo(({ onAction }) => {
  console.log("%c 👶 자식 컴포넌트 리렌더링 감지!", "color: orange; font-weight: bold;");
  return (
    <div style={{ border: '1px dashed orange', padding: '10px', marginTop: '20px' }}>
      <h4>자식 컴포넌트 (최적화됨)</h4>
      <button onClick={onAction}>액션 실행</button>
    </div>
  );
});

export default ExpensiveChild;