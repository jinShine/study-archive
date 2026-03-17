# 08강. useReducer로 장바구니 로직 직접 구현하기 -- 설계를 코드로 옮기는 시간

## 도입

이번 강의에서는 데이터, 로직, UI를 명확히 분리하여 장바구니를 구현한다. 초기 데이터를 별도 파일로 관리하고, 리듀서에 if 문 기반 로직을 작성하며, 자식 컴포넌트에서 부모가 준 함수를 실행하는 패턴을 학습한다.

## 개념 설명

### 파일 분리 전략

| 파일 | 역할 |
|------|------|
| `initialCart.js` | 초기 데이터 정의 (data 레이어) |
| `cartReducer.js` | 상태 변화 규칙 정의 (logic 레이어) |
| `CartItem.jsx` | 개별 상품 표시 (UI 레이어) |
| `CartApp.jsx` | 전체 상태 관리 및 조립 (부모 컴포넌트) |

### if 문 기반 리듀서

switch 문 대신 if 문으로도 리듀서를 작성할 수 있다. 간단한 경우에는 if 문이 직관적일 수 있지만, 액션이 많아지면 switch가 가독성이 더 좋다.

### 부모-자식 컴포넌트 패턴

자식 컴포넌트(CartItem)는 스스로 상태를 바꾸지 않고, 부모가 준 함수(onIncrement, onDecrement, onRemove)를 **실행만** 한다.

## 코드 예제

### 1. 초기 데이터 설정

```js
// initialCart.js
export const initialCart = [
  { id: 1, name: "사과", price: 1000, quantity: 1 },
  { id: 2, name: "바나나", price: 1500, quantity: 2 }
];
```

### 2. 리듀서 로직 작성

```js
// cartReducer.js

/**
 * [장바구니 전용 리듀서]
 * @param {Array} state - 현재 장바구니 배열 (원본은 절대 직접 수정하지 않음)
 * @param {Object} action - 무슨 일을 할지 적힌 주문서 { type, id, item 등 }
 */
export function cartReducer(state, action) {
  // 1. 상품 추가 규칙
  if (action.type === "add") {
    // 기존 배열을 펼치고([...state]) 새 아이템을 추가하여 '새로운 배열'을 반환
    return [...state, action.item];
  }

  // 2. 상품 삭제 규칙
  if (action.type === "remove") {
    // filter를 사용해 해당 id가 아닌 상품들만 골라낸 '새로운 배열'을 생성
    return state.filter((p) => p.id !== action.id);
  }

  // 3. 수량 증가 규칙
  if (action.type === "increment") {
    // map을 사용해 전체를 순회하며 id가 같은 상품의 수량만 1 증가
    return state.map((p) =>
      p.id === action.id ? { ...p, quantity: p.quantity + 1 } : p
    );
  }

  // 4. 수량 감소 규칙 (방어 로직 포함)
  if (action.type === "decrement") {
    return state.map((p) =>
      // Math.max(1, ...)를 사용하여 수량이 1 미만으로 떨어지는 것을 방지
      p.id === action.id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p
    );
  }

  // 정해진 규칙이 없으면 현재 상태를 그대로 유지
  return state;
}
```

### 3. 자식 컴포넌트 (개별 상품)

```jsx
// CartItem.jsx
import React from "react";

/**
 * [개별 상품 컴포넌트]
 * 스스로 상태를 바꾸지 않고, 부모가 준 함수(onIncrement 등)를 실행만 한다.
 */
export function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div>
      <p><strong>{item.name}</strong> - {item.price.toLocaleString()}원</p>
      <p>수량: {item.quantity}</p>
      {/* 버튼 클릭 시 부모가 내려준 '통신기'를 작동 */}
      <button onClick={onIncrement}>+</button>
      <button onClick={onDecrement}>-</button>
      <button onClick={onRemove}>삭제</button>
    </div>
  );
}
```

