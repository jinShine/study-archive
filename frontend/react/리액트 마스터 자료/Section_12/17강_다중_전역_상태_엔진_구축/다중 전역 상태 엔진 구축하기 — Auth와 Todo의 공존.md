# 17강. 다중 전역 상태 엔진 구축하기 — Auth와 Todo의 공존

## 도입

지금까지 단일 도메인(인증)의 전역 상태를 다뤘다. 하지만 실무에서는 인증, 업무, 알림, 테마 등 **여러 도메인의 전역 상태가 공존**해야 한다. 이번 강에서는 기존 AuthContext에 더해 새로운 **Todo 엔진**을 추가하고, 두 엔진이 독립적으로 작동하면서도 필요할 때 협력하는 구조를 설계한다.

## 개념 설명

다중 전역 상태 엔진의 핵심 원칙:

1. **독립성** — 각 도메인(Auth, Todo)은 각자의 Reducer, Context, Provider를 갖는다. Todo를 아무리 추가해도 Auth 채널은 조용하다.
2. **계단식 배치(Nesting)** — Provider를 중첩하여 하위 컴포넌트가 여러 엔진에 동시 접근할 수 있게 한다.
3. **의존성 순서** — 인증(Auth)이 업무(Todo)보다 상위에 있어야 한다. 업무 로직에서 유저 정보를 참조해야 하는 경우가 많기 때문이다.
4. **패턴화된 설계** — Auth에서 사용했던 채널 분리(State/Dispatch) 전략을 새로운 엔진에도 동일하게 적용한다.

## 코드 예제

### 업무 관리 엔진의 두뇌 (todoReducer)

```js
export function todoReducer(state, action) {
  switch (action.type) {
    case "ADD_TODO":
      // 새로운 할 일을 기존 목록 끝에 붙여 새로운 배열을 만든다.
      return { ...state, todos: [...state.todos, action.payload] };
    default:
      return state;
  }
}
```

### 업무 관리 엔진의 기지국 (TodoProvider)

```jsx
import { useReducer, useMemo, createContext } from "react";
import { todoReducer } from "./todoReducer";

export const TodoStateContext = createContext();
export const TodoDispatchContext = createContext();

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, { todos: [] });

  // 성능 최적화: 데이터가 변할 때만 리렌더링 알림을 보낸다.
  const memoizedState = useMemo(() => state, [state]);

  return (
    <TodoStateContext.Provider value={memoizedState}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}
```

### 최상단에서 엔진 조립하기 (App)

```jsx
import { AuthProvider } from "./contexts/AuthContext";
import { TodoProvider } from "./contexts/TodoProvider";
import MainLayout from "./components/MainLayout";

export default function App() {
  return (
    // 의존성 순서: 인증(Auth)이 업무(Todo)보다 상위에 있어야 한다.
    // 업무 로직에서 유저 정보를 참조해야 할 경우가 많기 때문이다.
    <AuthProvider>
      <TodoProvider>
        <div style={{ padding: '20px' }}>
          <h1>다중 엔진 시스템 가동</h1>
          <MainLayout />
        </div>
      </TodoProvider>
    </AuthProvider>
  );
}
```

### 여러 엔진의 정보 융합 사용 (TodoInput)

```jsx
import { useContext, useState } from "react";
import { AuthStateContext } from "../contexts/AuthContext";
import { TodoDispatchContext } from "../contexts/TodoProvider";

export default function TodoInput() {
  const [text, setText] = useState("");

  // A. 인증 엔진에서 '로그인한 유저' 정보를 가져온다.
  const { user } = useContext(AuthStateContext);

  // B. 업무 엔진에서 '명령 전달자'를 가져온다.
  const todoDispatch = useContext(TodoDispatchContext);

  const onAdd = () => {
    // 비즈니스 로직: 유저 정보가 없으면 명령을 차단한다.
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    todoDispatch({ type: "ADD_TODO", payload: text });
    setText("");
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', marginTop: '10px' }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="무엇을 해야 하나요?"
      />
      <button onClick={onAdd}>업무 추가</button>
      {!user && <p style={{ color: 'red' }}>먼저 로그인을 해주세요.</p>}
    </div>
  );
}
```

## 코드 해설

- **`todoReducer`:** Auth와 완전히 분리된 독립적인 논리 회로다. 업무가 추가된다고 해서 유저 정보가 바뀔까 봐 걱정할 필요가 없다.
- **`TodoProvider`:** Auth에서 사용했던 채널 분리(State/Dispatch) 전략을 똑같이 적용했다. 이것이 **패턴화된 설계**다.
- **중첩된 Provider:** `MainLayout`은 두 기지국의 전파 범위 안에 동시에 들어온다.
- **의존성 배치:** `AuthProvider`가 바깥에 있으면, 안쪽에 있는 `TodoProvider`나 그 하위 자식들은 언제든지 위쪽의 Auth 정보를 참조할 수 있다. 반대는 불가능하다.
- **다중 `useContext`:** 하나의 컴포넌트가 여러 통로에 빨대를 꽂는 모습이다. 필요한 정보는 Auth에서, 행위는 Todo에서 가져와서 유기적으로 결합했다.

## 실무 비유

다중 엔진 시스템은 **대형 건물의 설비 시스템**과 같다:
- **전기 시스템(Auth)** — 건물 전체에 전력을 공급한다. 모든 시설이 이에 의존한다.
- **수도 시스템(Todo)** — 독립적으로 동작하지만, 전기(인증)가 꺼지면 펌프가 멈춘다.
- **새 시스템 추가(확장성)** — 나중에 알림(Notification) 엔진이 필요하다면? `TodoProvider` 안쪽에 `NotificationProvider`를 하나 더 끼워 넣기만 하면 된다.

## 핵심 포인트

| 특성 | 설명 |
|------|------|
| 독립성 | Todo를 추가해도 AuthStateContext 채널은 조용하다 |
| 협력 | TodoInput은 Auth 엔진 데이터를 읽어서 Todo 엔진 명령을 내릴지 결정한다 |
| 확장성 | 새로운 Provider를 중첩에 끼워넣기만 하면 된다 |
| 의존 방향 | 바깥(Auth) → 안쪽(Todo) 방향으로만 참조 가능 |

## 자가 점검

- [ ] Provider를 중첩(Nesting)하는 이유와 의존성 순서를 설명할 수 있는가?
- [ ] 하나의 컴포넌트에서 여러 Context를 동시에 사용하는 패턴을 이해했는가?
- [ ] Auth 엔진과 Todo 엔진이 독립적으로 작동하면서도 협력하는 구조를 설명할 수 있는가?
- [ ] 새로운 도메인(예: 알림)을 추가할 때 어디에 Provider를 배치해야 하는지 판단할 수 있는가?
