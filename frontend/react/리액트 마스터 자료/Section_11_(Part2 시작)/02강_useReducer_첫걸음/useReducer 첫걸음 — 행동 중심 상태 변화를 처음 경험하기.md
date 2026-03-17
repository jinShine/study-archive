# 02강. useReducer 첫걸음 -- 행동 중심 상태 변화를 처음 경험하기

## 도입

흩어져 있던 `setState`들을 하나의 **reducer 함수**로 모으고, 사용자의 행동을 `dispatch`로 전달하는 구조를 처음 경험한다. 이번 강의부터 여러 상태를 하나의 '규칙서(Reducer)'로 통합하여 관리하는 패턴을 학습한다.

## 개념 설명

### useReducer의 기본 구조

1. **초기 상태(initialState)**: 여러 관리 포인트를 하나의 객체 덩어리로 묶는다
2. **리듀서(Reducer)**: 상태 변화의 '중앙 규칙서'. (이전 상태, 액션)을 받아 새로운 상태를 계산하여 반환한다
3. **dispatch**: 컴포넌트에서 "어떤 일이 일어났는지"를 리듀서에게 보고하는 배달원

### useState와의 차이

- `useState`: 컴포넌트 안에 직접적인 계산 로직(`state + 1`)이 존재
- `useReducer`: 컴포넌트는 오직 "어떤 일이 일어났는지(Action)"만 보고하고, 계산은 리듀서가 담당

## 코드 예제

```jsx
import { useReducer } from 'react';

// 1. 초기 상태: 여러 관리 포인트를 하나의 덩어리로 묶음
const initialState = {
  items: [
    { id: 1, name: "고성능 키보드", price: 150000, qty: 1 },
    { id: 2, name: "무선 마우스", price: 80000, qty: 1 }
  ],
  totalPrice: 230000,
  discount: 10000
};

// 2. 리듀서(Reducer): 상태 변화의 '중앙 규칙서'
// (이전 상태, 액션)을 받아 새로운 상태를 계산하여 반환한다.
function cartReducer(state, action) {
  switch (action.type) {
    case 'INCREASE_QTY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, qty: item.qty + 1 }
            : item
        ),
        // 수량 증가 시 총액은 늘리고, 할인금액은 줄이는 복합 로직을 한곳에서 처리
        totalPrice: state.totalPrice + action.payload.price,
        discount: Math.max(0, state.discount - 500)
      };
    default:
      return state;
  }
}

export default function ReducerCartPage() {
  // 3. useReducer 연결 (상태와 배달원(dispatch)을 생성)
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <div>
      <h1>장바구니 (useReducer 첫걸음)</h1>
      <ul>
        {state.items.map(item => (
          <li key={item.id}>
            <strong>{item.name}</strong> (수량: {item.qty}개)
            <button
              onClick={() => dispatch({
                type: 'INCREASE_QTY',
                payload: { id: item.id, price: item.price }
              })}
            >
              + 수량 추가
            </button>
          </li>
        ))}
      </ul>
      <div>
        <p>상품 합계: {state.totalPrice.toLocaleString()}원</p>
        <p>적용 할인: -{state.discount.toLocaleString()}원</p>
        <h2>최종 결제 금액: {(state.totalPrice - state.discount).toLocaleString()}원</h2>
      </div>
    </div>
  );
}
```

## 코드 해설

| 요소 | 설명 |
|------|------|
| `initialState` | items, totalPrice, discount를 **하나의 객체**로 통합 관리 |
| `cartReducer` | `action.type`을 보고 어떤 상태 변화를 적용할지 결정하는 중앙 규칙서 |
| `{ ...state, ... }` | 기존 state를 직접 수정하지 않고 **새로운 객체를 반환** (불변성 유지) |
| `dispatch({ type, payload })` | 이벤트 핸들러 내부가 dispatch 호출 **한 줄**로 단순해짐 |
| `INCREASE_QTY` case | 수량 증가 + 총액 증가 + 할인 감소를 **한 곳에서** 동시에 처리 |

## 실무 비유

useReducer는 집 안 곳곳에 흩어져 있던 전등 스위치를 거실 한복판의 **'중앙 제어 패널'**로 옮긴 것과 같다. 이전에는 전등을 켜기 위해 방마다 뛰어다녀야 했다면(setState 분산), 이제는 제어 패널에서 버튼(Action) 하나만 누르면 리듀서가 알아서 해당 구역의 불을 조절한다. 어떤 행동이 어떤 상태 변화를 일으키는지 한눈에 보이게 된다.

## 핵심 포인트

- `useReducer(reducer, initialState)`로 상태와 dispatch를 생성한다
- 리듀서 함수 내에서 기존 state를 **직접 수정하지 않고** 반드시 `{ ...state, ... }`로 새로운 객체를 반환해야 한다
- 컴포넌트는 "무엇이 일어났는지"만 dispatch로 알리고, "어떻게 바꿀지"는 리듀서가 결정한다
- 여러 상태를 동시에 바꿔야 하는 복합 로직을 **리듀서 한 곳**에서 일관되게 처리할 수 있다

## 자가 점검

- [ ] `+ 수량 추가` 버튼 클릭 시 해당 상품의 수량 숫자가 정상적으로 올라가는가?
- [ ] 수량이 올라갈 때 상품 합계 증가와 할인 금액 감소가 **동시에** 정확히 일어나는가?
- [ ] 이벤트 핸들러(onClick) 내부가 dispatch 호출 한 줄로 단순해졌음을 확인했는가?
- [ ] 리듀서 함수 내에서 기존 state를 직접 수정하지 않고 반드시 `{ ...state, ... }`로 새로운 객체를 반환하고 있는가?
