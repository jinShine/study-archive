# 20강. useRef — 렌더링을 일으키지 않고 값을 기억하는 법

## 도입

리액트에서 상태(State)는 값이 바뀌면 화면을 다시 그린다. 하지만 모든 데이터가 화면에 보여야 하는 것은 아니다. 내부적으로만 유지하면서 렌더링을 유발하지 않는 데이터 저장소가 필요할 때, `useRef`가 등장한다.

`useRef`는 컴포넌트가 살아있는 동안 값을 유지하되, 값이 변해도 리렌더링을 일으키지 않는 "비밀 금고"와 같다.

## 개념 설명

`useRef`는 `{ current: 초기값 }` 형태의 단순한 자바스크립트 객체를 반환한다. 리액트는 이 객체를 별도의 메모리 공간에 보관하며, 리렌더링이 일어나도 새로 만들지 않고 기존 객체를 재사용한다.

**useState vs useRef vs 일반 변수(let) 비교:**

| 구분 | useState | useRef | let 변수 |
|------|----------|--------|----------|
| 값 변경 시 리렌더링 | O | X | X |
| 리렌더링 후 값 유지 | O | O | X (초기화됨) |
| 용도 | 화면에 보이는 값 | 내부 데이터 보관 | 렌더링 내 임시 계산 |

핵심 차이점:
- `useState`: 값이 바뀌면 화면을 다시 그린다 (전광판)
- `useRef`: 값이 바뀌어도 리액트는 모른 척한다 (비밀 수첩)
- `let` 변수: 리렌더링 시 함수가 재실행되므로 매번 초기화된다

## 코드 예제

### useRef 기본 선언과 값 접근

```jsx
import { useRef } from "react";

function ReferenceExample() {
  const myRef = useRef(0);

  const handleUpdate = () => {
    myRef.current = myRef.current + 1;
    console.log("비밀 금고 안의 현재 값:", myRef.current);
  };

  return <button onClick={handleUpdate}>값 올리기</button>;
}
```

### useState vs useRef 실전 비교 (SecretCounter)

```jsx
import { useRef, useState } from "react";

export default function SecretCounter() {
  // [전광판] 값이 바뀌면 리액트가 화면을 다시 그린다
  const [renderCount, setRenderCount] = useState(0);

  // [비밀 수첩] 값이 바뀌어도 리액트는 모른 척한다 (렌더링 유발 X)
  const secretRef = useRef(0);

  // [일반 변수] 리렌더링 시 매번 초기화된다
  let localVariable = 0;

  const increaseSecret = () => {
    secretRef.current = secretRef.current + 1;
    localVariable = localVariable + 1;
    console.log("수첩(Ref):", secretRef.current, " | 일반 변수:", localVariable);
  };

  return (
    <div style={{ padding: '30px', border: '2px solid #6366f1', borderRadius: '20px' }}>
      <h2>비밀 수첩 카운터 실험실</h2>
      <hr />
      <div style={{ marginBottom: '20px' }}>
        <p>전광판(useState): <b>{renderCount}</b></p>
        <p>수첩(useRef): <b>{secretRef.current}</b></p>
        <p>일반 변수(let): <b>{localVariable}</b></p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={increaseSecret} style={{ padding: '10px' }}>
          비밀 숫자 올리기 (수첩에 적기)
        </button>
        <button onClick={() => setRenderCount(prev => prev + 1)} style={{ padding: '10px' }}>
          화면 새로고침 (전광판 업데이트)
        </button>
      </div>
    </div>
  );
}
```

## 코드 해설

- `useRef(0)`: 리액트에게 "0이 들어있는 객체를 만들어달라"고 요청하는 것이다. 이 컴포넌트가 리렌더링되어도 이 객체를 새로 만들지 않고 계속 재사용한다.
- `myRef.current`: useRef가 반환하는 것은 `{ current: 0 }`이라는 단순한 자바스크립트 객체다. 리액트는 이 객체 안의 값이 바뀌는 것을 감지하지 않도록 설계되어 있어 렌더링을 유발하지 않는다.
- `let localVariable = 0`: 컴포넌트가 리렌더링된다는 것은 함수가 처음부터 다시 실행된다는 뜻이다. 따라서 일반 변수는 함수가 실행될 때마다 매번 0으로 새로 태어나기 때문에 값을 유지할 수 없다.
- `secretRef.current`: useRef는 리액트가 별도의 메모리 공간에 금고처럼 따로 보관해 준다. 함수가 다시 실행되어도 이전 값을 끈질기게 기억한다.
- `setRenderCount`: useRef가 바꾼 값을 화면에 강제로 보여주고 싶을 때, 전광판을 건드려 리액트를 깨우는 용도로 사용한다.

## 실무 비유

- **useState**는 전광판이다. 값이 바뀌면 모든 사람이 볼 수 있게 화면이 갱신된다.
- **useRef**는 비밀 수첩이다. 값을 적어두지만 아무도 그것을 알아차리지 못한다. 필요한 순간에만 꺼내본다.
- **let 변수**는 칠판에 분필로 쓴 것과 같다. 매번 교실(함수)이 초기화되면 칠판도 깨끗이 지워진다.

## 핵심 포인트

1. `useRef`는 `{ current: 값 }` 객체를 반환하며, 컴포넌트 생명주기 동안 동일한 객체를 유지한다.
2. `.current` 값을 변경해도 리렌더링이 발생하지 않는다.
3. `useState`는 UI 업데이트용, `useRef`는 내부 데이터 보관용이다.
4. 일반 변수(`let`)는 리렌더링 시 초기화되지만, `useRef`는 값을 유지한다.
5. 화면에 보여줄 필요가 없는 데이터는 `useRef`로 관리하는 것이 성능상 유리하다.

## 자가 점검

- [ ] '비밀 숫자 올리기'를 눌렀을 때 콘솔에는 숫자가 올라가지만 화면은 그대로인 이유를 설명할 수 있는가?
- [ ] '화면 새로고침'을 눌렀을 때 수첩의 값이 한꺼번에 나타나는 원리를 이해했는가?
- [ ] 일반 변수가 리렌더링 후 다시 0으로 초기화되는 이유를 함수 실행 관점에서 설명할 수 있는가?
- [ ] `useState`와 `useRef`의 핵심 차이점을 한 문장으로 요약할 수 있는가?
