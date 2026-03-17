[실습] 39강. [Pain] useEffect와 정규표현식으로 범벅된 가독성 제로의 검증 로직
지난 시간 우리는 타입스크립트 제네릭이라는 정교한 내비게이션을 통해 폼 데이터가 흘러갈 안전한 길을 닦았습니다. 필드 이름을 오타 없이 적고 데이터 타입을 일관되게 유지하는 법을 배우며 아키텍트로서 아주 중요한 첫 단추를 꿰었죠.

하지만 데이터의 모양(Type)이 완벽하다고 해서 그 속에 담긴 내용물 자체가 완벽한 것은 아닙니다. 이메일 형식에 골뱅이(@)가 빠져 있거나 비밀번호가 너무 짧다면, 타입이 문자열로 일치하더라도 서비스 입장에서는 가치 없는 데이터일 뿐입니다. 오늘은 리액트 기본 기능만으로 유효성 검사(Validation)를 구현할 때 마주하는 '가독성의 지옥'과 '성능의 수렁'을 파헤쳐 보겠습니다.

📖 상세 개념 가이드 1: 수동 검증의 아키텍처와 시각적 공포
가장 직관적인 검증 방식은 값이 바뀔 때마다 감시하여 에러 여부를 판단하는 것입니다. 이를 위해 우리는 useState로 에러 상태를 만들고 useEffect를 동원합니다. 여기서 첫 번째 괴물인 정규표현식(Regular Expression)을 만나게 됩니다.

💻 배경 지식: 정규표현식(Regex)이라는 암호문
정규표현식은 문자열의 패턴을 검사하는 강력한 도구이지만, 그 생김새는 마치 고대 상형문자와 같습니다.

문제점: 코드 중간에 직접 작성하는 순간, 한 달 뒤의 나 자신조차 이 코드가 무엇을 검사하는지 한참을 들여다봐야 합니다.
💻 실습: 가독성 제로의 스파게티 코드 (MessyValidationForm.tsx)
100개의 필드를 가진 폼에서 수동으로 검증 로직을 짤 때 어떤 처참한 광경이 펼쳐지는지 직접 확인해 보겠습니다.

/* [File Path]: src/components/MessyValidationForm.tsx */
import React, { useState, useEffect } from 'react';

export default function MessyValidationForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // 1. [Pain] 사용자의 입력값이 바뀔 때마다 실행되는 감시자 로직
  useEffect(() => {
    // 2. [Pain] 가독성을 파괴하는 주범인 정규표현식
    // 이 암호 같은 코드가 이메일 형식을 체크한다는 것을 한눈에 알기 어렵습니다.
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$/;

    // 3. [Pain] 실시간 검증을 위한 조건문
    if (email.length > 0 && !emailRegex.test(email)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
    } else {
      setEmailError("");
    }
    // 의존성 배열에 email을 넣어 값이 바뀔 때마다 복잡한 연산을 수행합니다.
  }, [email]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd' }}>
      <h3>수동 검증 시스템 (Messy)</h3>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일을 입력하세요"
        style={{ padding: '8px', width: '250px' }}
      />

      {/* 4. [Pain] 에러 UI 분기 처리를 위한 수동 렌더링 로직 */}
      {emailError && <p style={{ color: 'red', fontSize: '12px' }}>{emailError}</p>}
    </div>
  );
}

🔍 상세 코드 동작 분석

상태의 이원화: 데이터 상태(email)와 에러 상태(emailError)를 따로 관리해야 합니다. 필드가 100개면 200개의 상태가 컴포넌트를 점령하게 됩니다.
명령형 로직: "값이 바뀌면(useEffect) -> 검사해서(test) -> 상태를 바꿔라(setError)"라는 세세한 행동 지침을 개발자가 일일이 적어줘야 합니다.
의존성 바인딩:useEffect의 의존성 배열을 관리하는 것 자체가 스트레스가 되며, 실수로 빠뜨리면 검증이 동작하지 않는 버그가 발생합니다.
📖 상세 개념 가이드 2: 시니어 아키텍트가 느끼는 '진짜' 고통
이 코드가 단순히 "지저분하다"는 것을 넘어, 왜 고성능 앱에서 독이 되는지 기술적으로 분석해 보겠습니다.

1. 상태의 시차 (State Lag / Sync Lag)
useEffect는 리액트가 화면을 먼저 그린 다음에 실행됩니다.

UX 저하: 사용자가 오타를 낸 직후, 찰나의 순간 동안 에러가 없는 것처럼 보이다가 메시지가 툭 튀어나옵니다. 사용자에게 앱이 둔하다는 인상을 줍니다.
2. 의존성 지옥 (Dependency Hell)
비밀번호와 비밀번호 확인 필드처럼 두 필드가 서로를 참조해야 하는 경우를 생각해 보세요.

꼬이는 로직: A가 바뀌어도 B를 검사해야 하고, B가 바뀌어도 A와 대조해야 합니다. useEffect의 의존성 배열이 얽히고설키며 어느 시점에 검증이 일어나는지 추적하는 것이 불가능해집니다.
3. 폭포수 리렌더링 (Waterfall Re-rendering)
연쇄 반응: 타이핑 시 email 상태 변경으로 1차 리렌더링 -> useEffect 실행 -> emailError 상태 변경으로 2차 리렌더링.
결과: 단 한 글자를 칠 때마다 최소 두 번씩 화면이 다시 그려지며 브라우저 자원을 낭비합니다.
