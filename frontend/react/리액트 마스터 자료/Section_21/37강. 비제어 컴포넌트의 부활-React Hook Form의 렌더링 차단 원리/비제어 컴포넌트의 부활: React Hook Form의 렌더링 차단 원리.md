[실습] 37강. [Solution] 비제어 컴포넌트의 부활: React Hook Form의 렌더링 차단 원리
지난 시간 우리는 필드가 100개인 대규모 폼에서 제어 컴포넌트 방식이 얼마나 처참한 성능 지연(Lag)을 불러오는지 목격했습니다. 글자 하나를 적을 때마다 리액트 엔진의 결재를 받는 방식은 데이터 무결성은 지켜줄지언정, 브라우저의 비명은 멈추지 못했죠.

오늘은 이 고질적인 성능 문제를 해결하기 위한 첫 번째 실마리로, 리액트의 통제권을 잠시 내려놓는 비제어 컴포넌트(Uncontrolled Components)의 개념과 이를 완벽하게 다루는 도구인 React Hook Form(RHF)에 대해 깊이 있게 알아보겠습니다.

📖 상세 개념 가이드: 비제어 컴포넌트와 useRef
비제어 컴포넌트란 리액트가 입력값을 사사건건 제어하지 않고, 브라우저의 DOM 엘리먼트가 스스로 값을 들고 있게 하는 방식입니다.

이를 현실에 비유하자면 비서가 보고서를 작성할 때 매번 사장님께 물어보는 것이 아니라, 자기 책상에서 보고서를 끝까지 다 쓴 뒤에 마지막에 완성본만 사장님께 제출하는 것과 같습니다. 사장님(리액트)은 비서가 보고서를 쓰는 동안 자기 업무에만 집중할 수 있어 시스템 전체가 매우 쾌적해집니다.

💻 실습: 순수 useRef를 이용한 수동 관리 (ManualRefForm.tsx)
리액트에서 비제어 방식을 구현하는 가장 기본적인 도구는 useRef입니다. DOM 요소에 직접 '빨대'를 꽂아 필요할 때만 값을 빨아들이는 방식이죠.

/* [File Path]: src/components/ManualRefForm.tsx */
import React, { useRef } from 'react';

export default function ManualRefForm() {
  // 1. 각 필드마다 개별적인 ref를 생성합니다.
  // 필드가 100개라면 100개의 변수가 필요하므로 코드가 비대해집니다.
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 2. 제출 시점에 DOM에서 값을 직접 '추출'해야 합니다.
    const data = {
      name: nameRef.current?.value, // 직접 접근 (명령형)
      email: emailRef.current?.value,
    };

    console.log("수동 수집 데이터:", data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 3. value와 onChange 대신 ref를 직접 꽂아 리액트의 간섭을 피합니다. */}
      <input ref={nameRef} placeholder="이름" />
      <input ref={emailRef} placeholder="이메일" />
      <button type="submit">제출</button>
    </form>
  );
}

🔍 코드 동작 및 고통 포인트 분석

명령형 방식: 데이터가 필요할 때 nameRef.current?.value와 같이 직접 값을 가져오는 로직이 필요합니다. 리액트의 선언적 철학과는 거리가 멉니다.
성능 이점: 타이핑 시 리액트 상태가 변하지 않으므로 리렌더링이 0회입니다.
관리의 지옥: 필드가 늘어날수록 useRef 변수가 무수히 많아지고, 초기값 설정이나 실시간 검증을 수동으로 구현하기가 매우 까다롭습니다.
📖 상세 개념 가이드: React Hook Form의 등장과 설치
useRef의 성능은 탐나지만 수동 관리의 고통은 피하고 싶을 때 등장하는 구세주가 React Hook Form(RHF)입니다. RHF는 비제어 컴포넌트 전략을 취하면서도 개발자에게는 선언적인 인터페이스를 제공합니다.

🛠 설치 방법
프로젝트 터미널에서 아래 명령어를 실행하여 라이브러리를 설치합니다.

