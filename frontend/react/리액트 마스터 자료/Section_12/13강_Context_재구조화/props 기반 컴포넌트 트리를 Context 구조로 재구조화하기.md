# 13강. Props 기반 컴포넌트 트리를 Context 구조로 재구조화하기

## 도입

Props Drilling의 문제점을 알고, Context API의 구성 요소를 이해했다면, 이제 실제로 **기존의 props 기반 구조를 Context 기반으로 리팩토링**해볼 차례다. 이번 강에서는 10강에서 만들었던 `App → Layout → Sidebar → UserPanel → UserName` 구조를 Context API로 완전히 개조한다.

## 개념 설명

Context 재구조화의 핵심은 다음 세 단계다:

1. **통로 정의 (createContext)** — 데이터가 흐를 길을 선언한다.
2. **전용 공급자 구축 (Provider)** — 데이터를 공급하는 전용 부품을 만든다.
3. **중간 전달자의 짐 덜기 (Refactoring)** — 중간 컴포넌트에서 props 전달 로직을 삭제하고, 최종 소비자에서 `useContext`로 직접 수신한다.

실무에서는 Context 정의와 Provider 로직을 별도의 `contexts/` 폴더에 분리하는 것이 표준 패턴이다.

## 코드 예제

### 통로 정의 (UserContext)

```js
import { createContext } from "react";

// 데이터가 흐를 통로(상자)를 만든다.
export const UserContext = createContext();
```

### 전용 공급자 (UserProvider)

```jsx
import { UserContext } from "./UserContext";

// 하위 컴포넌트(children)를 감싸서 데이터를 뿌려주는 전용 부품
export function UserProvider({ children }) {
  const userName = "chulsoo"; // 전역으로 공유할 실제 데이터

  return (
    // value 속성에 담긴 데이터가 기지국 전파처럼 퍼져나간다.
    <UserContext.Provider value={userName}>
      {children}
    </UserContext.Provider>
  );
}
```

### 중간 전달자들의 짐 덜어내기

```jsx
// Before: function Layout({ userName }) { ... }
// After: props를 전혀 받지 않는다!

export function Layout() {
  return <Sidebar />; // 전달 로직 삭제
}

export function Sidebar() {
  return <UserPanel />; // 전달 로직 삭제
}

export function UserPanel() {
  return <UserName />; // 전달 로직 삭제
}
```

### 최종 소비자에서 직접 데이터 수신 (UserName)

```jsx
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

export function UserName() {
  // 중간 단계를 거치지 않고 중앙 기지국(UserContext)에서 바로 수신한다.
  const userName = useContext(UserContext);

  return (
    <div style={{ padding: '10px', background: '#e0f2fe', borderRadius: '8px' }}>
      <strong>최종 목적지:</strong> Welcome, {userName}!
    </div>
  );
}
```

### 최상단에서 시스템 가동 (App)

```jsx
import { UserProvider } from "./contexts/UserProvider";
import { Layout } from "./components/Layout";

export default function App() {
  return (
    // 앱 전체를 Provider로 감싸서 '데이터 샤워' 범위를 설정한다.
    <UserProvider>
      <div style={{ padding: '20px' }}>
        <h1>Context 기반 재구조화 완료</h1>
        <Layout />
      </div>
    </UserProvider>
  );
}
```

## 코드 해설

- **`{ children }` 패턴:** 리액트의 **Composition(합성)** 기법이다. `UserProvider` 태그 사이에 들어오는 모든 컴포넌트를 그대로 렌더링하면서 데이터만 입혀주는 방식이다.
- **`value={userName}`:** 이 값이 바뀌면 이 Context를 사용하는 모든 하위 소비자들이 즉시 반응한다.
- **파라미터 삭제:** 함수 괄호 안의 `{ userName }`이 사라졌다. 중간 컴포넌트들은 '데이터 배달원'에서 은퇴하고 오직 'UI 배치'라는 본연의 임무에만 집중한다. 이것이 **관심사의 분리(Separation of Concerns)**다.
- **`useContext(UserContext)`:** 옥상에 있는 안테나에서 직접 전파를 잡는 행위다. 부모가 누구인지 상관없이 필요한 데이터만 뽑아온다.

만약 이 구조에서 `UserProvider`를 빼먹는다면? `useContext`는 `undefined`를 반환하고 화면에는 아무것도 나오지 않거나 에러가 발생한다. 반드시 데이터가 필요한 컴포넌트의 상위 어딘가에는 Provider가 있어야 한다.

## 실무 비유

| 구분 | Props Drilling (기존) | Context API (개조 후) |
|------|----------------------|---------------------|
| 데이터 전달 | 유선(줄줄이 비엔나) | 무선(브로드캐스팅) |
| 중간 컴포넌트 | 데이터 파이프로 전락 (복잡) | 순수 UI 레이아웃 (깔끔) |
| 유지보수 | 데이터 추가 시 모든 파일 수정 | 데이터 소유자와 사용자만 수정 |
| 재사용성 | 특정 props에 의존하여 낮음 | 독립적인 구조로 매우 높음 |

## 핵심 포인트

- Context 정의(`createContext`)와 Provider 로직은 별도의 `contexts/` 폴더에 분리하는 것이 실무 표준이다.
- 중간 컴포넌트에서 불필요한 props를 제거하면 **관심사의 분리**가 달성된다.
- Provider는 반드시 데이터가 필요한 컴포넌트의 **상위 트리**에 위치해야 한다.
- `value`가 바뀌면 해당 Context를 구독하는 모든 하위 컴포넌트가 자동으로 리렌더링된다.

## 자가 점검

- [ ] Context 정의와 Provider를 별도 파일로 분리하는 이유를 설명할 수 있는가?
- [ ] 리팩토링 후 중간 컴포넌트에서 props가 완전히 사라졌는데도 화면이 정상 동작하는 원리를 이해했는가?
- [ ] Provider를 빼먹었을 때 어떤 일이 벌어지는지 설명할 수 있는가?
- [ ] `value` 값이 변경될 때 어떤 컴포넌트들이 리렌더링되는지 예측할 수 있는가?
