# 30강. useCallback 기초 — 함수를 메모리에 박제하여 주소값 지키기

## 도입

자바스크립트의 참조 동일성 특성 때문에, 컴포넌트가 리렌더링되면 함수 안에서 선언된 모든 함수는 새로운 메모리 주소를 갖게 된다. 내용이 완전히 동일해도 주소가 다르면 리액트는 "새로운 함수"로 판단한다. `useCallback`은 함수 자체를 메모리에 고정(박제)하여, 의존성이 변하지 않는 한 동일한 주소를 유지하는 훅이다.

## 개념 설명

**useMemo vs useCallback 비교:**

| 훅 | 캐싱 대상 | 반환값 |
|----|---------|-------|
| `useMemo` | 연산의 **결과값** | 계산된 값 |
| `useCallback` | **함수 자체** | 메모이제이션된 함수 |

**useCallback 기본 문법:**
```jsx
const cachedFn = useCallback(() => { /* 로직 */ }, [의존성]);
```

- 의존성이 변하지 않으면 이전 렌더링에서 만든 함수를 그대로 재사용한다.
- 주로 `React.memo`로 감싼 자식 컴포넌트에 함수를 props로 넘길 때 사용한다.

**왜 필요한가?**
- 부모가 리렌더링 → 함수가 새로 생성 → 자식의 props가 "변경됨"으로 인식 → 자식도 리렌더링
- `useCallback`으로 함수 주소를 고정하면 자식은 "같은 함수네, 다시 그릴 필요 없어"라고 판단한다.

## 코드 예제

### useCallback으로 함수 주소 고정 (ActionConsole)

```jsx
import { useState, useCallback } from 'react';
import ExpensiveChild from './ExpensiveChild';

export default function ActionConsole() {
  const [count, setCount] = useState(0);
  const [isDark, setIsDark] = useState(false);

  // useCallback: 의존성이 없으므로 최초 1회만 함수를 생성하고 주소를 고정
  const handleAction = useCallback(() => {
    console.log("액션 실행!");
  }, []);

  return (
    <div style={{
      backgroundColor: isDark ? '#333' : '#fff',
      color: isDark ? '#fff' : '#000',
      padding: '20px'
    }}>
      <h2>부모 컴포넌트</h2>
      <button onClick={() => setCount(count + 1)}>카운트: {count}</button>
      <button onClick={() => setIsDark(!isDark)}>배경색 전환</button>
      <ExpensiveChild onAction={handleAction} />
    </div>
  );
}
```

### React.memo로 감싼 자식 (ExpensiveChild)

```jsx
import React from 'react';

const ExpensiveChild = React.memo(({ onAction }) => {
  console.log("자식 컴포넌트 리렌더링 감지!");
  return (
    <div style={{ border: '1px dashed orange', padding: '10px', marginTop: '20px' }}>
      <h4>자식 컴포넌트 (최적화됨)</h4>
      <button onClick={onAction}>액션 실행</button>
    </div>
  );
});

export default ExpensiveChild;
```

## 코드 해설

- `useCallback(() => { ... }, [])`: 의존성 배열이 빈 배열이므로, 이 함수는 최초 렌더링 시 한 번만 생성되고 이후로는 동일한 메모리 주소를 유지한다.
- `React.memo(({ onAction }) => ...)`: 자식 컴포넌트를 `React.memo`로 감싸면, props가 변하지 않을 때 리렌더링을 건너뛴다. `useCallback`과 함께 사용해야 함수 props의 주소가 유지되어 효과를 발휘한다.
- `useCallback` 단독으로는 의미가 없다. 반드시 `React.memo`로 감싼 자식에게 함수를 전달할 때 짝으로 사용해야 최적화 효과가 있다.

## 실무 비유

- `useCallback`은 명함과 같다. 매번 새 명함을 인쇄하는 대신, 한 번 만든 명함을 계속 건네주는 것이다. 받는 사람(React.memo 자식)은 "같은 명함이니 다시 확인할 필요 없어"라고 판단한다.
- `useCallback` 없이 함수를 전달하면, 내용이 같아도 매번 새 명함을 인쇄하는 것과 같다. 받는 사람은 매번 "새 명함이네? 다시 확인해야지"라고 반응한다.

## 핵심 포인트

1. `useCallback`은 "함수 자체"를 캐싱하여 동일한 메모리 주소를 유지한다.
2. `useMemo`는 값을 캐싱하고, `useCallback`은 함수를 캐싱한다.
3. `useCallback`은 반드시 `React.memo`와 함께 사용해야 최적화 효과가 있다. 단독으로는 의미가 없다.
4. 의존성 배열에 함수가 참조하는 외부 값을 정확히 넣어야 한다.
5. 모든 함수에 `useCallback`을 감싸는 것이 아니라, `React.memo` 자식에게 전달하는 함수에만 적용한다.

## 자가 점검

- [ ] `useMemo`와 `useCallback`의 차이점을 "캐싱 대상" 관점에서 설명할 수 있는가?
- [ ] `useCallback` 없이 함수를 자식에 전달하면 왜 `React.memo`가 무력화되는지 참조 동일성으로 설명할 수 있는가?
- [ ] `useCallback`을 `React.memo` 없이 단독으로 사용하면 왜 의미가 없는지 설명할 수 있는가?
- [ ] 의존성 배열에 `count`를 넣으면 함수가 어떻게 변하는지 설명할 수 있는가?
