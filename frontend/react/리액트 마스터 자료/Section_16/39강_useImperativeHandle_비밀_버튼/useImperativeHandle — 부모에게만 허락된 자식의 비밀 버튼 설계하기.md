# 39강. useImperativeHandle -- 부모에게만 허락된 자식의 비밀 버튼 설계하기

## 도입

지금까지 우리는 리액트의 '선언적(Declarative)'인 방식, 즉 "상태가 이러하니 화면을 이렇게 그려라"는 규칙을 충실히 따라왔다. 하지만 실무에서는 가끔 부모가 자식에게 "지금 당장 포커스를 줘!" 혹은 "그 애니메이션을 실행해!"라고 직접 명령(Imperative)을 내려야 하는 특수한 상황이 발생한다.

이번에는 리액트의 원칙을 지키면서도 자식 컴포넌트의 자존심(캡슐화)을 훼손하지 않고 부모에게만 특별한 조종기를 건네주는 `useImperativeHandle`과 `forwardRef`의 조합을 마스터해 본다.

## 개념 설명

### forwardRef로 조종기 통로 개설하기

리액트에서 `ref`는 일반적인 props처럼 자식에게 전달되지 않는다. 그래서 자식을 `forwardRef`라는 특수 포장지로 감싸서 "이 자식은 외부 조종기를 받을 준비가 되었다"고 선언해야 한다.

### useImperativeHandle로 비밀 버튼 설계하기

부모에게 자식의 모든 것을 다 보여주는 대신, 허락된 기능(`focus`, `clear`)만 선별적으로 노출한다.

## 코드 예제

### 자식 컴포넌트 (MyInput.jsx)

```jsx
import { useImperativeHandle, forwardRef, useRef } from 'react';

// 1. forwardRef로 감싸 부모의 ref를 두 번째 인자로 받는다.
const MyInput = forwardRef((props, ref) => {
  // 자식 내부에서 실제 DOM을 붙잡을 내부용 ref
  const inputRef = useRef();

  // 2. 부모가 잡고 흔들 수 있는 '비밀 손잡이'를 정의한다.
  useImperativeHandle(ref, () => {
    // 이 객체에 담긴 함수들만 부모가 'ref.current.함수명()'으로 호출 가능하다.
    return {
      focus: () => {
        inputRef.current.focus();
      },
      clear: () => {
        inputRef.current.value = "";
      }
    };
  }, []); // 의존성 배열이 비어있으면 마운트 시점에 한 번 고정된다.

  return <input ref={inputRef} {...props} style={{ padding: '10px', border: '2px solid #3b82f6' }} />;
});

export default MyInput;
```

### 부모 컴포넌트 (App.jsx)

부모는 자식의 `input` 태그가 어떻게 생겼는지 몰라도, 자식이 건네준 `focus`와 `clear` 버튼만 눌러서 제어할 수 있다.

```jsx
import { useRef } from 'react';
import MyInput from './components/MyInput';

export default function App() {
  // 1. 자식의 조종기를 담을 빈 상자(ref)를 만든다.
  const inputControlRef = useRef();

  return (
    <div style={{ padding: '50px' }}>
      <h1>컴포넌트 원격 제어</h1>

      {/* 2. 자식에게 조종기 상자를 건네준다. */}
      <MyInput ref={inputControlRef} placeholder="부모가 제어하는 입력창" />

      <div style={{ marginTop: '20px' }}>
        {/* 3. 자식이 허락한 비밀 버튼(focus, clear)을 사용한다. */}
        <button onClick={() => inputControlRef.current.focus()}>
          강제 포커스 명령
        </button>
        <button onClick={() => inputControlRef.current.clear()} style={{ marginLeft: '10px' }}>
          입력창 비우기 명령
        </button>
      </div>
    </div>
  );
}
```

## 코드 해설

### 캡슐화(Encapsulation)의 미학

왜 단순히 `ref`를 자식의 `input`에 직접 꽂아서 넘기지 않고 `useImperativeHandle`을 쓸까?

- **보안과 안정성**: `input` 태그의 모든 속성(style, value, type 등)을 부모에게 다 노출하면 부모가 자식을 마음대로 주무르다가 예상치 못한 버그를 만들 수 있다.
- **최소 노출 원칙**: 자식은 "나를 제어하려면 딱 이 버튼들만 써!"라고 명확한 가이드라인(API)을 제시하는 것이다. 이것이 바로 컴포넌트 간의 경계를 지키는 캡슐화의 정석이다.
- **명령적 탈출구**: 리액트의 선언적 흐름을 깨는 행위이므로, 지도 API나 스크롤 제어 등 꼭 필요한 상황에서만 사용하는 것이 시니어의 안목이다.

## 실무 비유

`useImperativeHandle`은 자동차의 리모컨 키와 같다. 차주(부모)에게는 문 열기, 시동 걸기 같은 허락된 버튼만 제공하고, 엔진의 내부 배선(자식의 DOM)을 직접 만지지 못하게 막는다. 이를 통해 차량(컴포넌트)의 안정성이 보장된다.

## 핵심 포인트

- `forwardRef`는 `ref`라는 특수 소품을 자식에게 전달하기 위한 통로이다.
- `useImperativeHandle`은 부모에게 노출할 기능을 객체 형태로 선별하여 반환한다.
- 자식 내부의 DOM 노드를 직접 넘기지 않고 함수로 감싸서 넘기는 이유는 캡슐화를 위한 것이다.

## 자가 점검

- [ ] `forwardRef`가 `ref`라는 특수 소품을 전달하기 위한 통로임을 이해했는가?
- [ ] `useImperativeHandle`이 부모에게 노출할 기능을 객체 형태로 선별한다는 점을 파악했는가?
- [ ] 자식 내부의 DOM 노드를 직접 넘기지 않고 함수로 감싸서 넘기는 이유(캡슐화)를 설명할 수 있는가?
- [ ] 자식 컴포넌트에 `alert`를 띄우는 `showGreeting` 함수를 추가하고, 부모 버튼에서 이를 실행해 보았는가?
