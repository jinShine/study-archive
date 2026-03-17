// ✅ React에서 useState 훅을 사용하는 예제 모음
// 각 예제는 서로 다른 형태의 상태(state) 관리 방식을 보여줍니다.

import { useState } from "react";

/* -------------------------------------------------------------------------- */
/*  1️⃣ MultiStateExample — 여러 개의 상태를 동시에 관리하기               */
/* -------------------------------------------------------------------------- */

function MultiStateExample() {
  // 문자열 상태: 입력창의 텍스트를 저장
  const [text, setText] = useState("");
  // 숫자 상태: 카운터 값을 저장
  const [count, setCount] = useState(0);

  return (
    <div>
      {/* 입력창: 사용자가 입력할 때마다 setText로 상태 갱신 */}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="텍스트를 입력하세요"
      />
      <p>입력한 텍스트: {text}</p>

      {/* 버튼: 클릭 시 setCount로 count를 1 증가 */}
      <p>현재 카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  2️⃣ FilterPanel — 체크박스, 드롭다운, 숫자 입력을 조합한 필터 UI 예제   */
/* -------------------------------------------------------------------------- */

function FilterPanel() {
  // 세 가지 서로 다른 형태의 상태를 선언
  const [isSale, setIsSale] = useState(false);   // boolean — 세일 여부
  const [category, setCategory] = useState("all"); // string — 선택된 카테고리
  const [minPrice, setMinPrice] = useState(0);     // number — 최소 금액

  return (
    <div>
      {/* ✅ 체크박스: 세일 상품만 보기 */}
      <label>
        <input
          type="checkbox"
          checked={isSale}
          onChange={(e) => setIsSale(e.target.checked)}
        />
        세일 상품 보기
      </label>

      {/* ✅ 셀렉트 박스: 카테고리 선택 */}
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">전체</option>
        <option value="clothes">의류</option>
        <option value="electronics">전자제품</option>
      </select>

      {/* ✅ 숫자 입력창: 최소 금액 설정 */}
      <input
        type="number"
        value={minPrice}
        onChange={(e) => setMinPrice(Number(e.target.value))}
        placeholder="최소 금액"
      />

      {/* ✅ 현재 필터 상태를 출력 */}
      <p>
        현재 필터: {isSale ? "세일 상품" : "모든 상품"}, 카테고리 {category},
        최소 금액 {minPrice}원
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  3️⃣ FilterPanel 내부의 상태 선언만 따로 보여주는 부분 (설명용 코드)     */
/* -------------------------------------------------------------------------- */

// 아래 세 줄은 FilterPanel에서 상태를 선언하는 부분만 따로 발췌한 것입니다.
// 각각의 useState는 초기값(initial state)을 갖고 있으며,
// 배열 비구조화 할당을 통해 상태값과 변경함수를 동시에 얻습니다.

const [isSale, setIsSale] = useState(false);   // 세일 여부 (true/false)
const [category, setCategory] = useState("all"); // 상품 카테고리
const [minPrice, setMinPrice] = useState(0);     // 최소 금액

/* -------------------------------------------------------------------------- */

export { MultiStateExample, FilterPanel };
