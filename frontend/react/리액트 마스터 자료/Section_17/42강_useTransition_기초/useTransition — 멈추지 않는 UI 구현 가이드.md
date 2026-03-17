# 42강. useTransition -- 멈추지 않는 UI 구현 가이드

## 도입

`useTransition`의 이론을 넘어, 실제로 어떻게 프로젝트에 심고 가동하는지 풀 코드를 통해 확인한다. 수천 개의 가상 데이터를 생성하여 물리적인 부하를 일으킨 뒤, `useTransition`이 어떻게 사용자의 입력을 최우선으로 지켜내는지 그 과정을 살펴본다.

## 개념 설명

`useTransition`은 리액트 18에서 도입된 동시성(Concurrency) 렌더링 훅이다. 상태 업데이트를 '긴급'과 '비긴급'으로 분류하여, 무거운 렌더링 작업 중에도 사용자 입력이 즉각 반응하도록 보장한다.

- `isPending`: 비긴급 작업이 아직 완료되지 않았음을 나타내는 불리언 값
- `startTransition`: 이 함수로 감싼 상태 업데이트는 '비긴급'으로 분류되어 브라우저가 한가할 때 처리된다

## 코드 예제

### 무거운 리스트 컴포넌트 (HeavyList.jsx)

```jsx
import { memo } from 'react';

const HeavyList = memo(({ items }) => {
  console.log(`${items.length}개의 아이템 렌더링 중...`);

  return (
    <ul style={{ marginTop: '20px', listStyle: 'none', padding: 0 }}>
      {items.map((item, index) => (
        <li key={index} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
          {item}
        </li>
      ))}
    </ul>
  );
});

export default HeavyList;
```

### 우선순위 제어 메인 엔진 (App.jsx)

```jsx
import { useState, useTransition } from 'react';
import HeavyList from './components/HeavyList';

const bigData = Array.from({ length: 10000 }, (_, i) => `데이터 아이템 ${i + 1}`);

export default function App() {
  const [filterText, setFilterText] = useState('');
  const [filteredList, setFilteredList] = useState(bigData);

  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // 1. [긴급 업데이트] 입력값은 즉시 반영하여 타이핑이 씹히지 않게 한다.
    setFilterText(value);

    // 2. [비긴급 업데이트] 무거운 필터링 로직은 '나중에 해도 되는 일'로 분류한다.
    startTransition(() => {
      const filtered = bigData.filter(item => item.includes(value));
      setFilteredList(filtered);
    });
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>useTransition 실전 테스트</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={filterText}
          onChange={handleChange}
          placeholder="검색어를 입력하세요 (예: 123)"
          style={{ padding: '12px', fontSize: '18px', width: '300px' }}
        />

        {isPending && (
          <span style={{ marginLeft: '10px', color: '#4f46e5', fontWeight: 'bold' }}>
            데이터 분석 중...
          </span>
        )}
      </div>

      <div style={{
        opacity: isPending ? 0.3 : 1,
        transition: 'opacity 0.2s ease'
      }}>
        <p>검색 결과: {filteredList.length}건</p>
        <HeavyList items={filteredList} />
      </div>
    </div>
  );
}
```

## 코드 해설

이 코드의 정수는 '사용자 반응성'과 '대규모 데이터 처리'의 공존에 있다.

- **반응성 보호**: `setFilterText`가 `startTransition` 밖에 있으므로, 사용자는 10,000개의 데이터를 필터링하는 중에도 글자가 즉시 써지는 것을 확인한다.
- **중단 가능한 렌더링**: 사용자가 '123'을 빠르게 타이핑할 때, 리액트는 '1'에 대한 필터링을 하다가 '2'가 들어오면 즉시 '1'의 계산을 버리고 '12'에 대한 계산으로 넘어간다(Discarding old work).
- **시각적 소통**: `isPending`을 통해 화면이 단순히 멈춘 것이 아니라 "지금 당신의 명령을 처리 중입니다"라는 메시지를 던진다.

## 실무 비유

`useTransition`은 은행 창구의 번호표 시스템과 같다. 급한 업무(입금/출금 = 사용자 입력)는 바로 처리하고, 시간이 걸리는 업무(서류 심사 = 무거운 필터링)는 대기열에 넣어 나중에 처리한다. 대기 중에도 다른 고객은 계속 서비스를 받을 수 있다.

## 핵심 포인트

- `startTransition` 밖의 `setState`는 긴급 업데이트로 즉시 반영된다.
- `startTransition` 안의 `setState`는 비긴급 업데이트로 브라우저가 한가할 때 처리된다.
- `isPending` 상태를 활용하여 로딩 인디케이터나 투명도 조절 등 시각적 피드백을 줄 수 있다.
- 더 급한 입력이 들어오면 진행 중이던 비긴급 렌더링은 중단(interrupt)된다.

## 자가 점검

- [ ] 인풋에 글자를 빠르게 입력할 때, 글자가 밀리지 않고 즉시 나타나는지 확인했는가?
- [ ] 글자를 치는 동안 "데이터 분석 중..." 문구가 나타났다가 사라지는지 확인했는가?
- [ ] `isPending`일 때 리스트의 투명도가 변하며 부드러운 흐름을 보여주는지 확인했는가?
- [ ] `startTransition`을 제거하고 일반 코드로 돌려보았을 때, 글자가 뚝뚝 끊기며 입력되는 블로킹 현상을 직접 체감했는가?
