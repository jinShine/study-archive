export function ChildComponent() {
  console.log("%c 자식 렌더링...", "color: orange;");
  return (
    <div style={{ border: '1px dashed orange', padding: '10px', marginTop: '10px' }}>
      <h4>자식 (데이터 변화 없음)</h4>
    </div>
  );
}