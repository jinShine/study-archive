# 14강. 전역 상태 엔진의 사고방식 — Context는 통로, reducer는 두뇌

## 도입

지금까지 Context API로 데이터를 전달하는 방법을 배웠다. 하지만 단순히 데이터를 전달하는 것만으로는 부족하다. 실무에서는 데이터를 **어떻게 변경할지에 대한 논리**도 체계적으로 관리해야 한다. 이번 강에서는 **Context(통로)와 Reducer(두뇌)를 결합**해 앱 전체의 상태를 제어하는 강력한 엔진을 만들어 본다.

## 개념 설명

전역 상태 엔진은 세 가지 핵심 부품으로 구성된다:

1. **Context (통로)** — 데이터가 흐를 파이프라인을 정의한다.
2. **Reducer (두뇌)** — 어떤 요청(action)이 들어왔을 때 상태를 어떻게 바꿀지 결정하는 운영 매뉴얼이다.
3. **Provider (엔진)** — Context와 Reducer를 하나로 결합해 앱 전체에 데이터 전파를 쏘아 올리는 기지국이다.

이 패턴의 핵심은 **상태 변경 로직을 컴포넌트 밖으로 분리**하는 것이다. 컴포넌트는 "무엇을 해달라"는 요청(dispatch)만 보내고, 실제 계산은 reducer에서 처리한다.

## 코드 예제

### 통로 정의 (CounterContext)

```js
import { createContext } from "react";

// 데이터를 주고받을 빈 통로를 생성한다.
export const CounterContext = createContext();
```

### 두뇌 설계 (counterReducer)

```js
// 현재 상태(state)와 요청서(action)를 받아 새로운 상태를 계산하는 두뇌
export function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    default:
      // 정의되지 않은 요청은 현재 상태를 그대로 유지한다.
      return state;
  }
}
```

### 전역 엔진 구축 (CounterProvider)

```jsx
import { useReducer } from "react";
import { CounterContext } from "./CounterContext";
import { counterReducer } from "./counterReducer";

export function CounterProvider({ children }) {
  // useReducer를 사용하여 '두뇌(Reducer)'와 '초기값(0)'을 연결한다.
  const [state, dispatch] = useReducer(counterReducer, 0);

  return (
    // value에 현재 값(state)과 명령 전달자(dispatch)를 함께 담는다.
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  );
}
```

### 전역 상태 소비하기 (CounterScreen)

```jsx
import { useContext } from "react";
import { CounterContext } from "../contexts/CounterContext";

export default function CounterScreen() {
  // useContext를 통해 기지국에서 직접 전파를 수신한다.
  const { state, dispatch } = useContext(CounterContext);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>전역 카운트: {state}</h1>
      {/* 직접 값을 고치지 않고, dispatch로 '요청서'만 보낸다 */}
      <button onClick={() => dispatch({ type: "increment" })}>증가 (+)</button>
      <button onClick={() => dispatch({ type: "decrement" })}>감소 (-)</button>
    </div>
  );
}
```

### 앱에 엔진 장착 (App)

```jsx
import { CounterProvider } from "./contexts/CounterProvider";
import CounterScreen from "./components/CounterScreen";

export default function App() {
  return (
    <CounterProvider>
      <CounterScreen />
    </CounterProvider>
  );
}
```

## 코드 해설

- **`CounterContext`:** "우리는 카운터 정보를 공유할 거야"라고 선언하는 약속이다.
- **`counterReducer`:** 컴포넌트 안에서 `count + 1`을 하지 않는다. 모든 계산을 여기서 몰아서 처리하므로, 나중에 계산 로직에 버그가 생기면 이 파일 하나만 고치면 된다.
- **`useReducer`:** 엔진의 피스톤과 같다. 실제 상태 변화를 일으키는 핵심 동력이다.
- **`value={{ state, dispatch }}`:** 객체로 묶어 보내는 이유는 하위 컴포넌트에서 `{ state, dispatch }`로 구조 분해 할당을 통해 필요한 것만 편하게 꺼내 쓰게 하기 위함이다.

### 데이터의 여정

1. 사용자가 **증가 버튼**을 클릭한다.
2. `dispatch`가 `"increment"`라는 요청서를 들고 `CounterProvider`로 달려간다.
3. 엔진 내부의 `counterReducer`가 요청서를 확인하고 `0 + 1 = 1`이라는 결론을 내린다.
4. 새로운 숫자 `1`이 `CounterContext` 통로를 타고 다시 `CounterScreen`으로 흐른다.
5. 화면이 새로운 숫자로 리렌더링된다.

## 실무 비유

Context + Reducer 패턴은 **공장의 생산 라인**과 같다:
- **Context**는 컨베이어 벨트(통로)다. 원자재와 완성품이 이 위를 따라 이동한다.
- **Reducer**는 제어실의 두뇌다. "이번에는 1을 더해"라는 주문서(action)를 받으면 정해진 매뉴얼대로 처리한다.
- **dispatch**는 주문서 투입구다. 작업자(컴포넌트)는 어떻게 만들지 몰라도 되고, 주문서만 넣으면 된다.

## 핵심 포인트

| 부품 | 역할 | 특징 |
|------|------|------|
| `createContext` | 통로 생성 | 데이터 흐름의 길을 정의 |
| `counterReducer` | 상태 변경 로직 | 순수 함수, 테스트 용이 |
| `useReducer` | Reducer와 초기값 연결 | `[state, dispatch]` 반환 |
| `CounterProvider` | Context + Reducer 결합 | 앱 전체에 전파 |
| `dispatch` | 요청서 전달 | 컴포넌트와 로직을 분리 |

## 자가 점검

- [ ] Context와 Reducer가 각각 어떤 역할을 하는지 한 문장으로 설명할 수 있는가?
- [ ] `dispatch`로 요청서를 보내면 데이터가 어떤 경로로 흐르는지 순서대로 나열할 수 있는가?
- [ ] 상태 변경 로직을 컴포넌트 밖(reducer)으로 분리하는 것의 장점을 설명할 수 있는가?
- [ ] `value`에 `state`와 `dispatch`를 함께 담아 보내는 이유를 이해했는가?
