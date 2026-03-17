/*
 * 🔥 React Strict Mode 강의 통합 예제
 * Description:
 *   - React.StrictMode가 어떤 역할을 하는지 단계별로 실습을 통해 이해하는 예제입니다.
 *   - 잘못된 외부 상태 변경을 감지하고, 컴포넌트의 순수성을 보장하기 위한 개발 모드 도구입니다.
 *   - 모든 예제는 실제 강의에서 사용된 코드 순서를 그대로 따릅니다.
 */

/* ------------------------------------------------------------
 * 1️⃣ index.jsx — 애플리케이션 진입점
 * ------------------------------------------------------------
 * createRoot()로 React 애플리케이션의 루트를 생성하고,
 * StrictMode로 전체 앱을 감쌉니다.
 * StrictMode는 개발 모드에서만 활성화되며,
 * 일부 함수형 컴포넌트를 의도적으로 두 번 렌더링해
 * 순수하지 않은 코드(부작용이 있는 코드)를 찾아냅니다.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/* ------------------------------------------------------------
 * 2️⃣ App.jsx — React.StrictMode 중첩 실험
 * ------------------------------------------------------------
 * App 컴포넌트 내부에서도 React.StrictMode를 감싸면,
 * 하위 컴포넌트들이 두 번 렌더링되는 것을 직접 확인할 수 있습니다.
 * 콘솔에 "Welcome Chulsoo"가 두 번 찍히는 이유가 바로 그것입니다.
 */

function Welcome({ name }) {
  console.log(`👋 Welcome ${name}`);
  return <h1>Hello, {name}</h1>;
}

export default function App() {
  return (
    <React.StrictMode>
      <Welcome name="Chulsoo" />
    </React.StrictMode>
  );
}

/* ------------------------------------------------------------
 * 3️⃣ 잘못된 예시 #1 — 외부 변수(external)를 수정하는 컴포넌트
 * ------------------------------------------------------------
 * 아래 예시는 컴포넌트가 외부 변수인 external을 직접 수정합니다.
 * React의 렌더링 모델에서 이런 식의 외부 상태 변경은 매우 위험합니다.
 * StrictMode가 활성화되면 이 컴포넌트는 두 번 실행되므로,
 * external 값이 1 → 2로 올라가며, 예상치 못한 부작용이 발생합니다.
 */

let external = 0;

function BadComponent() {
  external += 1;
  console.log("external:", external);
  return <p>{external}</p>;
}

/*
 * 출력 결과:
 *   external: 1
 *   external: 2
 *
 * 원인:
 *   StrictMode가 의도적으로 두 번 렌더링하기 때문.
 *   즉, 외부 상태에 의존하는 컴포넌트는 순수하지 않다는 경고입니다.
 */

/* ------------------------------------------------------------
 * 4️⃣ 잘못된 예시 #2 — 외부 객체(formData)를 변경하는 컴포넌트
 * ------------------------------------------------------------
 * formData라는 전역 객체를 직접 수정하고 있습니다.
 * React는 이런 외부 변경을 추적하지 못하므로,
 * StrictMode는 이 패턴을 두 번 호출하여 문제를 조기에 발견하도록 돕습니다.
 */

let formData = {};

function SignUpForm_Wrong() {
  formData.name = "홍길동";
  console.log("폼 렌더링:", formData);
  return <p>{formData.name}</p>;
}

/*
 * 출력 결과:
 *   폼 렌더링: { name: "홍길동" }
 *   폼 렌더링: { name: "홍길동" }
 *
 * 두 번 찍히는 이유:
 *   외부 객체를 수정했기 때문에 React가 이를 ‘부작용’으로 판단합니다.
 */

/* ------------------------------------------------------------
 * 5️⃣ 올바른 예시 — useState로 상태를 안전하게 관리
 * ------------------------------------------------------------
 * 이제 React 내부 상태 관리 도구인 useState를 사용합니다.
 * 이 방식은 렌더링 사이에 React가 상태를 추적할 수 있게 해 주므로,
 * StrictMode에서도 안전하며 두 번 실행되어도 값이 변하지 않습니다.
 */

import { useState } from 'react';

function SignUpForm_Correct() {
  const [name] = useState("홍길동");
  console.log("폼 렌더링:", name);
  return <p>{name}</p>;
}

/*
 * 출력 결과:
 *   폼 렌더링: 홍길동
 *   폼 렌더링: 홍길동
 *
 * StrictMode의 두 번 렌더링에도 값이 변하지 않음.
 * 즉, 상태 관리가 React 내부로 한정되어 있기 때문입니다.
 */

/* ------------------------------------------------------------
 * ✅ 요약
 * ------------------------------------------------------------
 * - React.StrictMode는 개발 모드에서 순수하지 않은 코드를 탐지합니다.
 * - 외부 변수나 객체를 직접 변경하면 StrictMode가 이를 감지해 두 번 렌더링합니다.
 * - useState, useReducer, useRef 등 React의 상태 관리 메커니즘을 사용하면
 *   이러한 부작용 없이 안정적으로 상태를 관리할 수 있습니다.
 *
 * 🔍 핵심 원리:
 *   컴포넌트는 항상 "같은 입력 → 같은 출력"을 보장해야 합니다.
 *   즉, 순수 함수처럼 동작해야 React의 Virtual DOM 비교가 예측 가능해집니다.
 */

