// L26-ControlledInput.jsx
// 26. 단일 Input Form 다루기 — 제어 컴포넌트의 첫걸음
// - 모든 코드를 그대로 유지하면서 23, 24, 25강과 동일한 단일 파일 구조
// - App()에서 각 데모 컴포넌트 렌더

import React, { useState } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   (비교용) 전통적인 HTML Form 마크업 예시
---------------------------------------------------------------------------
<form action="/submit" method="post">
  <!-- 사용자 입력을 받는 input -->
  <label for="username">이름:</label>
  <input type="text" id="username" name="username" required />

  <!-- 제출 버튼 -->
  <button type="submit">제출</button>
</form>
--------------------------------------------------------------------------- */

/* ========================================================================
 * Demo 1) ControlledForm
 * - useState, handleChange, handleSubmit, preventDefault, alert
 * ====================================================================== */
function ControlledForm() {
  const [name, setName] = useState("");

  function handleChange(event) {
    setName(event.target.value); // 입력값이 바뀔 때마다 state 업데이트
  }

  // form 제출 시 state를 사용
  function handleSubmit(event) {
    event.preventDefault();
    alert(`제출된 이름: ${name}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">이름:</label>
      {/* input의 value가 state와 연결되어 있음 */}
      <input
        id="name"
        type="text"
        value={name}
        onChange={handleChange}
      />
      <button type="submit">제출</button>
    </form>
  );
}

/* ========================================================================
 * Demo 2) 최대 길이 제한이 있는 제어 입력
 * - 이미지(코드 블록) 그대로: onChange 내부에서 길이 체크 후 setName
 * - placeholder="이름(최대 10자)"
 * ====================================================================== */
function LimitedInputForm() {
  const [name, setName] = useState("");

  return (
    <div>
      <label htmlFor="limitName">이름(최대 10자): </label>
      <input
        id="limitName"
        type="text"
        value={name}
        onChange={(e) => {
          if (e.target.value.length <= 10) {
            setName(e.target.value);
          }
        }}
        placeholder="이름(최대 10자)"
      />
      <p>현재 길이: {name.length} / 10</p>
    </div>
  );
}

/* ========================================================================
 * App() — 23·24·25강과 동일한 구조로, 한 파일에서 데모들을 렌더
 * ====================================================================== */
export default function App() {
  return (
    <div style={{ padding: 16, lineHeight: 1.6 }}>
      <h2>26. 단일 Input Form 다루기 — 제어 컴포넌트의 첫걸음</h2>

      <section style={{ marginTop: 12 }}>
        <h3>① 기본 제어 Form (ControlledForm)</h3>
        <ControlledForm />
      </section>

      <hr style={{ margin: "24px 0" }} />

      <section>
        <h3>② 길이 제한 제어 Input (최대 10자)</h3>
        <LimitedInputForm />
      </section>
    </div>
  );
}
