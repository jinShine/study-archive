# 01강. 왜 useReducer가 필요한가

## 도입

`useState`로 여러 개의 상태를 따로따로 관리하면, 상태 간의 동기화가 깨지기 쉽다. 장바구니처럼 **items와 totalPrice가 항상 함께 움직여야 하는 경우**, 한쪽만 업데이트하고 다른 쪽을 깜빡하면 데이터 불일치 버그가 발생한다. 이 강의에서는 useState 방식의 한계를 직접 체험해본다.

## 개념 설명

### 로직의 파편화 문제

`useState`를 남발하면 관련 있는 상태들이 각각 독립적으로 흩어진다. 상품을 삭제할 때 `setItems`와 `setTotalPrice`를 **각각 따로** 호출해야 하는데, 하나라도 빠뜨리면 화면과 데이터가 어긋난다.

- `items`는 줄어들었는데 `totalPrice`는 그대로인 상황
- 할인율, 배송비, 포인트까지 추가되면 하나의 핸들러 함수가 10줄 이상의 괴물 코드가 됨

## 코드 예제

### useState로 장바구니를 관리하는 경우 (문제점 시연)

```jsx
import { useState } from 'react';

export default function CartPage() {
  // 파편화된 상태들
  const [items, setItems] = useState([
    { id: 1, name: '고성능 키보드', price: 150000 },
    { id: 2, name: '무선 마우스', price: 80000 },
  ]);
  const [totalPrice, setTotalPrice] = useState(230000);
  const [isLoading, setIsLoading] = useState(false);

  // 상품 추가 로직
  const handleAddToCart = () => {
    const newItem = { id: Date.now(), name: '새 상품', price: 50000 };

    // 상태 동기화의 위험성: items와 totalPrice를 각각 따로 업데이트해야 함
    setItems((prev) => [...prev, newItem]);
    setTotalPrice((prev) => prev + newItem.price);
  };

  // 상품 삭제 로직 (실수가 잦은 지점!)
  const handleRemoveItem = (id, price) => {
    // 만약 여기서 setItems만 하고 setTotalPrice를 깜빡한다면?
    // 데이터와 화면의 숫자가 따로 노는 '상태 불일치' 버그가 발생한다.
    setItems((prev) => prev.filter((item) => item.id !== id));
    setTotalPrice((prev) => prev - price);
  };

  return (
    <div>
      <h1>장바구니 (useState 버전)</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} - {item.price.toLocaleString()}원
            <button onClick={() => handleRemoveItem(item.id, item.price)}>
              삭제
            </button>
          </li>
        ))}
      </ul>
      <h2>총 결제 금액: {totalPrice.toLocaleString()}원</h2>
      <button onClick={handleAddToCart}>상품 추가 (+50,000원)</button>
    </div>
  );
}
```

## 코드 해설

| 요소 | 설명 |
|------|------|
| `items`, `totalPrice` | 서로 연관된 상태인데 별개의 useState로 관리됨 |
| `handleRemoveItem` | `setItems`와 `setTotalPrice`를 **둘 다** 호출해야 정합성이 유지됨 |
| 위험 포인트 | `setTotalPrice` 한 줄만 빠뜨려도 리스트는 줄어드는데 금액은 그대로인 버그 발생 |

## 실무 비유

useState 방식은 **'각자도생' 팀 프로젝트**와 같다.

디자이너, 개발자, 기획자가 서로 공유 문서 없이 각자 자기 일만 하는 상황이다. 누군가 내용을 수정하면 나머지 사람들에게 일일이 전화해서 "나 이거 바꿨으니까 너네도 바꿔!"라고 알려줘야 한다. 한 명이라도 전화를 못 받으면(코드를 깜빡하면) 프로젝트는 산으로 간다. 이것이 바로 **로직의 파편화**이다.

## 핵심 포인트

- `useState`가 여러 개일 때, 관련된 상태끼리 **항상 동기화**해야 하는 부담이 생긴다
- 상태가 늘어날수록 (할인율, 배송비, 포인트 등) 하나의 핸들러 함수가 비대해진다
- 이 문제를 해결하기 위해 **useReducer**가 등장한다: 여러 상태 변경을 하나의 '규칙서'로 통합 관리

## 자가 점검

- [ ] 상품 추가 버튼을 눌렀을 때, 리스트와 총 금액이 동시에 올라가는가?
- [ ] 삭제 버튼을 눌렀을 때, 해당 상품이 사라짐과 동시에 총 금액이 정확히 차감되는가?
- [ ] `handleRemoveItem`에서 `setTotalPrice` 줄만 주석 처리하면 어떤 일이 벌어지는지 상상해 보았는가? (리스트는 줄어드는데 금액은 그대로인 버그)
