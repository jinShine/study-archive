# 45강. useDeferredValue 심화 -- 최적화의 완성

## 도입

지난 시간 배운 `useDeferredValue`가 단순히 값을 늦추는 기능을 넘어, 실제 서비스에서 '렌더링 폭주'를 어떻게 완벽하게 방어하는지 확인한다.

이번 실습의 핵심은 `useDeferredValue`와 `React.memo`가 만났을 때 발생하는 자동 베일아웃(Bail-out, 렌더링 건너뛰기) 현상을 이해하는 것이다. 이 조합이 없다면 지연된 값은 그저 '뒷북치는 무거운 연산'에 불과하게 된다.

## 개념 설명

### memo가 필수인 이유

- **memo가 없다면**: `useDeferredValue`로 값을 늦춰도, 부모인 `App`의 `text` 상태가 바뀔 때마다 리액트는 자식인 `HeavyList`를 일단 다시 호출한다. 지연된 값은 같더라도 함수 자체가 다시 실행되므로 성능 이득이 절반으로 깎인다.
- **memo가 있다면**: 리액트는 `deferredText`가 아직 변하지 않았음을 확인하고, `HeavyList` 내부의 10,000개 루프 연산을 단 1ms도 쓰지 않고 통째로 건너뛴다.
- **결과**: 사용자의 CPU는 오직 '인풋 창에 글자 그리기'에만 집중할 수 있게 되어, 극강의 부드러움을 유지한다.

## 코드 예제

### memo로 무장한 지연 리스트 (OptimizedHeavyList.jsx)

```jsx
import { memo } from 'react';

// React.memo는 프롭이 이전과 동일하면 함수 실행 자체를 하지 않는다.
const OptimizedHeavyList = memo(({ query }) => {
  console.log(`[HeavyList] "${query}" 데이터로 무거운 연산 시작...`);

  const items = Array.from({ length: 10000 }, (_, i) => (
    <div key={i} style={{ padding: '5px', borderBottom: '1px solid #f0f0f0' }}>
      검색 결과 아이템 #{i} (키워드: {query})
    </div>
  ));

  return (
    <div style={{ height: '400px', overflowY: 'auto', border: '2px solid #eee', marginTop: '20px' }}>
      {items}
    </div>
  );
});

export default OptimizedHeavyList;
```

### 동시성 최적화 메인 엔진 (App.jsx)

```jsx
import { useState, useDeferredValue } from 'react';
import OptimizedHeavyList from './components/OptimizedHeavyList';

export default function App() {
  const [text, setText] = useState("");

  // 1. 입력을 지연된 값으로 변환한다.
  const deferredText = useDeferredValue(text);

  // 2. 현재 화면이 최신 상태인지 확인하는 지표이다.
  const isStale = text !== deferredText;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header>
        <h1>심화 최적화: DeferredValue + Memo</h1>
        <p>빠르게 타이핑해도 인풋 창은 멈추지 않는다.</p>
      </header>

      <div style={{ position: 'relative', marginTop: '30px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="검색어를 입력해보세요"
          style={{
            width: '100%', padding: '15px', fontSize: '20px',
            borderRadius: '12px', border: '2px solid #4f46e5',
            boxSizing: 'border-box'
          }}
        />

        {isStale && (
          <div style={{ position: 'absolute', right: '15px', top: '15px', color: '#4f46e5' }}>
            계산 중...
          </div>
        )}
      </div>

      <section style={{
        marginTop: '30px',
        opacity: isStale ? 0.3 : 1,
        transition: 'opacity 0.2s ease',
        pointerEvents: isStale ? 'none' : 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>검색 결과 리스트</h3>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {isStale ? "이전 결과 표시 중" : "최신 결과"}
          </span>
        </div>

        {/* 핵심: 지연된 값을 전달한다. */}
        <OptimizedHeavyList query={deferredText} />
      </section>
    </div>
  );
}
```

## 코드 해설

- 사용자가 타이핑하는 동안 `deferredText`는 '옛날 값'을 유지하며, `memo` 덕분에 자식의 리렌더링을 완전히 차단한다.
- 타이핑이 멈추는 순간 `deferredText`가 최신값으로 갱신되고, 그제서야 `OptimizedHeavyList`가 한 번만 리렌더링된다.
- 콘솔에서 "[HeavyList] 연산 시작..." 로그가 타이핑 중에는 찍히지 않고, 타이핑이 멈춘 뒤에만 찍히는 것을 확인할 수 있다.

## 실무 비유

`useDeferredValue + memo` 조합은 비서의 업무 필터링과 같다. 사장(인풋)이 지시를 연달아 내려도, 비서(memo)는 "최종 확정된 지시가 이전과 같으면 다시 수행하지 않겠습니다"라고 판단한다. 사장의 마지막 지시가 확정된 후에만 한 번 수행하여 불필요한 업무를 원천 차단한다.

## 핵심 포인트

- `useDeferredValue`는 값을 지연시키고, `memo`는 지연된 값이 실제로 바뀔 때만 자식을 리렌더링한다.
- 이 두 가지의 조합이 없으면 `useDeferredValue`는 단순히 '늦게 도착하는 무거운 연산'에 불과하다.
- `isStale` 상태를 활용한 투명도 처리로 사용자에게 "일하고 있다"는 신호를 줄 수 있다.

## 자가 점검

- [ ] 인풋 창에 글자를 빠르게 입력해도 글자가 끊기지 않고 즉시 써지는지 확인했는가?
- [ ] 타이핑을 멈추는 순간 비로소 리스트가 갱신되며 콘솔에 로그가 찍히는지 확인했는가?
- [ ] `isStale`을 이용한 투명도 처리가 사용자에게 "일하고 있다"는 신호를 잘 주는지 확인했는가?
- [ ] `OptimizedHeavyList.jsx`에서 `memo`를 제거해 보고, 타이핑 시 콘솔에 로그가 무수히 찍히며 반응성이 떨어지는 것을 확인했는가?
