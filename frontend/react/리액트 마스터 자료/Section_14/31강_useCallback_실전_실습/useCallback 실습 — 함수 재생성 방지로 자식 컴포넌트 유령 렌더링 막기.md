# 31강. useCallback 실전 — 함수 재생성 방지로 자식 컴포넌트 유령 렌더링 막기

## 도입

이번 강의에서는 `useCallback`을 실전 시나리오에 적용한다. 부모 컴포넌트의 배경색 전환(isDark)이라는 무관한 상태 변경이 일어날 때, 자식 컴포넌트의 무거운 렌더링이 불필요하게 발동되는 "유령 렌더링"을 `useCallback` + `React.memo` 조합으로 차단한다.

## 개념 설명

**유령 렌더링이란?**
- 자식 컴포넌트의 props에 실질적인 변화가 없는데도 리렌더링이 발생하는 현상
- 원인: 부모가 리렌더링되면서 함수를 새로 생성 → 함수 주소가 변경 → `React.memo`가 "props가 변했다"고 오인

**해결 전략:**
1. 자식 컴포넌트를 `React.memo`로 감싼다 (props 비교 기능 활성화)
2. 부모에서 전달하는 함수를 `useCallback`으로 감싼다 (함수 주소 고정)
3. 의존성 배열에 함수가 실제로 사용하는 값만 넣는다

## 코드 예제

### 부모 컴포넌트 (ParentApp)

```jsx
import { useState, useCallback } from 'react';
import ExpensiveBox from './ExpensiveBox';

export default function ParentApp() {
  const [size, setSize] = useState(100);
  const [isDark, setIsDark] = useState(false);

  // useCallback: size가 변할 때만 함수를 재생성
  // isDark가 변해도 이 함수의 주소는 유지된다
  const createBoxStyle = useCallback(() => {
    return {
      backgroundColor: 'pink',
      width: `${size}px`,
      height: `${size}px`,
    };
  }, [size]); // size를 사용하므로 의존성에 포함

  return (
    <div style={{
      backgroundColor: isDark ? '#333' : '#fff',
      color: isDark ? '#fff' : '#000',
      padding: '50px',
      minHeight: '100vh'
    }}>
      <h2>최적화 부모 관제탑</h2>
      <button onClick={() => setIsDark(!isDark)}>배경색 전환</button>
      <input type="number" value={size} onChange={(e) => setSize(Number(e.target.value))} />
      <hr />
      <ExpensiveBox createBoxStyle={createBoxStyle} />
    </div>
  );
}
```

### React.memo로 보호된 자식 (ExpensiveBox)

```jsx
import { memo } from 'react';

const ExpensiveBox = memo(({ createBoxStyle }) => {
  console.log("자식: 렌더링!");
  const style = createBoxStyle();
  return (
    <div style={{
      ...style,
      border: '2px solid black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      무거운 박스
    </div>
  );
});

export default ExpensiveBox;
```

## 코드 해설

- `useCallback(() => { ... }, [size])`: `size`가 변할 때만 함수를 재생성한다. `isDark`가 변해서 부모가 리렌더링되어도 이 함수의 메모리 주소는 동일하게 유지된다.
- `memo(({ createBoxStyle }) => ...)`: `React.memo`가 이전 props와 현재 props를 얕은 비교한다. `createBoxStyle`의 주소가 동일하면 "변화 없음"으로 판단하고 렌더링을 건너뛴다.
- `[size]` 의존성: 함수 내부에서 `size` 변수를 사용하므로 반드시 의존성에 포함해야 한다. 빠뜨리면 항상 초기 `size` 값만 사용하는 클로저 버그가 발생한다.

## 실무 비유

- 배경색 전환은 건물 외벽 색을 바꾸는 것이다. 외벽 색이 바뀌었다고 내부 사무실(자식 컴포넌트)의 가구를 모두 교체할 필요는 없다.
- `useCallback`은 사무실 열쇠를 동일하게 유지하는 것과 같다. 열쇠(함수 주소)가 같으면 경비원(React.memo)은 "변경 사항 없음"으로 판단하고 사무실 문을 열지 않는다.

## 핵심 포인트

1. `useCallback`의 의존성 배열에는 함수 내부에서 사용하는 외부 변수를 반드시 포함한다.
2. 의존성을 빠뜨리면 클로저 버그(오래된 값 참조)가 발생한다.
3. `useCallback` + `React.memo`는 항상 쌍으로 사용해야 효과가 있다.
4. 함수를 props로 전달하지 않는 경우에는 `useCallback`이 필요 없다.
5. 콘솔 로그로 자식의 렌더링 여부를 확인하여 최적화가 작동하는지 검증한다.

## 자가 점검

- [ ] 배경색 전환 시 자식 컴포넌트가 리렌더링되지 않는 이유를 함수 주소 관점에서 설명할 수 있는가?
- [ ] `[size]`를 의존성에서 빼면 어떤 버그가 발생하는지 설명할 수 있는가?
- [ ] `useCallback` 없이 `React.memo`만 쓰면 왜 최적화가 실패하는지 설명할 수 있는가?
- [ ] 실무에서 `useCallback`을 적용해야 할 상황과 적용하지 말아야 할 상황을 구분할 수 있는가?
