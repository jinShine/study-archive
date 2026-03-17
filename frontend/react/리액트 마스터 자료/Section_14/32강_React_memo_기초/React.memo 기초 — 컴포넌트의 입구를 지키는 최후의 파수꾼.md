# 32강. React.memo 기초 — 컴포넌트의 입구를 지키는 최후의 파수꾼

## 도입

`React.memo`는 컴포넌트를 감싸는 고차 컴포넌트(HOC)로, props가 변하지 않으면 리렌더링을 건너뛰는 "파수꾼" 역할을 한다. 부모가 리렌더링되어도 자식의 props가 동일하면 이전 렌더링 결과를 재사용하는 "베일아웃(Bailout)"을 수행한다.

## 개념 설명

**React.memo의 동작 원리:**
1. 부모가 리렌더링되어 자식의 렌더링이 시도된다
2. `React.memo`가 이전 props와 현재 props를 얕은 비교(Shallow Comparison)한다
3. 동일하면 이전 렌더링 결과를 재사용 (베일아웃)
4. 다르면 새로 렌더링

**얕은 비교(Shallow Comparison):**
- 원시 타입: 값이 같으면 동일
- 객체/배열/함수: 메모리 주소(참조)가 같으면 동일
- 이것이 `useMemo`(객체/배열 주소 고정)와 `useCallback`(함수 주소 고정)이 필요한 이유다

## 코드 예제

### 부모 컴포넌트 (Parent)

```jsx
import { useState, useCallback } from 'react';
import ChildComponent from './ChildComponent';

export default function Parent() {
  const [count, setCount] = useState(0);

  // useCallback으로 함수 주소 고정
  const handleClick = useCallback(() => console.log("Action!"), []);

  return (
    <div style={{ padding: '30px', border: '2px solid #3b82f6', borderRadius: '20px' }}>
      <h2>부모 카운트: {count}</h2>
      <button onClick={() => setCount(prev => prev + 1)}>리렌더링 유발</button>
      <ChildComponent onAction={handleClick} />
    </div>
  );
}
```

### React.memo로 최적화된 자식 (ChildComponent)

```jsx
import { memo } from 'react';

const ChildComponent = memo(({ onAction }) => {
  console.log("파수꾼: 베일아웃(Bailout) 수행!");
  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #10b981' }}>
      <h4>최적화된 자식</h4>
      <button onClick={onAction}>동작</button>
    </div>
  );
});

export default ChildComponent;
```

## 코드 해설

- `memo(({ onAction }) => ...)`: `React.memo`로 감싸면 컴포넌트 입구에 파수꾼이 서서 "이전과 props가 같은가?"를 검사한다. 같으면 함수 자체를 실행하지 않고 이전 결과를 반환한다.
- `useCallback(() => ..., [])`: 부모의 `handleClick` 함수가 항상 같은 주소를 유지하므로, 자식의 파수꾼은 "같은 props"로 판단하고 베일아웃한다.
- 부모의 `count`가 변해 리렌더링되어도 자식의 콘솔 로그는 찍히지 않는다 (최적화 성공).

**주의: React.memo가 무력화되는 경우**
- 함수를 `useCallback` 없이 전달하면 매번 새 주소 → 파수꾼이 "다른 props"로 판단
- 객체/배열을 인라인으로 전달하면 (`style={{ color: 'red' }}`) 매번 새 주소
- `children`을 전달하면 JSX 자체가 새 객체이므로 항상 "다른 props"로 판단

## 실무 비유

- `React.memo`는 건물 입구의 경비원이다. 방문자(props)의 신분증(메모리 주소)을 확인하고, 이전에 온 적 있는 동일한 방문자라면 다시 검문하지 않고 통과시킨다.
- `useCallback`과 `useMemo`는 방문자에게 항상 동일한 신분증을 주는 장치다. 이 장치 없이는 경비원이 매번 "새로운 방문자"로 인식한다.

## 핵심 포인트

1. `React.memo`는 props가 변하지 않으면 리렌더링을 건너뛰는 베일아웃을 수행한다.
2. 얕은 비교(Shallow Comparison)를 사용하므로, 객체/배열/함수는 참조(주소)가 동일해야 "같다"고 판단한다.
3. `React.memo` + `useCallback` + `useMemo`는 삼위일체로 작동하는 최적화 도구다.
4. 모든 컴포넌트에 `React.memo`를 쓰는 것이 아니라, 리렌더링 비용이 큰 컴포넌트에만 적용한다.
5. `children` props, 인라인 객체/함수는 `React.memo`를 무력화하므로 주의한다.

## 자가 점검

- [ ] `React.memo`의 "얕은 비교"가 무엇인지, 원시 타입과 참조 타입에서 어떻게 작동하는지 설명할 수 있는가?
- [ ] `React.memo`가 무력화되는 세 가지 경우를 나열할 수 있는가?
- [ ] `React.memo`, `useMemo`, `useCallback` 세 가지의 역할 차이를 한 문장씩 설명할 수 있는가?
- [ ] 베일아웃(Bailout)이란 무엇인지 설명할 수 있는가?
