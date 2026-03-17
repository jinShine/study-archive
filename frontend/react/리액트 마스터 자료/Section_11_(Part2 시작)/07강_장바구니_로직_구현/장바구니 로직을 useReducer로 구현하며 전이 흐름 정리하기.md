# 07강. 장바구니 로직을 useReducer로 구현하며 전이 흐름 정리하기

## 도입

장바구니의 복잡한 상태 변화를 설계하는 데 집중한다. 실무에서 가장 많이 쓰이는 **상수-액션-리듀서 분리 패턴**을 사용하여 상품 추가, 수량 증감, 삭제의 전이 흐름을 구성한다.

## 개념 설명

### 장바구니에서 일어나는 4가지 핵심 행동

| 액션 타입 | 설명 | 불변성 처리 방법 |
|-----------|------|-----------------|
| `ADD_ITEM` | 새 상품을 배열 끝에 추가 | `[...state.items, newItem]` |
| `INCREMENT` | 해당 상품 수량 +1 | `items.map()` + 조건부 교체 |
| `DECREMENT` | 해당 상품 수량 -1 (최소 1) | `items.map()` + `Math.max(1, ...)` |
| `REMOVE_ITEM` | 해당 상품 삭제 | `items.filter()` |

### 핵심 패턴

- `items.map(...)`: 기존 배열을 직접 수정하지 않고, 조건에 맞는 항목만 교체하여 새로운 배열을 반환한다. 리액트는 이 '새로운 참조'를 보고 변화를 감지한다.
- `Math.max(1, ...)`: 수량이 0이나 음수가 되지 않도록 방어하는 비즈니스 로직이다.

## 코드 예제

### 1. 액션 타입 설계

```js
// cartTypes.js
export const ADD_ITEM = "ADD_ITEM";       // 상품 추가
export const INCREMENT = "INCREMENT";     // 수량 +1
export const DECREMENT = "DECREMENT";     // 수량 -1
export const REMOVE_ITEM = "REMOVE_ITEM"; // 상품 삭제
```

### 2. 리듀서 로직 설계

```js
// cartReducer.js
import * as types from './cartTypes';

export const initialCartState = {
  items: []
};

export function cartReducer(state, action) {
  switch (action.type) {
    case types.ADD_ITEM:
      // 새로운 상품을 배열 끝에 추가
      return { ...state, items: [...state.items, action.payload] };

    case types.INCREMENT:
      // 해당 ID의 상품 수량만 1 증가시킨 새 배열을 생성
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload ? { ...item, quantity: item.quantity + 1 } : item
        )
      };

    case types.DECREMENT:
      // 수량을 줄이되, 1보다 클 때만 줄이고 아니면 그대로 유지
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
      };

    case types.REMOVE_ITEM:
      // filter를 사용하여 해당 ID가 아닌 상품들만 남김
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    default:
      return state;
  }
}
```

### 3. UI와 리듀서 연결

```jsx
// ShoppingCart.jsx
import { useReducer } from 'react';
import { cartReducer, initialCartState } from '../store/cartReducer';
import * as types from '../store/cartTypes';

export default function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // 테스트용 상품 추가 함수
  const addItem = () => {
    const newItem = { id: Date.now(), name: "신선한 사과", price: 3000, quantity: 1 };
    dispatch({ type: types.ADD_ITEM, payload: newItem });
  };

  return (
    <div>
      <h1>장바구니 미션</h1>
      <button onClick={addItem}>랜덤 상품 추가하기</button>

      {state.items.length === 0 ? (
        <p>장바구니가 비어 있습니다.</p>
      ) : (
        <ul>
          {state.items.map(item => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong> - {item.price.toLocaleString()}원
              </div>
              <div>
                <button onClick={() => dispatch({ type: types.DECREMENT, payload: item.id })}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => dispatch({ type: types.INCREMENT, payload: item.id })}>
                  +
                </button>
                <button onClick={() => dispatch({ type: types.REMOVE_ITEM, payload: item.id })}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 코드 해설

| 요소 | 설명 |
|------|------|
| `[...state.items, action.payload]` | 기존 배열을 펼치고 새 아이템을 추가하여 **새로운 배열** 반환 |
| `items.map(item => ...)` | 전체를 순회하며 id가 같은 항목만 교체, 나머지는 그대로 |
| `Math.max(1, item.quantity - 1)` | 수량이 0이나 음수가 되지 않도록 **방어 로직** |
| `items.filter(item => ...)` | 해당 id가 아닌 항목들만 남겨 **삭제 효과** 구현 |
| `{ ...state }` | 항상 기존 상태를 복사하여 불변성 유지. 다른 상태가 추가되어도 데이터 유실 없음 |

## 실무 비유

장바구니는 **'스마트 주문서'** 시스템과 같다.

- **State**: 주방에 붙어있는 현재 주문 목록
- **Dispatch**: 홀 직원이 주방으로 날리는 "사과 하나 추가요!"라는 외침
- **Action**: 그 외침에 담긴 정보(상품명, ID 등)
- **Reducer**: 그 소리를 듣고 주문 목록을 새로 작성하는 주방장. 주방장이 새로 적은 주문서가 나와야 서빙 담당(UI)이 음식을 내갈 수 있다.

## 핵심 포인트

- 장바구니의 핵심 행동 4가지: **추가(ADD)**, **증가(INCREMENT)**, **감소(DECREMENT)**, **삭제(REMOVE)**
- `map`으로 수량 변경, `filter`로 삭제, 스프레드(`...`)로 추가 -- 모두 **불변성**을 지키는 패턴
- `Math.max(1, ...)`로 수량이 1 미만으로 떨어지지 않게 방어한다
- 상수-액션-리듀서 분리 패턴을 사용하면 코드의 가독성과 유지보수성이 높아진다

## 자가 점검

- [ ] 상품 추가 버튼 클릭 시 리스트에 항목이 생기는가?
- [ ] `+` 버튼과 `-` 버튼을 누를 때 수량이 실시간으로 변경되는가?
- [ ] 수량이 1일 때 `-` 버튼을 눌러도 0으로 내려가지 않고 1로 유지되는가?
- [ ] '삭제' 버튼 클릭 시 해당 항목만 정확히 사라지는가?
