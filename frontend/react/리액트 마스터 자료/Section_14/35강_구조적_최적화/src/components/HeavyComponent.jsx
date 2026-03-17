export default function HeavyComponent() {
  console.log("%c 🚀 무거운 컴포넌트 렌더링!", "color: red;");
  return <div style={{ padding: '20px', border: '1px solid gray' }}>[무거운 차트 데이터]</div>;
}