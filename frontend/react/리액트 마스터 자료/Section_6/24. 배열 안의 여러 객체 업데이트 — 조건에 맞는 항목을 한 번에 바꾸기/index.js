// 24.updating-multiple-objects.jsx
// -------------------------------------------------------------
// 24. 배열 안의 여러 객체 업데이트 — 조건에 맞는 항목을 한 번에 바꾸기
// -------------------------------------------------------------
// 핵심 요약
// - 배열 상태를 map()으로 새 배열로 만들어야 React가 변화를 감지함
// - 조건에 맞는 객체만 펼쳐서({...obj, key: newValue}) 교체
// - 직접 변경(forEach, obj.prop = ...)은 금지 (불변성 위반)
// -------------------------------------------------------------

import React, { useState } from "react";

/* -----------------------------------------------------------
 * 섹션 1. 기본 데이터 구조 예시
 *   - cart, todos 구조의 예시
 * ---------------------------------------------------------*/

const initialState = {
  cart: {
    coupon: null,
    items: [
      { id: 1, name: "노트북", price: 1500000, discount: 0 },
      { id: 2, name: "무선 마우스", price: 25000, discount: 0 },
      { id: 3, name: "키보드", price: 45000, discount: 0 },
    ],
  },
  todos: [
    { id: 1, text: "프로젝트 문서 작성", done: false, tags: ["work"] },
    { id: 2, text: "쿠폰 기능 테스트", done: false, tags: ["coupon", "urgent"] },
    { id: 3, text: "회의 일정 조율", done: false, tags: ["schedule"] },
  ],
};

/* -----------------------------------------------------------
 * 섹션 2. 배열 안의 객체 업데이트 — 예제 1: 할인 적용
 *   - 모든 항목에 10% 할인 적용
 * ---------------------------------------------------------*/

function Cart() {
  const [items, setItems] = useState([
    { id: 1, name: "노트북", price: 1200000 },
    { id: 2, name: "키보드", price: 50000 },
    { id: 3, name: "마우스", price: 30000 },
  ]);

  function applyDiscount() {
    // ✅ map으로 새 배열 만들고, 각 항목 복사 후 덮어쓰기
    setItems(
      items.map((item) => ({
        ...item,
        price: Math.floor(item.price * 0.9),
      }))
    );
  }

  return (
    <div>
      {items.map((i) => (
        <p key={i.id}>
          {i.name} — {i.price}원
        </p>
      ))}
      <button onClick={applyDiscount}>10% 할인 적용</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 3. 배열 안 객체 업데이트 — 예제 2: urgent 항목 완료 처리
 *   - 조건: tag가 "urgent"인 항목만 done: true로 바꾸기
 * ---------------------------------------------------------*/

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "공부하기", done: false, tag: "urgent" },
    { id: 2, text: "청소하기", done: false, tag: "normal" },
    { id: 3, text: "운동하기", done: false, tag: "urgent" },
  ]);

  function completeUrgent() {
    // ✅ tag가 "urgent"인 항목만 업데이트
    setTodos(
      todos.map((todo) =>
        todo.tag === "urgent" ? { ...todo, done: true } : todo
      )
    );
  }

  return (
    <div>
      {todos.map((t) => (
        <p key={t.id}>
          <label>
            <input type="checkbox" checked={t.done} readOnly /> {t.text} ({t.tag})
          </label>
        </p>
      ))}
      <button onClick={completeUrgent}>긴급 항목 완료 처리</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 4. 통합 데모용 루트 컴포넌트
 * ---------------------------------------------------------*/

export default function App() {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        lineHeight: 1.4,
        padding: 16,
      }}
    >
      <h2>24. 배열 안의 여러 객체 업데이트 — 조건에 맞는 항목을 한 번에 바꾸기</h2>

      <h3>섹션 1. 할인 적용</h3>
      <Cart />

      <h3>섹션 2. urgent 항목 완료 처리</h3>
      <TodoList />
    </div>
  );
}

/* -----------------------------------------------------------
 * 1) 절대 상태 배열을 직접 수정하지 말 것
 *    - ❌ todos[0].done = true
 * 2) map으로 새 배열을 만들어 반환
 *    - ✅ setTodos(prev => prev.map(t => t.tag === "urgent" ? {...t, done:true} : t))
 * 3) 수정 대상은 펼쳐서({...obj}) 얕은 복사 후 교체
 * 4) 중첩 객체는 단계별로 복사 (ex. address.city)
 * 5) 함수형 업데이트(prev => ...)는 이전 상태 기반일 때 필수
 * ---------------------------------------------------------*/
