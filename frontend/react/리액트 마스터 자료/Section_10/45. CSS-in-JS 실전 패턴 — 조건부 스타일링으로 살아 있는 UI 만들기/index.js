/*
========================================================
📘 45강. CSS-in-JS 실전 패턴 — 조건부 스타일링으로 살아 있는 UI 만들기
========================================================
이번 강의에서는 styled-components를 활용해
실제 서비스 수준의 “살아 있는” 스타일을 구현합니다.
props, state, media query, theme 등을 통해
동적으로 반응하는 UI를 만드는 것이 핵심입니다.
========================================================
*/


// ------------------------------------------------------
// ✅ 1. Button.js — variant, size에 따른 조건부 스타일
// ------------------------------------------------------

import styled from "styled-components";

const Button = styled.button`
  background: ${({ variant }) =>
    variant === "primary"
      ? "royalblue"
      : variant === "danger"
      ? "crimson"
      : "gray"};

  color: white;
  border: none;
  border-radius: 8px;
  padding: ${({ size }) => (size === "lg" ? "14px 18px" : "10px 14px")};
  font-size: ${({ size }) => (size === "lg" ? "16px" : "14px")};
  cursor: pointer;
`;

export default function App() {
  return (
    <>
      <Button variant="primary" size="lg">저장</Button>
      <Button variant="danger">삭제</Button>
      <Button>기본</Button>
    </>
  );
}

/*
📘 설명:
- `variant` prop에 따라 색상이 동적으로 결정됩니다.
  → "primary" → royalblue, "danger" → crimson, 그 외 → gray
- `size` prop으로 버튼 크기와 폰트 크기를 조절합니다.
  → "lg"이면 여유 있는 크기, 기본은 compact하게 렌더링
*/


// ------------------------------------------------------
// ✅ 2. ToggleDemo.js — 상태(state)에 따른 스타일 변화
// ------------------------------------------------------

import { useState } from "react";
import styled from "styled-components";

const Toggle = styled.button`
  background: ${({ active }) => (active ? "seagreen" : "gray")};
  color: white;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

export default function ToggleDemo() {
  const [on, setOn] = useState(false);

  return (
    <Toggle active={on} onClick={() => setOn((v) => !v)}>
      {on ? "ON" : "OFF"}
    </Toggle>
  );
}

/*
📘 설명:
- React의 useState를 활용해 클릭할 때마다 배경색을 바꿉니다.
- active가 true면 seagreen, false면 gray.
- 스타일과 상태(state)가 직접 연결되는 패턴을 체험할 수 있습니다.
*/


// ------------------------------------------------------
// ✅ 3. Action.js — hover / active 상태 스타일링
// ------------------------------------------------------

import styled from "styled-components";

const Action = styled.button`
  background: steelblue;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 12px;
  cursor: pointer;

  &:hover {
    background: dodgerblue; /* 마우스를 올렸을 때 */
  }

  &:active {
    background: navy;        /* 클릭 순간 */
    transform: scale(0.97);  /* 살짝 눌리는 듯한 시각적 효과 */
  }
`;

export default function App() {
  return <Action>저장</Action>;
}

/*
📘 설명:
- CSS의 &:hover, &:active를 그대로 styled-components 내부에서 사용 가능.
- 사용자가 상호작용할 때 즉각적인 피드백을 주는 인터랙션 디자인 구현.
*/


// ------------------------------------------------------
// ✅ 4. Card.js — 반응형 스타일 (media query)
// ------------------------------------------------------

import styled from "styled-components";

const Card = styled.div`
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

export default function App() {
  return <Card>반응형 카드</Card>;
}

/*
📘 설명:
- CSS 미디어쿼리도 문자열 리터럴 내부에서 그대로 작성 가능.
- 화면 너비가 480px 이하일 때 padding과 radius 자동 조정.
- 별도의 CSS 파일 없이 JS에서 완전한 반응형 디자인 작성 가능.
*/


// ------------------------------------------------------
// ✅ 5. ThemedApp.js — ThemeProvider로 다크모드 구현
// ------------------------------------------------------

import styled, { ThemeProvider } from "styled-components";

const light = { bg: "#ffffff", fg: "#111111" };
const dark = { bg: "#111111", fg: "#ffffff" };

const Page = styled.div`
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.fg};
  min-height: 100vh;
  padding: 24px;
`;

export default function ThemedApp({ darkMode }) {
  return (
    <ThemeProvider theme={darkMode ? dark : light}>
      <Page>테마에 따라 배경과 글자색이 달라집니다.</Page>
    </ThemeProvider>
  );
}

/*
📘 설명:
- ThemeProvider를 통해 모든 하위 컴포넌트에서 theme 객체 접근 가능.
- props로 darkMode를 넘기면 전역 테마를 한 번에 교체할 수 있음.
- 실제 서비스 다크모드 구현 시 기본 구조와 동일.
*/


// ------------------------------------------------------
// ✅ 핵심 요약
// ------------------------------------------------------
/*
1️⃣ props 기반 스타일링 → variant, size, active 등으로 UI 제어
2️⃣ 상태(state) 기반 스타일링 → useState로 즉각 반응하는 색상/텍스트
3️⃣ Pseudo-class(:hover, :active) → 상호작용에 반응하는 피드백 효과
4️⃣ 미디어쿼리 → 화면 크기에 따라 자동 조정되는 반응형 UI
5️⃣ ThemeProvider → 다크/라이트 테마 전환 구조 완성

이로써 styled-components의 모든 핵심 실전 패턴을 익히게 됩니다.
*/

