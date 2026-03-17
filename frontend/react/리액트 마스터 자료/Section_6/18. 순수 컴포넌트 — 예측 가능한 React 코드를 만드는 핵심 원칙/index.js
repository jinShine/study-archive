// ================================================
// 🌱 React 순수성과 상태 관리 — 전체 코드 정리본
// ================================================
// 본 문서는 순수 함수, 순수 컴포넌트, 비순수 사례, 
// 그리고 useState를 활용한 상태 관리로 발전하는 과정을 보여줍니다.

// ------------------------------------------------
// ✅ 1. 순수 함수 (Pure Function)의 기본 개념
// ------------------------------------------------
// - 입력값이 같으면 항상 같은 결과를 반환하고,
// - 외부 상태를 변경하지 않는 함수

function add(x, y) {
  return x + y; // 항상 같은 입력에 대해 같은 결과 → 순수함수 ✅
}

function getTime() {
  return new Date().getTime(); // 실행 시점마다 달라짐 → 비순수 ❌
}

// 입력: x, y
// 출력: f(x, y) = 항상 같은 값
// 외부 상태: 변경 없음
// add(2,3) → 항상 5 (✅ 순수)
// getTime() → 매번 다름 (❌ 순수 아님)


// ------------------------------------------------
// ✅ 2. 순수 컴포넌트 vs ❌ 비순수 컴포넌트
// ------------------------------------------------
// 순수 컴포넌트: (props, state) → 항상 동일한 JSX 반환
// 비순수 컴포넌트: 외부 변수나 전역 상태에 따라 결과가 달라짐
// React는 순수 컴포넌트를 전제로 동작함
// ------------------------------------------------


// ------------------------------------------------
// ❌ 3. 비순수한 컴포넌트의 예시 (부작용 발생)
// ------------------------------------------------
const products = ["Shoes", "Bag"];

function ProductList({ items }) {
  // ❌ props 직접 수정 금지 — 외부 데이터를 변경함
  items.push("Hat"); // 원본 데이터 변경 → 예기치 못한 결과 발생
  return <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

function Summary({ items }) {
  return <p>총 상품 수: {items.length}</p>;
}

export default function App() {
  return (
    <>
      <ProductList items={products} />
      <Summary items={products} />
    </>
  );
}


// ------------------------------------------------
// ✅ 4. 순수하게 리팩토링된 컴포넌트 예시
// ------------------------------------------------
// props나 외부 배열을 직접 수정하지 않고, 새로운 배열/값을 생성하여 사용
// 외부 상태를 건드리지 않기 때문에 부작용이 없음
// ------------------------------------------------

function ProductListPure({ products, discountRate }) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.name}: {Math.floor(p.price * (1 - discountRate))}원
        </li>
      ))}
    </ul>
  );
}


// ------------------------------------------------
// ⚠️ props 수정의 위험
// ------------------------------------------------
// props 수정 → 다른 곳에서 예기치 못한 UI 변경 발생
// 원인 추적 → 매우 어려움
// ------------------------------------------------


// ------------------------------------------------
// ⛔ 나쁜 예 vs ✅ 좋은 예
// ------------------------------------------------

// ❌ 나쁜 예 — 원본 배열을 직접 수정
products.push("Hat");

// ✅ 좋은 예 — 새로운 배열을 생성하여 반환
const updated = products.concat("Hat");
// 또는 const updated = [...products, "Hat"];


// ------------------------------------------------
// ✅ React.StrictMode
// ------------------------------------------------
// - 개발 모드에서 컴포넌트를 두 번 렌더링하여 부작용을 조기 탐지
// - 실제 빌드에서는 한 번만 렌더링됨
// ------------------------------------------------

<React.StrictMode>
  <App />
</React.StrictMode>;


// ------------------------------------------------
// ❌ 5. 전역 변수 사용으로 인한 비순수 예시
// ------------------------------------------------
// 전역 변수는 여러 컴포넌트가 동시에 접근하여 예측 불가한 상태 변경을 초래함
// ------------------------------------------------

let formData = {}; // 전역 변수 선언

function SignUpFormImpure({ initialName }) {
  formData.name = initialName; // 외부 상태 변경 ❌
  return (
    <div>
      <p>이름: {formData.name}</p>
    </div>
  );
}


// ------------------------------------------------
// ✅ 6. useState를 활용한 순수한 상태 관리
// ------------------------------------------------
// React가 제공하는 상태 훅을 사용하면 상태를 지역적으로 관리할 수 있음
// ------------------------------------------------

import { useState } from "react";

function SignUpForm({ initialName }) {
  const [name] = useState(initialName); // 지역 상태 ✅
  return (
    <div>
      <p>이름: {name}</p>
    </div>
  );
}


// ------------------------------------------------
// ✅ 7. 여러 개의 state 다루기 예시 (MultiStateExample)
// ------------------------------------------------
// 서로 다른 데이터(텍스트, 카운트)를 각각의 useState로 독립 관리
// ------------------------------------------------

function MultiStateExample() {
  const [text, setText] = useState(""); // 입력 필드 상태
  const [count, setCount] = useState(0); // 카운트 상태

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="텍스트를 입력하세요"
      />
      <p>입력한 텍스트: {text}</p>

      <p>현재 카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}


// ------------------------------------------------
// ✅ 8. 복합 상태 관리 예시 (FilterPanel)
// ------------------------------------------------
// 여러 개의 useState를 함께 사용하여 복잡한 필터 상태를 관리하는 예시
// ------------------------------------------------

function FilterPanel() {
  const [isSale, setIsSale] = useState(false); // 세일 여부
  const [category, setCategory] = useState("all"); // 카테고리
  const [minPrice, setMinPrice] = useState(0); // 최소 금액

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isSale}
          onChange={(e) => setIsSale(e.target.checked)}
        />
        세일 상품만 보기
      </label>

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">전체</option>
        <option value="clothes">의류</option>
        <option value="electronics">전자제품</option>
      </select>

      <input
        type="number"
        value={minPrice}
        onChange={(e) => setMinPrice(Number(e.target.value))}
        placeholder="최소 금액"
      />

      <p>
        현재 필터: {isSale ? "세일 상품" : "모든 상품"}, 카테고리 {category}, 최소 금액 {minPrice}원
      </p>
    </div>
  );
}


// ------------------------------------------------
// ✅ 9. useState 초기 선언 패턴
// ------------------------------------------------
// useState는 각각의 상태를 독립적으로 관리하며,
// 동일한 컴포넌트 내에서도 여러 번 호출 가능함
// ------------------------------------------------

const [isSale, setIsSale] = useState(false);
const [category, setCategory] = useState("all");
const [minPrice, setMinPrice] = useState(0);


// ------------------------------------------------
// 📘 요약 정리
// ------------------------------------------------
// 1. 순수 함수: 입력이 같으면 출력이 같고 외부 상태를 변경하지 않는다.
// 2. React 컴포넌트는 순수함을 전제로 한다.
// 3. props, 전역 변수, 원본 배열 수정(push)은 모두 비순수 행위이다.
// 4. React.StrictMode는 비순수 코드를 조기에 발견하도록 돕는다.
// 5. useState를 활용해 지역 상태로 UI 변화를 관리한다.
// 6. 여러 개의 상태는 독립된 useState로 관리할 수 있다.
// ------------------------------------------------