### 4. 메인 앱 조립 (부모 컴포넌트)

```jsx
// CartApp.jsx
import React, { useReducer } from "react";
import { initialCart } from "./data/initialCart";
import { cartReducer } from "./reducers/cartReducer";
import { CartItem } from "./components/CartItem";

export function CartApp() {
  // [상태, 전달자] = useReducer(매뉴얼, 초기값)
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  // 1. 추가 핸들러: dispatch를 통해 'add' 주문서를 보냄
  function handleAdd() {
    const newItem = { id: Date.now(), name: "새 상품", price: 2000, quantity: 1 };
    dispatch({ type: "add", item: newItem });
  }

  // 2. 삭제/증감 핸들러: 어떤 아이템인지 구분하기 위해 id를 함께 보냄(Payload)
  function handleRemove(id) {
    dispatch({ type: "remove", id });
  }

  function handleIncrement(id) {
    dispatch({ type: "increment", id });
  }

  function handleDecrement(id) {
    dispatch({ type: "decrement", id });
  }

  return (
    <div>
      <h2>My Shopping Cart</h2>
      <button onClick={handleAdd}>새 상품 추가하기</button>

      {cart.map((p) => (
        <CartItem
          key={p.id}
          item={p}
          onIncrement={() => handleIncrement(p.id)}
          onDecrement={() => handleDecrement(p.id)}
          onRemove={() => handleRemove(p.id)}
        />
      ))}

      <div>총 품목 수: {cart.length}개</div>
    </div>
  );
}
```

## 코드 해설

| 요소 | 설명 |
|------|------|
| `action.type` | 주문서의 제목. 리듀서는 이 제목을 보고 어떤 로직을 실행할지 결정 |
| `[...state, action.item]` | 원본 배열을 건드리지 않고 새 아이템을 추가한 **새 배열** 반환 |
| `state.filter(...)` | 해당 id가 아닌 항목만 남겨 **삭제 효과** 구현 |
| `state.map(...)` | 전체를 순회하며 id가 일치하는 항목의 수량만 변경한 **새 배열** 반환 |
| `CartItem` 컴포넌트 | 자체 상태 없이 부모가 내려준 콜백 함수만 실행 (단방향 데이터 흐름) |
| `handleAdd`, `handleRemove` 등 | dispatch를 감싼 핸들러 함수. 부모에서 정의하고 자식에게 전달 |

## 실무 비유

dispatch는 식당의 **벨(Bell)**이다. 손님(버튼 클릭)이 벨을 누르면서 "여기 추가요!"라고 외치면, 그 소리(action)가 주방장(reducer)에게 전달된다. 주방장은 미리 정해진 레시피에 따라 재료 목록(state)을 업데이트하고, 완성된 새 요리 정보를 홀 서빙 담당(UI)에게 넘겨 화면이 다시 그려지게 된다.

## 핵심 포인트

- 데이터(initialCart), 로직(cartReducer), UI(CartItem)를 **파일별로 분리**하면 유지보수가 쉬워진다
- if 문 기반 리듀서도 가능하지만, 액션이 많아지면 switch 문이 가독성이 더 좋다
- `...state`, `filter`, `map` 등은 모두 원본을 건드리지 않고 복사본을 만드는 **불변성 패턴**
- 자식 컴포넌트는 자체 상태를 갖지 않고 부모가 내려준 콜백 함수만 실행한다 (단방향 데이터 흐름)

## 자가 점검

- [ ] `+` 버튼 클릭 시 해당 품목의 수량만 정확히 올라가는가?
- [ ] `-` 버튼 클릭 시 수량이 1 밑으로 내려가지 않도록 방어되는가? (Math.max 확인)
- [ ] '삭제' 버튼 클릭 시 리스트에서 해당 품목이 즉시 사라지는가?
- [ ] '새 상품 추가' 클릭 시 새로운 항목이 리스트 하단에 잘 붙는가?
