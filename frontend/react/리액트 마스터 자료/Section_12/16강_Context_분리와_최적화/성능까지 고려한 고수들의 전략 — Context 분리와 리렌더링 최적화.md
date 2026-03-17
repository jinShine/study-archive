# 16강. Context 분리와 리렌더링 최적화 — 성능까지 고려한 고수들의 전략

## 도입

15강에서 인증 엔진을 구축했다. 하지만 `{ user, isLoading, error, dispatch }`를 하나의 Context에 담아 보내면, `isLoading`만 바뀌어도 `dispatch`만 필요한 컴포넌트까지 리렌더링되는 문제가 발생한다. 이번 강에서는 **State 채널과 Dispatch 채널을 분리**하여 불필요한 리렌더링을 방지하는 고급 최적화 전략을 배운다.

## 개념 설명

단일 Context에 상태와 명령을 함께 담으면, 상태가 변할 때마다 해당 Context를 구독하는 **모든** 컴포넌트가 리렌더링된다. 하지만 로그아웃 버튼처럼 `dispatch`만 필요한 컴포넌트는 상태 변화에 반응할 필요가 없다.

**해결 전략:** Context를 두 개로 분리한다.
- **상태 채널 (AuthStateContext)** — `user`, `isLoading`, `error` 등 읽기 전용 데이터
- **행위 채널 (AuthDispatchContext)** — `dispatch` 함수 (참조가 영원히 고정)

`dispatch` 함수는 `useReducer`가 반환하는 안정적인 참조이므로, 행위 채널의 `value`는 절대 바뀌지 않는다. 따라서 행위 채널만 구독하는 컴포넌트는 **리렌더링에서 완전히 해방**된다.

## 코드 예제

### 채널 분리형 Provider (AuthContext)

```jsx
import { createContext, useReducer, useMemo } from "react";

// 두 개의 독립적인 채널을 개설한다.
export const AuthStateContext = createContext();
export const AuthDispatchContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true };
    case "LOGIN_SUCCESS":
      return { user: action.payload, isLoading: false, error: null };
    case "LOGOUT":
      return { user: null, isLoading: false, error: null };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: false,
    error: null,
  });

  // [최적화 포인트] state의 세부 값이 바뀔 때만 새로운 참조를 만든다.
  const memoizedState = useMemo(() => state, [state]);

  return (
    // Provider를 중첩하여 채널을 나눈다.
    // 상태 채널은 계속 변하지만, 명령 채널(dispatch)은 영원히 고정된다.
    <AuthStateContext.Provider value={memoizedState}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}
```

### 최적화된 데이터 소비 (LogoutButton)

```jsx
import { useContext } from "react";
import { AuthDispatchContext } from "../contexts/AuthContext";

export default function LogoutButton() {
  // 상태(state)는 무시하고 오직 명령(dispatch) 채널만 바라본다.
  const dispatch = useContext(AuthDispatchContext);

  console.log("Log: LogoutButton이 렌더링되었습니다.");

  return (
    <button onClick={() => dispatch({ type: "LOGOUT" })}>
      로그아웃
    </button>
  );
}
```

## 코드 해설

- **`createContext()`를 두 번 호출:** 상태용과 명령용을 아예 다른 문(Door)으로 만드는 것이다.
- **`useMemo`:** 리액트에서 객체는 내용이 같아도 참조 주소가 다르면 "바뀌었다"고 판단한다. `useMemo`는 상태가 정말 변했을 때만 새로운 주소를 부여해 불필요한 알림을 방지한다.
- **`useContext(AuthDispatchContext)`:** 이 버튼은 유저 이름이나 로딩 여부를 알 필요가 없다. 오직 "로그아웃 시켜줘"라고 외치기만 하면 된다. 채널을 분리했기 때문에, `isLoading`이 아무리 바뀌어도 이 버튼은 다시 그려지지 않는다.

## 실무 비유

**단일 Context (기존):** 하나의 라디오 채널에서 뉴스, 음악, 교통정보를 모두 방송한다. 음악만 듣고 싶어도 뉴스가 바뀔 때마다 라디오가 깜빡인다.

**분리된 Context (고수의 방식):** 뉴스 채널(상태)과 DJ 요청 채널(명령)을 분리한다. 음악 요청만 하는 청취자는 뉴스가 아무리 업데이트되어도 신경 쓸 필요가 없다.

## 핵심 포인트

| 비교 항목 | 단일 Context (기존) | Context 분리 (고수의 방식) |
|-----------|-------------------|-------------------------|
| 구조 | `{ user, isLoading, dispatch }` 한 묶음 | State와 Dispatch를 개별 통로로 전송 |
| 영향 범위 | `isLoading`만 바뀌어도 LogoutButton 리렌더링 | `isLoading`이 바뀌어도 LogoutButton은 평온함 |
| 성능 | 컴포넌트가 많아질수록 렌더링 부하 증가 | 필요한 컴포넌트만 정밀하게 렌더링 |
| 유지보수 | 데이터와 기능이 엉켜있음 | 데이터 흐름과 행위 흐름이 분리되어 명확함 |

대규모 프로젝트에서는 이처럼 **읽기 전용 데이터**와 **수정용 함수**를 분리하는 것이 거의 필수적인 패턴이다.

## 자가 점검

- [ ] State Context와 Dispatch Context를 분리하는 이유를 성능 관점에서 설명할 수 있는가?
- [ ] `dispatch` 함수의 참조가 영원히 고정되는 이유를 이해했는가?
- [ ] `useMemo`가 객체 참조 보존에 어떤 역할을 하는지 설명할 수 있는가?
- [ ] 어떤 컴포넌트가 State 채널만 구독해야 하고, 어떤 컴포넌트가 Dispatch 채널만 구독해야 하는지 판단할 수 있는가?
