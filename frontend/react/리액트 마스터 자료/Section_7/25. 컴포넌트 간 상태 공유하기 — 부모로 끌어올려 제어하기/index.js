// lesson25.js — 25. 컴포넌트 간 상태 공유하기 — 부모로 끌어올려 제어하기

import React, { useState } from "react";
import { createRoot } from "react-dom/client";

/* ──────────────────────────────────────────────────────────────
   예제 A) 체크박스 ↔ 요약
   - 상태의 단일 소유자: App
   - 자식은 props로 상태/업데이터를 받아 ‘제어 컴포넌트’가 됨
   ────────────────────────────────────────────────────────────── */
function Checkbox({ checked, setChecked }) {
  return (
    <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      알림 받기
    </label>
  );
}

function Summary({ checked }) {
  return (
    <p style={{ margin: "8px 0 0 0" }}>
      {checked ? "알림을 받습니다." : "알림을 받지 않습니다."}
    </p>
  );
}

/* ──────────────────────────────────────────────────────────────
   예제 B) 제목 입력 ↔ 미리보기
   - 상태의 단일 소유자: App
   - 입력과 표시가 서로 다른 자식으로 나뉘어 있어도
     부모가 소유한 같은 state를 공유
   ────────────────────────────────────────────────────────────── */
function TitleInput({ title, setTitle }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
      />
    </div>
  );
}

function Preview({ title }) {
  return (
    <div style={{ marginTop: 8 }}>
      <h3>미리보기</h3>
      <p>{title || "제목이 없습니다."}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   App: 23/24강과 동일한 “단일 파일 멀티 데모” 구성
   - 모든 상태는 App이 단일 소유
   - 각 섹션은 독립 데모처럼 렌더링
   ────────────────────────────────────────────────────────────── */
function App() {
  // 예제 A 상태
  const [checked, setChecked] = useState(false);
  // 예제 B 상태
  const [title, setTitle] = useState("");

  return (
    <div
      style={{
        fontFamily: "ui-sans-serif, system-ui",
        padding: 20,
        display: "grid",
        gap: 24,
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      {/* 예제 A: 체크박스 ↔ 요약 */}
      <section
        style={{
          padding: 16,
          border: "1px solid #2c2c2c",
          borderRadius: 10,
          background: "#0b0b0b",
        }}
      >
        <h2 style={{ marginTop: 0 }}>예제 A — 체크박스/요약 (Lifting State Up)</h2>
        <Checkbox checked={checked} setChecked={setChecked} />
        <Summary checked={checked} />
      </section>

      {/* 예제 B: 제목 입력 ↔ 미리보기 */}
      <section
        style={{
          padding: 16,
          border: "1px solid #2c2c2c",
          borderRadius: 10,
          background: "#0b0b0b",
        }}
      >
        <h2 style={{ marginTop: 0 }}>예제 B — 제목 입력/미리보기 (Lifting State Up)</h2>
        <TitleInput title={title} setTitle={setTitle} />
        <Preview title={title} />
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   부트스트랩
   ────────────────────────────────────────────────────────────── */
const rootEl = document.getElementById("root");
createRoot(rootEl).render(<App />);
