# 09강. useReducer 마무리 -- 구조를 다듬고 실전 패턴으로 정리하기

## 도입

실무 수준의 유지보수성을 확보하기 위해 **액션 타입(Types)**, **액션 생성자(Action Creators)**, **리듀서(Reducer)**를 체계적으로 분리하고, if 문 대신 switch-case 문을 도입하여 리듀서를 정돈하는 실전 패턴을 완성한다.

## 개념 설명

### 실전 패턴의 핵심: 3단 분리

```
actions/cartActions.js   --> 액션 타입 상수 + 액션 생성 함수
reducers/cartReducer.js  --> switch-case 기반 리듀서
data/initialCart.js      --> 초기 데이터
```

### Action Creator의 가치

- **보호막 역할**: 컴포넌트가 액션 객체의 구체적인 생김새를 몰라도 함수 호출만으로 '규격화된 요청서'를 만들 수 있다
- **오타 방지**: `"add"`라는 글자를 직접 타이핑하다가 `"aad"`라고 오타를 내면 찾기가 매우 어렵지만, 상수를 쓰면 즉시 잡힌다
- **일관성**: 모든 곳에서 같은 형식의 액션 객체가 생성된다

### if 문에서 switch-case로

if 문 기반 리듀서를 switch-case로 바꾸면 각 액션의 처리 로직이 명확하게 구분되어 가독성이 향상된다.

## 코드 예제

### 1. 액션 상수와 생성자 정의

```js
// cartActions.js

// 1. 액션 타입 상수: 오타 방지 및 자동 완성을 위해 문자열을 변수에 담는다
export const ADD = "add";
export const REMOVE = "remove";
export const INCREMENT = "increment";
export const DECREMENT = "decrement";

// 2. 액션 크리에이터: dispatch(addItem(item)) 처럼 사용할 수 있게 해주는
//    '요청서 자동 작성 함수'

export function addItem(item) {
  // 새로운 상품을 추가할 때 필요한 데이터(item)를 화물로 실어 보냄
  return { type: ADD, item };
}

export function removeItem(id) {
  // 삭제할 상품의 id를 알려주는 요청서를 반환
  return { type: REMOVE, id };
}

export function increment(id) {
  // 수량을 올릴 상품의 id를 담은 요청서를 반환
  return { type: INCREMENT, id };
}

export function decrement(id) {
  // 수량을 내릴 상품의 id를 담은 요청서를 반환
  return { type: DECREMENT, id };
}
```

### 2. switch-case 기반 리듀서

```js
// cartReducer.js
import { ADD, REMOVE, INCREMENT, DECREMENT } from "../actions/cartActions";

/**
 * [장바구니 리듀서]
 * 주방장(Reducer)이 주문서(Action) 제목(Type)을 보고 요리법(Case)을 결정한다.
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case ADD:
      // 기존 상품 목록 뒤에 새 상품을 붙여 새로운 배열을 생성
      return [...state, action.item];

    case REMOVE:
      // action.id와 일치하지 않는 상품들만 남겨서 새로운 배열을 반환
      return state.filter((p) => p.id !== action.id);

    case INCREMENT:
      // 전체를 돌면서 id가 일치하는 상품의 수량(quantity)만 1 올린 새 객체로 교체
      return state.map((p) =>
        p.id === action.id ? { ...p, quantity: p.quantity + 1 } : p
      );

    case DECREMENT:
      // 수량을 내리되, Math.max를 써서 최소 1개는 유지되도록 방어 로직
      return state.map((p) =>
        p.id === action.id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p
      );

    default:
      // 처리할 수 없는 주문서가 들어오면 '현재 상태'를 그대로 유지해 에러를 방지
      return state;
  }
}
```

### 3. 자식 컴포넌트

```jsx
// CartItem.jsx
import React from "react";

export function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div>
      <p>{item.name} ({item.price.toLocaleString()}원)</p>
      <p>수량: {item.quantity}</p>
      <button onClick={onIncrement}>+</button>
      <button onClick={onDecrement}>-</button>
      <button onClick={onRemove}>삭제</button>
    </div>
  );
}
```

### 4. 부모 컴포넌트에서 실전 패턴 적용

```jsx
// CartApp.jsx
import React, { useReducer } from "react";
import { initialCart } from "./data/initialCart";
import { cartReducer } from "./reducers/cartReducer";
import { CartItem } from "./components/CartItem";
// 액션 생성 함수들을 한꺼번에 불러온다
import { addItem, removeItem, increment, decrement } from "./actions/cartActions";

export function CartApp() {
  // 최신 장바구니 상태(cart)와 요청 전달자(dispatch)를 준비
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  return (
    <div>
      <h2>실전 패턴 장바구니</h2>

      {/* 장바구니 리스트 렌더링 */}
      {cart.map((p) => (
        <CartItem
          key={p.id}
          item={p}
          // dispatch(액션 생성 함수(데이터)) 패턴으로 코드가 읽기 좋아졌다
          onIncrement={() => dispatch(increment(p.id))}
          onDecrement={() => dispatch(decrement(p.id))}
          onRemove={() => dispatch(removeItem(p.id))}
        />
      ))}

      <div>
        <strong>총 품목: {cart.length}개</strong>
      </div>
    </div>
  );
}
```

## 코드 해설

| 요소 | 설명 |
|------|------|
| `export const ADD = "add"` | 액션 타입을 상수로 정의하여 오타 원천 차단 |
| `addItem(item)` | Action Creator. 컴포넌트는 내부 구조를 몰라도 함수만 호출하면 됨 |
| `switch (action.type)` | if 문 대신 switch-case로 각 액션의 처리 로직을 명확하게 구분 |
| `dispatch(increment(p.id))` | `dispatch(액션생성함수(데이터))` 패턴. 가독성이 크게 향상됨 |
| `CartItem` | 자체 상태 없이 부모의 콜백만 실행하는 프레젠테이션 컴포넌트 |

## 실무 비유

`dispatch(increment(id))`는 마치 키오스크에서 **'수량 증가' 버튼을 누르는 것**과 같다. 사용자는 내부적으로 데이터가 어떻게 처리되는지 몰라도 버튼(함수)을 누르기만 하면, 키오스크(Dispatch)가 주문서(Action)를 주방(Reducer)에 전달하여 전광판(UI)에 숫자가 바뀌게 된다.

## 핵심 포인트

- **액션 타입 상수**: 문자열 오타를 원천 차단하고 자동 완성을 지원한다
- **Action Creator**: 컴포넌트가 액션 객체의 구조를 몰라도 함수 호출만으로 요청서를 만든다
- **switch-case**: if 문보다 가독성이 좋고, 각 액션의 처리 로직이 명확히 구분된다
- **`dispatch(actionCreator(data))` 패턴**: 실무에서 가장 많이 쓰이는 깔끔한 형태
- 컴포넌트 파일에서 복잡한 if 문이나 직접적인 상태 변경 로직이 사라지고, **화면 구성만** 남는다

## 자가 점검

- [ ] +, -, 삭제 버튼이 오동작 없이 잘 작동하는가?
- [ ] 수량을 1에서 더 내리려고 할 때 1로 고정되는가? (Math.max 로직 확인)
- [ ] 브라우저 개발자 도구 콘솔에 액션 타입 오타와 관련된 에러가 발생하지 않는가?
- [ ] 컴포넌트 파일 안에 복잡한 if 문이나 직접적인 상태 변경 로직이 사라졌음을 확인했는가?
- [ ] `dispatch(actionCreator(data))` 패턴의 이점을 설명할 수 있는가?
