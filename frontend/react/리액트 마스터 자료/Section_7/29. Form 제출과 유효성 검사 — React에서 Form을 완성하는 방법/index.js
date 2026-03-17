// form-submit-and-validation.jsx
// -------------------------------------------------------------
// 29. Form 제출과 유효성 검사 — React에서 Form을 완성하는 방법
// -------------------------------------------------------------
// 핵심 요약
// - Form 제출은 onSubmit에서 event.preventDefault()로 새로고침을 막고,
//   “state에 담긴 값들”을 기반으로 처리한다.
// - input/checkbox는 제어 컴포넌트(value/checked ↔ state)로 연결한다.
// - 최소 유효성 검사(공백 제거, 이메일 형식 등)를 통과하지 못하면
//   setError로 메시지를 표시하고 즉시 return하여 제출을 중단한다.
// -------------------------------------------------------------

import React, { useState } from "react";

/* -----------------------------------------------------------
 * 섹션 1. 기본 제출 흐름 (이미지 1의 의도 반영)
 *   - username / email / agree 세 개의 상태
 *   - onSubmit → preventDefault → 로그/알럿
 * ---------------------------------------------------------*/
function BasicSignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);

  function handleSubmit(e) {
    e.preventDefault(); // 페이지 새로고침 방지
    console.log("제출 데이터:", { username, email, agree });
    alert(`${username}님, 가입이 완료되었습니다!`);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
      <input
        type="text"
        placeholder="사용자 이름"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <label>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        &nbsp;개인정보 수집·이용에 동의합니다.
      </label>
      <br />
      <button type="submit">가입하기</button>
    </form>
  );
}

/* -----------------------------------------------------------
 * 섹션 2. 유효성 검사 추가 (이미지 2의 로직 그대로 코드화)
 *   - username 공백 금지, email에 '@' 포함 여부 확인
 *   - 실패 시 setError(...) 후 즉시 return; (제출 중단)
 *   - 성공 시 setError("") 초기화 + 알럿
 * ---------------------------------------------------------*/
function ValidatedSignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (username.trim() === "") {
      setError("사용자 이름을 입력하세요.");
      return; // 제출 중단
    }
    if (!email.includes("@")) {
      setError("올바른 이메일을 입력하세요.");
      return; // 제출 중단
    }
    if (!agree) {
      setError("약관에 동의해야 가입할 수 있습니다.");
      return; // 제출 중단
    }

    setError(""); // 에러 초기화
    alert("제출 성공!");
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
      <input
        type="text"
        placeholder="사용자 이름"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-invalid={error.includes("이름") ? "true" : "false"}
      />
      <br />
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={error.includes("이메일") ? "true" : "false"}
      />
      <br />
      <label>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        &nbsp;개인정보 수집·이용에 동의합니다.
      </label>

      {error && (
        <p style={{ color: "crimson", margin: "8px 0 0" }} role="alert">
          {error}
        </p>
      )}

      <div style={{ marginTop: 10 }}>
        <button type="submit">가입하기</button>
      </div>
    </form>
  );
}

/* -----------------------------------------------------------
 * 섹션 3. UX 보강 스니펫
 *   - 입력 변경 시 해당 오류만 즉시 해제하는 패턴
 * ---------------------------------------------------------*/
function useLiveFieldClear(error, setError) {
  return (fieldName) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (error) {
      if (fieldName === "username" && v.toString().trim() !== "") setError("");
      if (fieldName === "email" && v.toString().includes("@")) setError("");
      if (fieldName === "agree" && v === true) setError("");
    }
    return v;
  };
}

/* -----------------------------------------------------------
 * 섹션 4. 라이브 에러 해제 적용 예시(선택)
 * ---------------------------------------------------------*/
function LiveClearForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  const onFieldInput = useLiveFieldClear(error, setError);

  function handleSubmit(e) {
    e.preventDefault();

    if (username.trim() === "") return setError("사용자 이름을 입력하세요.");
    if (!email.includes("@")) return setError("올바른 이메일을 입력하세요.");
    if (!agree) return setError("약관에 동의해야 가입할 수 있습니다.");

    setError("");
    alert("제출 성공!");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="사용자 이름"
        value={username}
        onChange={(e) => setUsername(onFieldInput("username")(e))}
      />
      <br />
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(onFieldInput("email")(e))}
      />
      <br />
      <label>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(onFieldInput("agree")(e))}
        />
        &nbsp;개인정보 수집·이용에 동의합니다.
      </label>

      {error && (
        <p style={{ color: "crimson", margin: "8px 0 0" }} role="alert">
          {error}
        </p>
      )}
      <div style={{ marginTop: 10 }}>
        <button type="submit">가입하기</button>
      </div>
    </form>
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
      <h2>29. Form 제출과 유효성 검사 — React에서 Form을 완성하는 방법</h2>

      <h3>섹션 1. 기본 제출 흐름</h3>
      <BasicSignupForm />

      <h3>섹션 2. 유효성 검사 추가</h3>
      <ValidatedSignupForm />

      <h3>섹션 4. (선택) 입력 시 오류 자동 해제</h3>
      <LiveClearForm />
    </div>
  );
}

/* -----------------------------------------------------------
 * 체크리스트
 * 1) 제어 컴포넌트: value/checked ↔ state, onChange → setState.
 * 2) onSubmit에서 e.preventDefault() 필수.
 * 3) 검증 실패 시 setError 후 즉시 return; (중복 제출/부하 방지).
 * 4) 성공 시 오류 초기화 후 처리(알럿, API 요청 등) 진행.
 * -----------------------------------------------------------*/
