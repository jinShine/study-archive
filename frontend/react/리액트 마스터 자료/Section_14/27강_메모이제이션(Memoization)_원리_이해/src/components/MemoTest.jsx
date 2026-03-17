import { memoFibonacci, pureFibonacci } from "../utils/fibonacci";
export default function MemoTest() {
  const runTest = (type) => {
    const start = performance.now();
    const result = type === 'memo' ? memoFibonacci(35) : pureFibonacci(35);
    const end = performance.now();
    alert(`${type} 방식 결과: ${result} | 소요 시간: ${(end - start).toFixed(4)}ms`);
  };
  return (
    <div style={{ padding: '20px' }}>
      <h2>⏱️ 메모이제이션 성능 테스트</h2>
      <button onClick={() => runTest('pure')}>일반 재귀 (느림)</button>
      <button onClick={() => runTest('memo')} style={{ marginLeft: '10px' }}>메모이제이션 (빠름)</button>
    </div>
  );
}