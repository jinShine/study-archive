# 44강. useDeferredValue -- 데이터 흐름의 완급 조절을 통한 최적화

## 도입

리액트 성능 최적화의 정수인 동시성(Concurrency) 렌더링의 두 번째 시간이다. `useTransition`이 상태를 변화시키는 '행위'를 관리했다면, `useDeferredValue`는 이미 발생한 '값'의 흐름을 조절하여 화면이 비명을 지르지 않게 만드는 영리한 도구이다.

아무리 데이터가 쏟아져도 인풋 창의 반응성을 1순위로 지켜내는 '완급 조절의 기술'을 풀 코드를 통해 마스터해 본다.

## 개념 설명

`useDeferredValue`는 전달받은 값의 '오래된 버전'을 유지하다가 브라우저가 한가해지면 최신 값으로 갱신하는 훅이다.

- `query`가 변경되면 인풋은 즉시 반영하지만, `deferredQuery`는 이전 값을 유지한다.
- 브라우저가 입력 처리를 마치고 여유가 생기면 `deferredQuery`가 최신값으로 갱신된다.
- `query !== deferredQuery`를 비교하여 현재 '과거 데이터를 보여주는 중(stale)' 상태인지 판별할 수 있다.

## 코드 예제

### 무거운 결과 리스트 컴포넌트 (HeavyResultList.jsx)

```jsx
import { memo } from 'react';

const HeavyResultList = memo(({ deferredQuery }) => {
  const items = [];
  for (let i = 0; i < 5000; i++) {
    if (`아이템 ${i}`.includes(deferredQuery)) {
      items.push(<li key={i}>검색 결과: 아이템 {i}</li>);
    }
  }

  console.log(`지연된 쿼리 "${deferredQuery}"로 무거운 리스트 렌더링 중...`);

  return (
    <ul style={{ height: '300px', overflowY: 'auto', border: '1px solid #ddd' }}>
      {items.length > 0 ? items : <li>결과가 없습니다.</li>}
    </ul>
  );
});

export default HeavyResultList;
```

### 데이터 완급 조절 엔진 (App.jsx)

```jsx
import { useState, useDeferredValue } from 'react';
import HeavyResultList from './components/HeavyResultList';

export default function App() {
  const [query, setQuery] = useState("");

  // useDeferredValue는 query가 변경될 때 즉시 업데이트되지 않는다.
  // 브라우저가 바쁘면 이전 값을 유지하다가, 한가해지면 최신값을 반영한다.
  const deferredQuery = useDeferredValue(query);

  // 원본 query와 지연된 deferredQuery가 다르면 현재 'stale' 상태이다.
  const isStale = query !== deferredQuery;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>useDeferredValue 실전 테스트</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="빠르게 타이핑해보세요!"
          style={{ padding: '12px', fontSize: '18px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{
        opacity: isStale ? 0.3 : 1,
        transition: 'opacity 0.2s ease-in-out'
      }}>
        <p style={{ fontWeight: 'bold' }}>
          {isStale ? "최신 데이터 반영 중..." : "업데이트 완료"}
        </p>
        <HeavyResultList deferredQuery={deferredQuery} />
      </div>
    </div>
  );
}
```

## 코드 해설

이 로직의 핵심은 '아나운서와 자막'의 원리이다.

- **즉각적 반응 (아나운서)**: `input`의 `value`는 지연되지 않은 `query`를 사용하므로, 사용자가 아무리 빠르게 타자를 쳐도 글자가 밀리는 현상이 전혀 없다.
- **지연된 처리 (자막)**: 정보량이 방대한 리스트는 `deferredQuery`를 사용하여 리액트가 숨을 고를 시간을 벌어준다. 타이핑이 멈추는 찰나에 리스트가 한꺼번에 갱신된다.
- **시각적 신뢰**: `isStale` 상태를 통해 투명도를 조절함으로써, 사용자는 "내 입력은 잘 들어갔고, 결과는 곧 나오겠구나"라는 심리적 안정감을 얻는다.

## 실무 비유

`useDeferredValue`는 실시간 자막 시스템과 같다. 아나운서(인풋)는 멈추지 않고 말을 계속하지만, 화면 하단 자막(리스트)은 약간의 딜레이를 두고 따라간다. 시청자는 아나운서의 말이 자막보다 빠르다는 것을 자연스럽게 이해한다.

## 핵심 포인트

- `useDeferredValue`는 값 자체를 지연시켜 무거운 하위 컴포넌트의 리렌더링 빈도를 줄인다.
- `query !== deferredQuery` 비교로 'stale' 상태를 감지하여 시각적 피드백을 줄 수 있다.
- `memo`와 함께 사용하면 `deferredQuery`가 실제로 바뀔 때만 자식이 리렌더링되어 성능이 극대화된다.

## 자가 점검

- [ ] 인풋 창에 글자를 빠르게 칠 때, 글자가 씹히거나 늦게 나타나는 현상이 없는지 확인했는가?
- [ ] 글자를 입력하는 동안 리스트의 투명도가 흐려지며 "최신 데이터 반영 중..." 문구가 보이는지 확인했는가?
- [ ] 타이핑을 멈추면 잠시 후 리스트가 최신 결과로 한 번에 바뀌는지 확인했는가?
- [ ] `deferredQuery` 대신 원본 `query`를 리스트에 직접 전달해 보았을 때, 인풋 창까지 뚝뚝 끊기는 블로킹 현상을 직접 경험했는가?
