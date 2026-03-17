// 31. useEffect 케이스 1 — 두 번째 인자를 주지 않았을 때: 모든 렌더링 직후 실행
// ---------------------------------------------------------------------------------

// [핵심 개념 요약]
// - 의존성 배열(두 번째 인자)을 생략하면 컴포넌트가 “렌더링될 때마다” Effect가 실행됩니다.
//   (mount 직후 + 모든 re-render 직후)
// - Effect는 커밋(실제 DOM 반영) “이후”에 실행됩니다. → 화면이 먼저 그려지고, 그 다음에 Effect.
// - Cleanup은 (a) 다음 Effect가 실행되기 “직전” 한 번, (b) 컴포넌트 unmount 시 한 번 실행됩니다.
// - React 18 개발모드에서 <StrictMode>가 켜져 있으면 mount→unmount→재-mount가 한 번 더 일어나
//   Effect/Cleanup 로그가 “두 번씩” 보일 수 있습니다(의도적 스트레스 테스트). 배포(build)에서는 한 번.
// - 의존성 배열이 없으면 렌더링이 자주 일어나는 경우(입력 타이핑 등) Effect도 매번 실행되므로,
//   네트워크 요청·타이머 등록 같은 “비용 큰 작업”을 여기서 바로 하지 않도록 주의가 필요합니다.
//   (정말 필요하다면 abort/cleanup으로 이전 작업을 정리하거나, 의존성을 명확히 지정하세요.)

import React, { useState, useEffect } from "react";

/* -----------------------------------------------------------
 * 1️⃣ 기본 구조 — 두 번째 인자 없음
 *   - “대괄호 []조차 없음”이 포인트. 모든 렌더링 직후 실행됩니다.
 *   - 아래 예제는 독립 실행 가능한 컴포넌트로 구성하여 훅 규칙을 지킵니다.
 * ---------------------------------------------------------*/
function BasicNoDeps() {
  useEffect(() => {
    // 실행할 코드
    // 두 번째 인자 없음 = 대괄호 []조차 없음
    // ✔ 렌더링(=상태 변경으로 인한 re-render 포함) 직후마다 실행
    // ✔ 커밋 이후 실행(화면이 먼저 그려지고 effect가 나중에)
  }); // ← 의존성 배열 생략

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>기본 구조(의존성 배열 없음)</h3>
      <p>모든 렌더링 직후 실행되는 패턴의 최소 형태</p>
    </div>
  );
}

/* -----------------------------------------------------------
 * 2️⃣ Counter 예제 — 모든 렌더링마다 실행
 *   - count가 바뀔 때마다 re-render → effect도 매번 실행
 *   - 로그를 통해 실행 타이밍을 눈으로 확인
 * ---------------------------------------------------------*/
function CounterExample1() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("useEffect 실행: 현재 count =", count);
    // 주의) 여기서 setCount를 무분별하게 호출하면 무한 루프!
    //   - setState → render → effect → setState … 반복
    //   - 꼭 필요한 조건에서만 상태 갱신을 수행하세요.
  }); // 의존성 배열 없음 ⇒ 매 렌더마다 실행

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>예제 1. 모든 렌더링마다 실행</h3>
      <p>현재 카운트: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 3️⃣ Cleanup 포함 예제
 *   - Cleanup은 “다음 effect가 실행되기 직전”과 “unmount 시” 호출
 *   - 시각적으로는: [Effect 실행] → (상태 변경) → [Cleanup 실행] → [다음 Effect 실행]
 * ---------------------------------------------------------*/
function CounterExample2() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Effect 실행");

    return () => {
      console.log("Cleanup 실행");
      // 여기에서 이벤트 리스너 해제, 구독 취소, 타이머 clear 등 “자원 정리” 수행
      // (메모리 누수/중복 구독 방지)
    };
  }); // 의존성 배열 없음 ⇒ 매 렌더마다 실행, 그 직전마다 cleanup

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>예제 2. Cleanup 포함 (Effect + Cleanup)</h3>
      <p>현재 카운트: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 4️⃣ 타이머 예제 — setInterval과 Cleanup
 *   - 의존성 배열이 없으므로 렌더링 때마다 새로운 interval이 생성됩니다.
 *   - 반드시 cleanup에서 이전 interval을 clear하여 중복 실행을 막아야 합니다.
 *   - 패턴: effect 내 등록 → cleanup에서 해제
 * ---------------------------------------------------------*/
function TimerExample() {
  useEffect(() => {
    const id = setInterval(() => {
      console.log("타이머 동작 중");
    }, 1000);

    return () => {
      clearInterval(id); // 다시 실행되기 전 기존 타이머 정리
    };
  }); // 매 렌더마다 새 interval 등록 → 직전 cleanup으로 기존 interval 해제

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>예제 3. setInterval과 Cleanup</h3>
      <p>콘솔에서 타이머 로그와 cleanup 타이밍을 함께 확인하세요.</p>
    </div>
  );
}

/* -----------------------------------------------------------
 * 5️⃣ 단순 Effect/Cleanup 로그 예제
 *   - 가장 미니멀한 형태. 실행 순서를 익히기에 적합
 * ---------------------------------------------------------*/
function SimpleEffectExample() {
  useEffect(() => {
    console.log("Effect 실행");

    return () => {
      console.log("Cleanup 실행");
    };
  }); // 매 렌더마다 effect/cleanup 순환

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>예제 4. 가장 단순한 Effect + Cleanup 구조</h3>
      <p>렌더링 → Effect, 재렌더/언마운트 직전 → Cleanup</p>
    </div>
  );
}

/* -----------------------------------------------------------
 * 6️⃣ 메인 컴포넌트
 *   - 학습 포인트
 *     1) “의존성 배열 없음”이면 렌더가 날 때마다 effect가 돈다.
 *     2) cleanup은 “다음 effect 직전”과 “unmount 시”.
 *     3) StrictMode 개발모드에선 effect/cleanup이 두 번 보일 수 있다.
 *     4) 무거운 작업은 의존성 배열을 명시하거나(빈 배열/특정 값),
 *        abort/cleanup으로 정리하는 안전장치를 두자.
 * ---------------------------------------------------------*/
export default function App() {
  return (
    <div style={{ fontFamily: "ui-monospace, Menlo, monospace", padding: 20 }}>
      <h2>31강. useEffect 케이스 1 — 두 번째 인자를 주지 않았을 때</h2>
      <p style={{ marginBottom: 16 }}>
        모든 렌더링 직후 Effect가 실행되는 동작을 예제로 확인해보세요.
      </p>

      <BasicNoDeps />
      <CounterExample1 />
      <CounterExample2 />
      <TimerExample />
      <SimpleEffectExample />
    </div>
  );
}
