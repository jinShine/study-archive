# 06강. 파일 구조와 네이밍 -- 유지보수 가능한 Reducer 아키텍처 만들기

## 도입

실무 수준의 대규모 프로젝트에서도 흔들리지 않는 **'기능 중심 폴더 구조'**를 설계한다. 기능별로 Types, Actions, Reducer를 모아놓고, rootReducer로 통합하는 아키텍처를 학습한다.

## 개념 설명

### 기능 중심 폴더 구조

기능(feature)별로 폴더를 만들어 관련 파일들을 묶는다. 예를 들어 '밥 관리' 기능은 `reducers/rice/` 폴더 아래에 `riceTypes.js`, `riceActions.js`, `riceReducer.js`를 둔다.

```
reducers/
├── rice/
│   ├── riceTypes.js      <-- 액션 이름(상수) 정의
│   ├── riceActions.js    <-- 액션 생성 함수
│   └── riceReducer.js    <-- 밥 담당 리듀서
├── soup/
│   ├── soupTypes.js
│   ├── soupActions.js
│   └── soupReducer.js
└── rootReducer.js        <-- 모든 리듀서를 합치는 중앙 본부
```

### rootReducer의 역할

rootReducer는 직접 계산하지 않는다. 요청이 들어오면 "밥 관련이네? 밥 리듀서 너가 처리해"라고 **배분만** 한다. 이 구조 덕분에 리듀서가 아무리 커져도 파일이 난잡해지지 않는다.

### 네이밍 규칙

파일 이름이 역할을 명확히 드러내야 한다:
- `riceReducer.js` -- 밥 담당 리듀서
- `riceActions.js` -- 밥 담당 액션 생성 함수
- `riceTypes.js` -- 밥 담당 액션 타입 상수

## 코드 예제

### 1. 액션 타입 정의

```js
// riceTypes.js
export const ADD_RICE = "ADD_RICE";           // 밥 추가
export const REMOVE_RICE = "REMOVE_RICE";     // 밥 제거
export const SET_RICE_WARNING = "SET_RICE_WARNING"; // 재고 경고 메시지 설정
```

### 2. 밥 담당 리듀서

```js
// riceReducer.js
import * as types from './riceTypes';

// 초기 상태: 밥 리듀서가 관리할 데이터의 시작점
export const initialRiceState = {
  stock: 20,
  warning: ""
};

export function riceReducer(state, action) {
  switch (action.type) {
    case types.ADD_RICE:
      // 기존 상태를 복사(...state)하고 stock만 1 증가시킨 새 객체를 반환
      return { ...state, stock: state.stock + 1 };

    case types.REMOVE_RICE:
      // 재고가 0보다 클 때만 감소시키는 방어 로직
      return { ...state, stock: state.stock > 0 ? state.stock - 1 : 0 };

    case types.SET_RICE_WARNING:
      // 액션에 담겨온 payload(메시지)를 warning 상태에 저장
      return { ...state, warning: action.payload };

    default:
      return state;
  }
}
```

### 3. 액션 생성 함수

```js
// riceActions.js
import * as types from './riceTypes';

export const addRice = () => ({ type: types.ADD_RICE });
export const removeRice = () => ({ type: types.REMOVE_RICE });
export const setRiceWarning = (message) => ({
  type: types.SET_RICE_WARNING,
  payload: message
});
```

### 4. 중앙 운영 본부 (rootReducer)

```js
// rootReducer.js
import { riceReducer } from './rice/riceReducer';
// 다른 리듀서가 있다면 여기서 함께 가져온다
// import { soupReducer } from './soup/soupReducer';

/**
 * rootReducer: 각 하위 리듀서에게 상태의 일부를 맡기고 결과를 취합한다.
 */
export function rootReducer(state, action) {
  return {
    // 전체 상태 중 'rice' 부분은 riceReducer가 담당하도록 위임
    rice: riceReducer(state.rice, action),
    // soup: soupReducer(state.soup, action),
  };
}
```

### 5. 컴포넌트에서 조립

```jsx
// App.jsx
import { useReducer } from 'react';
import { rootReducer } from './reducers/rootReducer';
import { initialRiceState } from './reducers/rice/riceReducer';
import { addRice, removeRice, setRiceWarning } from './reducers/rice/riceActions';

export default function App() {
  // 전체 초기 상태 조립
  const initialState = {
    rice: initialRiceState
  };

  // rootReducer를 사용하여 통합 상태 관리
  const [state, dispatch] = useReducer(rootReducer, initialState);

  return (
    <div>
      <h1>아키텍처 기반 급식실 시스템</h1>

      <h3>밥 재고 관리</h3>
      <p>현재 재고: <strong>{state.rice.stock}</strong>인분</p>

      {state.rice.stock < 5 && (
        <p style={{ color: 'red' }}>{state.rice.warning || "재고 부족!"}</p>
      )}

      <button onClick={() => dispatch(addRice())}>밥 추가</button>
      <button onClick={() => dispatch(removeRice())}>밥 배식</button>
      <button onClick={() => dispatch(setRiceWarning("쌀이 거의 떨어졌습니다!"))}>
        경고 알림 설정
      </button>
    </div>
  );
}
```

## 코드 해설

| 요소 | 설명 |
|------|------|
| `import * as types` | 해당 기능의 모든 액션 타입을 한 번에 가져오는 패턴 |
| `rootReducer` | 직접 계산하지 않고 하위 리듀서에게 담당 상태를 **위임**만 함 |
| `state.rice` | rootReducer가 전체 상태에서 rice 부분만 riceReducer에게 전달 |
| `initialRiceState` | 리듀서 파일에서 초기 상태도 함께 export하여 조립 시 사용 |

## 실무 비유

대형 급식실의 **부서별 운영 체계**와 같다.

- `rootReducer`는 **총괄 관리자**. 요청서(Action)가 들어오면 "밥 관련이네? 밥 팀장에게 넘겨!" 하고 배분만 한다.
- `riceReducer`는 **밥 팀장**. 밥 재고에 대한 모든 규칙을 전문적으로 처리한다.
- 새로운 메뉴(기능)가 추가되면 해당 폴더만 새로 만들고, rootReducer에 한 줄만 추가하면 된다.

폴더 구조와 이름만 보고도 'rice' 폴더를 찾아가 로직을 수정할 수 있다. 이것이 바로 **유지보수가 쉬운 아키텍처의 힘**이다.

## 핵심 포인트

- **기능 중심 폴더 구조**: 관련 파일(Types, Actions, Reducer)을 기능별 폴더에 묶는다
- **rootReducer**: 하위 리듀서에게 상태 일부를 위임하여 관심사를 분리한다
- **네이밍 규칙**: 파일 이름이 역할을 명확히 드러내야 한다 (`riceReducer.js`, `riceActions.js`)
- 새 기능 추가 시 폴더만 추가하고 rootReducer에 한 줄 추가하면 되므로 **확장성이 좋다**
- `import * as types` 패턴으로 타입 상수를 깔끔하게 가져올 수 있다

## 자가 점검

- [ ] 버튼 클릭 시 `state.rice.stock` 값이 정상적으로 증감되는가?
- [ ] '경고 알림 설정' 클릭 시 재고가 5 미만인 경우 빨간색 메시지가 나타나는가?
- [ ] `reducers/rice/` 폴더 안의 파일들이 각각 제 역할(상수, 액션, 리듀서)을 하고 있는가?
- [ ] 네이밍 규칙이 일관적인가? (`riceReducer.js`, `riceActions.js`, `riceTypes.js`)
