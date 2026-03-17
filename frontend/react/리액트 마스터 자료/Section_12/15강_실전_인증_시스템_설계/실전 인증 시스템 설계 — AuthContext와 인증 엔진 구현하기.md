# 15강. 실전 인증 시스템 설계 — AuthContext와 인증 엔진 구현하기

## 도입

14강에서 Context + Reducer를 결합한 전역 상태 엔진의 기본 구조를 배웠다. 이번 강에서는 실무에서 가장 많이 사용하는 패턴인 **인증(Authentication) 시스템**을 설계한다. 사용자 정보(`user`), 로딩 여부(`isLoading`), 에러 메시지(`error`)를 하나의 리듀서로 동시에 관리하는 실전 아키텍처를 구축해 본다.

## 개념 설명

인증 시스템은 단순한 카운터와 달리 **여러 상태를 동시에 제어**해야 한다:

- **`user`** — 로그인한 사용자 정보 (없으면 `null`)
- **`isLoading`** — 인증 처리 중 여부 (중복 클릭 방지용)
- **`error`** — 인증 실패 시 에러 메시지

리듀서의 각 케이스가 이 세 가지 상태를 한꺼번에 갱신하며, 인증의 전체 생명주기(`시작 → 성공/실패 → 로그아웃`)를 관리한다.

## 코드 예제

### 인증 전용 엔진 (AuthContext)

```jsx
import { createContext, useReducer } from "react";

// 전역 통로 생성
export const AuthContext = createContext();

// 인증 두뇌(Reducer): 어떤 신호가 오느냐에 따라 3가지 상태를 동시에 조절한다.
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      // 로그인 시작: 기존 데이터 비우고 로딩을 true로 전환
      return { user: null, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      // 성공: 서버에서 받은 데이터(payload)를 유저 정보에 저장
      return { user: action.payload, isLoading: false, error: null };
    case "LOGIN_FAILURE":
      // 실패: 에러 내용을 기록하고 로딩 중단
      return { user: null, isLoading: false, error: action.payload };
    case "LOGOUT":
      // 로그아웃: 모든 정보를 초기화
      return { user: null, isLoading: false, error: null };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  // 엔진 초기 가동 (비로그인 상태로 시작)
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: false,
    error: null,
  });

  return (
    // 하위 모든 컴포넌트가 { user, isLoading, error, dispatch }에 접근 가능
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 로그인 버튼 구현 (LoginButton)

```jsx
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function LoginButton() {
  // 기지국으로부터 명령 전달자(dispatch)와 상태를 가져온다.
  const { isLoading, dispatch, user } = useContext(AuthContext);

  const handleLogin = async () => {
    // A. 로그인 시작 신호 전송
    dispatch({ type: "LOGIN_START" });

    try {
      // B. 실제로는 여기서 fetch나 axios로 서버 통신을 한다 (2초 대기 모의실험)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockUser = { id: 1, name: "정용수", email: "yong@example.com" };

      // C. 성공 신호와 함께 데이터(payload) 전송
      dispatch({ type: "LOGIN_SUCCESS", payload: mockUser });
    } catch (err) {
      // D. 실패 신호 전송
      dispatch({ type: "LOGIN_FAILURE", payload: "아이디나 비밀번호가 틀렸습니다." });
    }
  };

  if (user) return <button onClick={() => dispatch({ type: "LOGOUT" })}>로그아웃</button>;

  return (
    <button onClick={handleLogin} disabled={isLoading} style={{ padding: "10px 20px" }}>
      {isLoading ? "인증 확인 중..." : "간편 로그인하기"}
    </button>
  );
}
```

### 앱에 인증 엔진 주입 (App)

```jsx
import { AuthProvider } from "./contexts/AuthContext";
import LoginButton from "./components/LoginButton";

export default function App() {
  return (
    <AuthProvider>
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Auth System Demo</h1>
        <LoginButton />
      </div>
    </AuthProvider>
  );
}
```

## 코드 해설

- **`case "LOGIN_START"`:** 사용자가 버튼을 누르자마자 "로딩 중"임을 알려야 한다. 그래야 버튼을 중복 클릭하는 것을 막을 수 있기 때문이다.
- **`value={{ ...state, dispatch }}`:** 스프레드 연산자(`...state`)를 사용해 `user`, `isLoading`, `error`를 개별적으로 꺼내기 편하게 풀어서 전달했다.
- **`disabled={isLoading}`:** 로그인이 진행 중일 때 버튼을 비활성화하는 것은 UX 디자인의 기본이다. 전역 상태인 `isLoading` 덕분에 이 로직이 아주 쉬워졌다.
- **`dispatch` 호출 패턴:** 버튼 컴포넌트는 "어떻게 상태를 바꿀지" 모른다. 단지 "로그인 시작됐어!"라고 보고만 할 뿐이다.

### 인증의 데이터 흐름 (Data Journey)

1. **시작:** 사용자가 버튼을 클릭하면 `LOGIN_START` 신호가 발생한다.
2. **전파:** `AuthProvider`의 리듀서가 이를 받고 `isLoading`을 `true`로 바꾼다. 앱 전체에 "지금 작업 중이야!"라는 방송이 나간다.
3. **처리:** 통신이 끝나면 `LOGIN_SUCCESS` 신호와 유저 데이터를 보낸다.
4. **결과:** 리듀서가 유저 정보를 보관하고 `isLoading`을 끈다. 이를 지켜보던 `UserProfile` 같은 컴포넌트가 자동으로 유저 이름을 화면에 띄운다.

## 실무 비유

인증 시스템은 **호텔 체크인 절차**와 같다:
- `LOGIN_START` — 프론트 데스크에서 신분증을 받아 확인을 시작한다. "잠시만 기다려주세요" (로딩 상태).
- `LOGIN_SUCCESS` — 확인이 완료되어 룸카드(유저 정보)를 발급한다. 이제 호텔의 모든 시설을 이용할 수 있다.
- `LOGIN_FAILURE` — 예약 내역이 없다. "다시 확인해주세요" (에러 메시지).
- `LOGOUT` — 체크아웃. 룸카드를 반납하고 모든 권한이 초기화된다.

## 핵심 포인트

| 액션 타입 | user | isLoading | error | 설명 |
|-----------|------|-----------|-------|------|
| `LOGIN_START` | `null` | `true` | `null` | 인증 처리 시작 |
| `LOGIN_SUCCESS` | 유저 데이터 | `false` | `null` | 인증 성공 |
| `LOGIN_FAILURE` | `null` | `false` | 에러 메시지 | 인증 실패 |
| `LOGOUT` | `null` | `false` | `null` | 로그아웃 |

## 자가 점검

- [ ] 인증 리듀서가 3가지 상태(user, isLoading, error)를 동시에 관리하는 이유를 설명할 수 있는가?
- [ ] `LOGIN_START` → `LOGIN_SUCCESS` 순서로 dispatch가 호출되는 흐름을 따라갈 수 있는가?
- [ ] `disabled={isLoading}`이 UX 측면에서 왜 중요한지 설명할 수 있는가?
- [ ] 스프레드 연산자 `...state`를 `value`에 사용하는 이유를 이해했는가?
