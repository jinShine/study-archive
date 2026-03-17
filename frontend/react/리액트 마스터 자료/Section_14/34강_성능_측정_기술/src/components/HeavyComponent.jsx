import { memo } from 'react';
// 실습을 위해 memo를 적용한 버전으로 작성합니다. (최적화 전후 비교용)
const HeavyComponent = memo(() => {
  const start = performance.now();
  while (performance.now() - start < 100) {}
  return (
    <div style={{ padding: '20px', border: '2px solid #10b981', marginTop: '20px' }}>
      <h3>최적화된 컴포넌트 (100ms 연산)</h3>
    </div>
  );
});
export default HeavyComponent;