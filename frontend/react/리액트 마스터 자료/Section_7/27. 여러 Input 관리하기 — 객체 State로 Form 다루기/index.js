// multi-input-with-object-state.jsx
// -------------------------------------------------------------
// 27. 여러 Input 관리하기 — 객체 State로 Form 다루기
// -------------------------------------------------------------
// 핵심 요약
// - 여러 input을 한 화면에서 관리할 때는 각각의 state를 따로 두기보다
//   “하나의 객체 state”로 묶으면 구조가 단순해지고 제출/검증/리셋이 쉬워진다.
// - 모든 input에 공통 onChange를 연결하고, name 속성으로 분기하여
//   setState({ ...prev, [name]: value }) 패턴으로 값을 덮어쓴다.
// - form onSubmit에서는 반드시 event.preventDefault()로 새로고침을 막고,
//   React의 상태 기반 흐름으로만 제출을 제어한다.
// -------------------------------------------------------------

import React, { useState } from "react";

/* -----------------------------------------------------------
 * 섹션 1. 데이터 구조 예시 (객체 하나로 묶은 Form 상태)
 *   - 이미지들 내용: name / email / age 3개의 필드를 객체 state로 관리
 * ---------------------------------------------------------*/
const initialForm = { name: "", email: "", age: "" };

/* -----------------------------------------------------------
 * 섹션 2. 공통 onChange 핸들러 (name, value 분해 + 스프레드)
 *   - 이미지: handleChange(e) → const { name, value } = e.target
 *   - setState({ ...prev, [name]: value })
 * ---------------------------------------------------------*/
function SimpleForm() {
  const [user, setUser] = useState(initialForm);

  function handleChange(e) {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert(`제출 데이터\n${JSON.stringify(user, null, 2)}`);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input
        type="text"
        name="name"
        value={user.name}
        onChange={handleChange}
        placeholder="이름"
      />
      <br />
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={handleChange}
        placeholder="이메일"
      />
      <br />
      <input
        type="number"
        name="age"
        value={user.age}
        onChange={handleChange}
        placeholder="나이"
      />
      <br />
      <button type="submit">제출</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </form>
  );
}

/* -----------------------------------------------------------
 * 섹션 3. 간단한 유효성 검사 추가 버전
 *   - 이미지: age 숫자 검사, email에 '@' 포함 여부 검사 후 alert
 * ---------------------------------------------------------*/
function ValidatedForm() {
  const [user, setUser] = useState(initialForm);

  function handleChange(e) {
    const { name, value } = e.target;

    // 간단한 유효성 검사 (이미지와 동일 로직)
    if (name === "age" && isNaN(Number(value))) {
      alert("나이는 숫자만 입력할 수 있습니다.");
      return;
    }
    if (name === "email" && !value.includes("@")) {
      alert("올바른 이메일 주소를 입력하세요.");
      return;
    }

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert(`제출 데이터\n${JSON.stringify(user, null, 2)}`);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input
        type="text"
        name="name"
        value={user.name}
        onChange={handleChange}
        placeholder="이름"
      />
      <br />
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={handleChange}
        placeholder="이메일"
      />
      <br />
      <input
        type="number"
        name="age"
        value={user.age}
        onChange={handleChange}
        placeholder="나이"
      />
      <br />
      <button type="submit">제출</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </form>
  );
}

/* -----------------------------------------------------------
 * 섹션 4. select 제어 컴포넌트 예시
 *   - 이미지: FavoriteFruit, 초기값 "apple", onChange에서 setFruit(e.target.value)
 * ---------------------------------------------------------*/
function FavoriteFruit() {
  const [fruit, setFruit] = useState("apple"); // 초기값이 곧 초기 선택 옵션

  return (
    <div style={{ marginBottom: 24 }}>
      <label>
        좋아하는 과일:&nbsp;
        <select value={fruit} onChange={(e) => setFruit(e.target.value)}>
          <option value="apple">사과</option>
          <option value="banana">바나나</option>
          <option value="cherry">체리</option>
        </select>
      </label>
      <p>선택한 과일: {fruit}</p>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 5. 데모용 루트 컴포넌트
 * ---------------------------------------------------------*/
export default function App() {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        lineHeight: 1.45,
        padding: 16,
      }}
    >
      <h2>27. 여러 Input 관리하기 — 객체 State로 Form 다루기</h2>

      <h3>섹션 1·2. 공통 onChange로 객체 상태 업데이트</h3>
      <SimpleForm />

      <h3>섹션 3. 유효성 검사 추가</h3>
      <ValidatedForm />

      <h3>섹션 4. select 제어 컴포넌트</h3>
      <FavoriteFruit />
    </div>
  );
}

/* -----------------------------------------------------------
 * 체크리스트 (요지)
 * 1) input들은 모두 value/checked를 state에 “연결”한다.
 * 2) 모든 input의 onChange는 하나로 묶고, name으로 분기한다.
 *    - setState(prev => ({ ...prev, [name]: value }))
 * 3) form 제출 시 preventDefault()로 새로고침을 막는다.
 * 4) 검증이 필요하면 onChange/Submit 시점에 조건 검사 후 업데이트/제출을 제어한다.
 * ---------------------------------------------------------*/
