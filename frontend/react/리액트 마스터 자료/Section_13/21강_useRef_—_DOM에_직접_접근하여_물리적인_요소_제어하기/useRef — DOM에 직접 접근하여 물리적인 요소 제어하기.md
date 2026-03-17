# 21강. useRef — DOM에 직접 접근하여 물리적인 요소 제어하기

## 도입

리액트의 선언적 방식(상태 변경)만으로는 해결하기 힘든 작업들이 있다. 포커스 이동, 스크롤 조절, 미디어 재생 같은 동작은 브라우저 DOM API를 직접 호출해야 한다. 이때 `useRef`는 실제 DOM 노드를 가리키는 리모컨 역할을 한다.

지난 20강에서 useRef를 값 보관용 "비밀 수첩"으로 사용하는 법을 배웠다면, 이번 강의에서는 물리적인 DOM 요소를 직접 제어하는 "리모컨"으로 활용하는 방법을 다룬다.

## 개념 설명

`useRef(null)`로 빈 참조 객체를 만든 뒤, JSX의 `ref` 속성에 연결하면 리액트가 해당 요소를 렌더링할 때 실제 DOM 객체를 `ref.current`에 넣어준다. 이후 `ref.current`를 통해 `focus()`, `scrollIntoView()`, `style` 변경 등 브라우저 표준 API를 직접 호출할 수 있다.

**상태(State) vs 참조(Ref) 비교:**

| 구분 | 상태 (State) | 참조 (Ref) |
|------|-------------|-----------|
| 철학 | "무엇"을 그릴지 선언함 | 그려진 "그것"을 직접 조작함 |
| 변경 시 | 컴포넌트가 리렌더링됨 | 컴포넌트가 가만히 있음 |
| 주요 용도 | 화면에 보이는 값 관리 | 포커스, 스크롤, 미디어 재생, 외부 라이브러리 연동 |
| 접근 방식 | 변수 그 자체 사용 | `.current` 속성을 통해 접근 |

## 코드 예제

### 리모컨(Ref) 선언과 연결

```jsx
import { useRef } from "react";

function FocusManager() {
  // 실제 DOM 노드를 담기 위해 초기값을 null로 설정
  const inputRef = useRef(null);

  return (
    <div>
      {/* ref 속성으로 참조 객체와 실제 input 요소를 연결 */}
      <input ref={inputRef} type="text" />
    </div>
  );
}
```

### 물리적 요소 제어하기 (FocusManager)

```jsx
import { useRef } from "react";

export default function FocusManager() {
  const inputRef = useRef(null);

  const handleFocus = () => {
    // 방어적 코드: 실제 요소가 존재하는지 확인
    if (inputRef.current) {
      // 브라우저 표준 API인 focus()를 실행
      inputRef.current.focus();

      // 직접적인 스타일 제어 (남발 금지)
      inputRef.current.style.backgroundColor = "#fff9db";
      inputRef.current.style.border = "2px solid #fab005";
      inputRef.current.placeholder = "입력을 시작하세요!";
    }
  };

  return (
    <div style={{ padding: '30px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fafafa' }}>
      <h3>DOM 접근 및 포커스 제어</h3>
      <div style={{ marginBottom: '15px' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="여기를 클릭하지 말고 버튼을 누르세요"
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '250px' }}
        />
      </div>
      <button
        onClick={handleFocus}
        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        입력창으로 강제 포커스 이동
      </button>
    </div>
  );
}
```

## 코드 해설

- `useRef(null)`: 처음에는 가리킬 대상이 없으므로 `null`로 시작한다. 렌더링이 완료되면 리액트가 실제 DOM 객체를 `current`에 넣어준다.
- `ref={inputRef}`: 이 설정 덕분에 `document.querySelector`를 쓰지 않고도 리액트 방식으로 안전하게 요소를 가리킬 수 있다.
- `inputRef.current.focus()`: 리액트의 상태를 바꾸는 것이 아니라 브라우저에게 "이 요소를 활성화해"라고 직접 명령을 내리는 것이다.
- `inputRef.current.style`: 상태(state)를 통해 스타일을 바꾸는 것보다 빠르고 직접적이지만, 리액트의 선언적 철학을 해칠 수 있으므로 물리적인 인터랙션이 꼭 필요한 경우에만 사용한다.
- `if (inputRef.current)`: 요소가 화면에서 사라졌을 수도 있기 때문에 null 체크는 필수다.

**주의 사항:** `inputRef.current.value = "Hacked"`와 같이 리액트가 관리하는 값을 강제로 바꾸면 `useState`와 싱크가 맞지 않아 예측 불가능한 버그가 생긴다. 값은 State로, 동작(포커스 등)은 Ref로 관리하는 것이 정석이다.

## 실무 비유

- `useRef`로 DOM에 접근하는 것은 TV 리모컨으로 TV를 조작하는 것과 같다. 화면(State)에 무엇을 보여줄지는 방송국(리액트)이 결정하지만, 볼륨 조절이나 채널 전환 같은 물리적 동작은 리모컨(Ref)으로 직접 한다.
- `document.querySelector`가 거리에서 사람을 수소문해 찾는 것이라면, `ref`는 이미 이름표를 달아둔 사람에게 직접 연락하는 것이다. 리액트 생태계 안에서 더 안전하고 예측 가능하다.

## 핵심 포인트

1. `useRef(null)`로 빈 참조를 만들고 JSX의 `ref` 속성에 연결하면, 렌더링 완료 후 실제 DOM 노드가 `.current`에 담긴다.
2. `.current`를 통해 `focus()`, `scrollIntoView()`, `play()` 등 브라우저 표준 API를 직접 호출할 수 있다.
3. Ref로 DOM을 조작할 때는 반드시 null 체크를 먼저 한다.
4. Ref로 스타일이나 값을 직접 변경하는 것은 최소한으로 한다. 리액트가 관리하는 값은 State로, 물리적 동작만 Ref로 처리한다.
5. `document.querySelector` 대신 `ref`를 사용하는 것이 리액트의 생명주기와 안전하게 호환된다.

## 자가 점검

- [ ] `useRef(null)`의 초기값이 `null`인 이유를 설명할 수 있는가?
- [ ] 버튼 클릭으로 입력창에 포커스를 이동시키는 흐름을 단계별로 설명할 수 있는가?
- [ ] Ref로 DOM을 직접 제어할 때 주의해야 할 점 두 가지를 말할 수 있는가?
- [ ] `scrollIntoView({ behavior: 'smooth' })`를 활용해 특정 요소로 스크롤을 이동시킬 수 있는가?
