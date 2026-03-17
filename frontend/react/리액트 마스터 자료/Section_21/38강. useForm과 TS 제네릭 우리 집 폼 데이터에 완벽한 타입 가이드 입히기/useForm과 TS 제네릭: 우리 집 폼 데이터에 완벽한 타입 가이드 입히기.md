[실습] 38강. useForm과 TS 제네릭: 우리 집 폼 데이터에 완벽한 타입 가이드 입히기
지난 시간 우리는 React Hook Form(RHF)이라는 강력한 엔진을 통해 성능 문제를 해결했습니다. 이제는 그 엔진 위에 타입스크립트 제네릭(Generics)이라는 정교한 내비게이션을 얹을 차례입니다.

필드 이름을 잘못 적는 사소한 오타가 런타임 에러로 이어지는 비극을 막기 위해, 오늘은 런타임 에러가 원천 차단된 무결점 폼 설계를 완성해 보겠습니다. 실행 가능한 모든 파일 코드와 함께 정밀 분석을 시작합니다!

🏗️ 1. RHF 핵심 도구 정밀 해부: 엔진의 내부 동작
본격적인 코드 작성에 앞서, 우리가 사용할 도구들이 타입스크립트와 만나 어떻게 동작하는지 그 순서를 명확히 짚고 넘어갑니다.

📍 useForm<TFieldValues>: 폼의 관제탑
useForm은 폼의 모든 상태를 총괄합니다. 제네릭 <T>를 통해 폼의 '모양'을 결정하는 것이 핵심입니다.

동작 순서:
계약 체결:<UserProfileForm> 제네릭을 받는 순간, 내부의 모든 함수(register, watch 등)는 이 타입에 종속됩니다.
메모리 할당:defaultValues를 기반으로 리액트 상태와 독립적인 내부 저장소를 구성합니다.
검증 준비:mode: 'onChange' 설정에 따라 실시간 감시 리스너를 활성화합니다.
📍 register: 인풋과 엔진의 연결 고리
register는 단순한 함수 호출이 아니라 인풋 엘리먼트에게 **'행동 지침'**을 하달하는 행위입니다.

동작 순서:
매핑:register("userName") 호출 시, 타입스크립트는 해당 문자열이 인터페이스에 존재하는지 검사합니다.
객체 반환:{ name, onChange, onBlur, ref } 꾸러미를 반환합니다.
구독: 전개 연산자(...)를 통해 인풋에 주입되면, RHF 엔진이 해당 DOM의 제어권을 확보합니다.
📍 handleSubmit: 데이터의 최종 파수꾼
우리가 만든 onSave 함수를 보호하는 **고차 함수(Higher-Order Function)**입니다.

동작 순서:
방어: 제출 클릭 시 e.preventDefault()를 자동 실행하여 새로고침을 막습니다.
검문: 등록된 모든 유효성 규칙을 전수 조사합니다.
승인: 오직 모든 데이터가 'Pass'일 때만, 정제된 data를 담아 onSave를 호출합니다.
💻 2. 최종 실행 가능한 전체 코드 구성
이제 프로젝트 구조에 맞춰 바로 실행할 수 있는 코드를 작성합니다.

📄 [File 1]: src/types/form.ts (타입 정의)
먼저 폼의 설계도를 정의합니다. 중첩된 객체 구조를 포함하여 타입 추론의 강력함을 확인해 봅니다.

export interface UserProfileForm {
  userName: string;
  userEmail: string;
  userAge: number;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}
💡 코드 상세 설명 및 배경

배경: 대규모 프로젝트에서 폼 데이터는 단순히 1단계 구조가 아니라 preferences처럼 중첩된 객체(Nested Object) 형태인 경우가 많습니다.
동작 원리: TS 인터페이스로 구조를 선언하면, 나중에 register("preferences.theme")와 같이 점 표기법을 쓸 때 IDE가 해당 경로에 어떤 타입이 와야 하는지 완벽히 추적합니다.
실무 팁:theme와 같이 고정된 값은 string 대신 **유니온 타입('light' | 'dark')**을 사용하세요. 오타를 원천 봉쇄할 수 있습니다.
📄 [File 2]: src/components/TypedForm.tsx (핵심 컴포넌트)
제네릭과 점 표기법(Dot Notation)이 적용된 메인 폼입니다.

