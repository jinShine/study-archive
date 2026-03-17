# 25강. forwardRef — 내가 만든 컴포넌트에 Ref 날개 달아주기

## 도입

지금까지 우리는 HTML 기본 태그(`<input>`, `<video>` 등)에만 Ref를 연결해왔다. 하지만 실무에서는 직접 만든 "커스텀 컴포넌트"를 조종해야 할 일이 훨씬 많다. 일반적으로 함수형 컴포넌트에 `ref`를 전달하면 리액트는 보안상 이를 거부한다. 이 문을 공식적으로 열어주는 도구가 바로 `forwardRef`다.

## 개념 설명

리액트 컴포넌트는 기본적으로 내부를 보여주지 않는 "캡슐화" 상태다. 부모가 자식의 속살(DOM)을 함부로 만지는 것을 막기 위함이다.

`forwardRef`는 자식 컴포넌트가 부모의 Ref 신호를 받을 수 있도록 공식적으로 통로를 열어주는 래퍼 함수다.

**일반 Props vs forwardRef:**

| 구분 | 일반 Props | forwardRef (ref) |
|------|-----------|-----------------|
| 목적 | 부모가 자식에게 데이터를 줄 때 | 부모가 자식의 물리적 요소를 직접 조작할 때 |
| 흐름 | 단방향 (부모 → 자식) | 직접 연결 (부모 ↔ 자식의 실제 DOM) |
| 비유 | 배달 음식을 문 앞에 두고 가기 | 자식이 부모에게 방 열쇠를 복사해주기 |

## 코드 예제

### 실패하는 케이스 (왜 forwardRef가 필요한가)

```jsx
// 리액트가 거부하는 코드 (경고 발생)
const SimpleInput = (props) => {
  return <input {...props} />;
};

// 부모에서 <SimpleInput ref={myRef} />라고 쓰면?
// "함수형 컴포넌트에는 ref를 줄 수 없습니다"라는 에러가 발생한다.
```

### forwardRef로 통로 개방하기 (MyInput)

```jsx
import { forwardRef } from "react";

// 컴포넌트를 forwardRef()로 감싸서 재정의
// 인자가 (props, ref) 두 개로 늘어난다. 'ref'가 부모가 보낸 리모컨이다.
const MyInput = forwardRef((props, ref) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontWeight: 'bold' }}>{props.label}</label>

      {/* 부모에게 받은 리모컨(ref)을 실제 조종하고 싶은 태그에 꽂아준다 */}
      <input
        ref={ref}
        {...props}
        style={{
          padding: '10px',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          width: '200px'
        }}
      />
    </div>
  );
});

export default MyInput;
```

### 부모 컴포넌트에서 원격 제어하기 (App)

```jsx
import { useRef } from "react";
import MyInput from "./components/MyInput";

export default function App() {
  // 자식 내부의 input을 가리킬 리모컨
  const idRef = useRef(null);

  const handleFocus = () => {
    if (idRef.current) {
      idRef.current.focus();
      idRef.current.style.backgroundColor = "#eff6ff";
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h2>forwardRef 실전 아키텍처</h2>
      <hr />

      {/* 커스텀 컴포넌트에 ref를 당당하게 전달 */}
      <MyInput
        ref={idRef}
        label="사용자 ID"
        placeholder="아이디를 입력하세요"
      />

      <button
        onClick={handleFocus}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        자식 컴포넌트 포커스 잡기
      </button>
    </div>
  );
}
```

## 코드 해설

- `forwardRef((props, ref) => ...)`: 일반 컴포넌트와 달리 두 번째 인자로 `ref`를 명시적으로 받는다. 이것이 부모와 자식을 연결하는 "전용 통로"가 된다.
- `ref={ref}`: 부모가 밖에서 버튼을 누르면, 이 통로를 타고 들어온 신호가 실제 `<input>` 요소에 전달된다.
- `idRef.current.focus()`: 부모는 자식이 내어준 통로를 통해 자식 내부의 입력창을 자유롭게 제어한다.
- `{...props}`: ref 외의 일반 props는 기존 방식 그대로 전달된다.

**주의:** `forwardRef`는 강력하지만 남발하지 않아야 한다. 리액트의 기본 원칙은 "상태(State)로 제어하기"다. 포커스나 스크롤처럼 물리적인 동작이 꼭 필요한 경우에만 이 도구를 사용한다.

## 실무 비유

- `forwardRef`는 호텔의 마스터키 제도와 같다. 일반적으로 각 방(컴포넌트)은 투숙객(자기 자신)만 열 수 있지만, 관리자(부모)에게 마스터키(ref)를 빌려주면 관리자도 방 안의 시설을 직접 제어할 수 있다.
- 디자인 시스템에서 범용 Input, Button, Modal 컴포넌트를 만들 때 `forwardRef`를 적용하면, 사용하는 쪽에서 포커스나 스크롤 같은 물리적 조작을 자유롭게 수행할 수 있다.

## 핵심 포인트

1. 함수형 컴포넌트에 `ref`를 직접 전달하면 리액트가 거부한다. `forwardRef`로 감싸야 통로가 열린다.
2. `forwardRef`의 콜백은 `(props, ref)` 두 개의 인자를 받으며, `ref`를 내부의 실제 DOM 태그에 연결한다.
3. 부모는 자식의 Ref를 통해 `focus()`, `scrollIntoView()` 등 물리적 동작을 원격 제어할 수 있다.
4. 디자인 시스템이나 공용 컴포넌트 라이브러리를 만들 때 `forwardRef`는 필수 패턴이다.
5. `forwardRef`는 포커스, 스크롤 등 물리적 동작이 필요한 경우에만 사용하고 남발하지 않는다.

## 자가 점검

- [ ] 함수형 컴포넌트에 `ref`를 직접 전달하면 왜 에러가 나는지 "캡슐화" 관점에서 설명할 수 있는가?
- [ ] `forwardRef`의 사용법(감싸기, 두 번째 인자, 내부 연결)을 순서대로 설명할 수 있는가?
- [ ] 일반 Props와 `forwardRef`를 통한 Ref 전달의 차이점을 비유로 설명할 수 있는가?
- [ ] `MyInput` 컴포넌트를 두 개 배치하고 각각 다른 버튼으로 포커스를 제어하는 코드를 작성할 수 있는가?