npm install react-hook-form
📖 상세 개념 가이드: register 함수의 마법과 구문 분석
RHF의 핵심인 register 함수는 우리가 수동으로 하던 ref 생성과 연결 과정을 자동화해 주는 도우미입니다.

1. 구문 신택스 분석: ...register("name")
이 점 세 개(...)는 전개 연산자(Spread Operator)입니다. register 함수가 반환하는 꾸러미 객체를 인풋의 속성으로 풀어헤쳐 전달합니다.

/* register 함수가 실제로 반환하는 것들의 정체 */
const { name, onChange, onBlur, ref } = register("firstName");

// 따라서 아래 두 코드는 완벽히 동일하게 동작합니다.
// <input name={name} onChange={onChange} onBlur={onBlur} ref={ref} />
<input {...register("firstName")} />

2. 동작 방식
사용자가 타이핑할 때 RHF는 내부적으로 값을 추적하지만, 이를 리액트의 state로 관리하지 않습니다. 대신 브라우저 네이티브 이벤트를 활용하여 메모리 내에서만 값을 유지하다가, 필요할 때만(제출 등) 해당 값을 취합합니다.

💻 실습: 스마트한 폼 관리 (SmartForm.tsx)
이제 타입스크립트의 안정성을 더해 React Hook Form을 제대로 활용해 보겠습니다.

/* [File Path]: src/components/SmartForm.tsx */
import React from 'react';
// SubmitHandler는 '값'이 아니라 '타입'이므로 'type' 키워드를 붙여 수입합니다.
import { useForm, type SubmitHandler } from 'react-hook-form';

// 1. [TypeScript] 폼 데이터의 설계도를 정의합니다.
interface FormInputs {
  firstName: string;
  email: string;
  age: number;
}

export default function SmartForm() {
  // 2. [useForm] RHF 엔진 가동
  // 제네릭 <FormInputs>를 통해 필드 이름 오타를 방지합니다.
  const { register, handleSubmit } = useForm<FormInputs>();

  // 3. [SubmitHandler] 데이터 수신 핸들러
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    // 수동으로 DOM을 뒤질 필요 없이 완성된 객체를 즉시 받습니다.
    console.log("최종 데이터:", data);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>React Hook Form: 제로-렉 시스템</h1>

      {/* 4. [handleSubmit] 고차 함수 
          기본 이벤트를 막고, 검증 성공 시에만 onSubmit을 실행합니다. */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* register가 내부적으로 ref와 이벤트를 자동으로 꽂아줍니다. */}
        <input {...register("firstName")} placeholder="성함" />
        <input {...register("email")} placeholder="이메일" />
        <input type="number" {...register("age")} placeholder="나이" />

        <button type="submit">데이터 제출</button>
      </form>
    </div>
  );
}
📖 RHF 핵심 메서드 및 구문 동작 정리
useForm<T>()

역할: RHF 엔진 초기화 및 컨트롤러 생성.
상세 동작: 폼의 상태, 유효성, 제출 로직을 총괄하는 객체(register, handleSubmit 등)를 반환합니다.
register(name, options)

역할: 인풋 엘리먼트 등록 및 구독.
상세 동작: 인풋 엘리먼트를 비제어 방식으로 연결하고 필요한 검증 규칙을 주입합니다.
handleSubmit(fn)

역할: 제출 매니저 및 밸리데이터.
상세 동작: 브라우저 기본 동작을 차단하고 유효성 검사를 선행한 뒤, 통과 시에만 사용자 정의 함수(fn)를 호출합니다.
SubmitHandler<T>

역할: 타입스크립트 타입 추론 보조.
상세 동작:onSubmit 함수의 매개변수 data에 자동 타입 추론을 제공하여 런타임 에러를 방지합니다.
... (Spread Operator)

역할: 속성 자동 주입.
상세 동작:register가 생성한 name, ref, onChange, onBlur 등을 엘리먼트에 즉시 꽂아줍니다.