import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { UserProfileForm } from '../types/form';

export default function TypedForm() {
  // 1. useForm에 제네릭을 주입하여 'UserProfileForm' 규격을 강제합니다.
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UserProfileForm>({
    defaultValues: {
      userName: "",
      userEmail: "",
      userAge: 20,
      preferences: { theme: 'light', notifications: true }
    },
    mode: 'onChange' // 실시간 검증 모드
  });

  // 2. SubmitHandler 타입을 사용하여 data 파라미터의 타입을 자동 추론합니다.
  const onSave: SubmitHandler<UserProfileForm> = (data) => {
    console.log("✅ 검증 완료된 안전한 데이터:", data);
    alert(`${data.userName}님의 설정이 저장되었습니다!`);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>무결점 타입 폼 시스템</h2>
      <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        {/* userName이 UserProfileForm에 없으면 여기서 바로 빨간 줄이 뜹니다. */}
        <input {...register("userName")} placeholder="성함 (오타 시 에러)" />
        <input {...register("userEmail")} placeholder="이메일 주소" />
        <input type="number" {...register("userAge")} placeholder="나이" />

        <fieldset style={{ padding: '10px', borderRadius: '5px' }}>
          <legend>환경 설정 (중첩 구조)</legend>
          {/* 점 표기법을 통해 깊은 곳의 타입까지 완벽하게 추론합니다. */}
          <select {...register("preferences.theme")}>
            <option value="light">라이트 모드</option>
            <option value="dark">다크 모드</option>
          </select>
          <br />
          <label>
            <input type="checkbox" {...register("preferences.notifications")} /> 알림 수신 동의
          </label>
        </fieldset>

        <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}>
          안전하게 저장하기
        </button>
      </form>
    </div>
  );
}
💡 코드 상세 설명 및 배경

배경: 실무에서는 수십 개의 인풋 필드를 다룹니다. register의 인자로 문자열을 직접 넣을 때 오타가 나면 찾기가 매우 힘듭니다.
동작 원리: > * useForm<UserProfileForm>: 폼의 '틀'을 정의합니다. 이제 이 폼 내의 모든 데이터는 UserProfileForm 규격을 따라야 합니다.
SubmitHandler<T>: 제출 함수(onSave)의 인자인 data가 자동으로 우리 인터페이스 타입으로 지정됩니다. 별도의 타입 단언(as ...)이 필요 없습니다.
상세 설명:...register("preferences.theme") 부분에 주목하세요. RHF는 문자열로 경로를 추적하지만, TS 제네릭 덕분에 theme에 'light'나 'dark'가 아닌 다른 값이 들어오는 것을 방지합니다.
📄 [File 3]: src/App.tsx (루트 레이아웃)
import React from 'react';
import TypedForm from './components/TypedForm';

function App() {
  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h1>38강 실습 환경</h1>
      <TypedForm />
    </div>
  );
}

export default App;
💡 코드 상세 설명 및 배경

배경: 실제 서비스 개발 시 공통 레이아웃이나 컨테이너 내부에서 폼 컴포넌트를 호출하는 상황을 가정합니다.
동작 원리: 부모 컴포넌트인 App에서 TypedForm을 렌더링하여 독립적인 폼 모듈이 어떻게 화면에 배치되는지 보여줍니다.
📄 [File 4]: src/main.tsx (진입점)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
💡 코드 상세 설명 및 배경

배경: Vite나 Create React App 프로젝트의 표준 진입점입니다.
상세 설명:React.StrictMode는 개발 단계에서 잠재적인 문제를 찾기 위해 컴포넌트를 두 번 렌더링합니다. RHF의 비제어 방식이 스트릭트 모드에서도 얼마나 안정적으로 동작하는지 확인할 수 있습니다.
