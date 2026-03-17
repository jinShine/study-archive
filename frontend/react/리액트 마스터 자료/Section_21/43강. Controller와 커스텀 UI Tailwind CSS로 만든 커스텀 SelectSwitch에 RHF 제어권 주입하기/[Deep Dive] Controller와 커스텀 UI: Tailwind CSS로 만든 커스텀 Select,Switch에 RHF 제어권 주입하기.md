[실습] 43강. [Deep Dive] Controller와 커스텀 UI: Tailwind CSS로 만든 커스텀 Select/Switch에 RHF 제어권 주입하기
지난 시간 우리는 register 함수가 이름표(name), 통로(ref), 핸들러(onChange)라는 부품들을 표준 HTML 엘리먼트에 어떻게 자동으로 전파하는지 파헤쳐 보았습니다.

표준 태그(input, select 등)를 사용할 때는 register 하나만으로 충분했지만, 실무의 세계는 그리 녹록지 않습니다. 2026년 현재, 우리는 더 이상 투박한 표준 인풋만을 사용하지 않기 때문입니다. Tailwind CSS v4로 직접 디자인한 토글 스위치나 Ant Design, MUI 같은 외부 라이브러리의 복잡한 컴포넌트를 써야 할 때, 우리는 register라는 멀티탭과 커스텀 컴포넌트라는 플러그의 규격이 맞지 않는 상황을 마주하게 됩니다. 오늘은 이 규격 차이를 완벽하게 메워주는 만능 어댑터, Controller를 세밀하게 분석해 보겠습니다.

🛠️ 0. TypeScript & Tailwind v4 세팅
실무에서 가장 먼저 마주하게 될 프로젝트 초기화 및 최신 라이브러리 세팅 가이드입니다.

📍 1단계: 프로젝트 생성 및 필수 의존성 설치
최신 Vite 6 엔진을 사용하여 프로젝트를 시작합니다.

# 1. Vite 6 기반 React + TypeScript 프로젝트 생성
npm create vite@latest my-2026-form -- --template react-ts
cd my-2026-form

# 2. 핵심 라이브러리 설치 (2026년 1월 기준 최신 버전)
npm install react-hook-form zod @hookform/resolvers

# 3. Tailwind CSS v4 설치 (v4는 엔진 자체가 통합되어 설정이 더 간소화되었습니다)
npm install tailwindcss @tailwindcss/vite
📍 2단계: 최신 아키텍처 설정 (Vite + Tailwind v4)
2026년의 Tailwind v4는 별도의 tailwind.config.js 없이 Vite 플러그인과 CSS 파일만으로 동작합니다.

vite.config.ts 수정:
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
src/index.css 수정:
/* v4에서는 이 한 줄로 모든 레이어와 유틸리티가 로드됩니다 */
@import "tailwindcss";
🏗️ 1. 배경: 왜 커스텀 UI에는 register를 쓸 수 없을까?
표준 인풋(input, select)은 브라우저가 제공하는 e.target.value라는 정형화된 데이터 객체를 뱉어냅니다. 하지만 커스텀 UI는 내부 구조가 div나 button으로 되어 있어 ref를 직접 전달받지 못하거나, 값이 변했을 때 객체가 아닌 순수한 값(true/false, number)만 내뱉는 경우가 많습니다.

/* [Pain Point]: register를 사용할 수 없는 전형적인 상황 */
const MyCustomInput = ({ value, onChange }) => (
  // 이 컴포넌트는 'e' 객체가 아니라 "new value"라는 문자열만 던집니다.
  // register가 기대하는 브라우저 표준 이벤트 형식이 아니므로 데이터 동기화에 실패합니다.
  <div onClick={() => onChange("new value")}>{value}</div>
);

/* [Solution]: 만능 어댑터 Controller 도입 */
<Controller
  name="customField"
  control={control}
  render={({ field }) => <MyCustomInput {...field} />}
/>

🔍 구문 상세 설명 및 논리 분석

규격 불일치:register는 내부적으로 "너는 표준 HTML 엘리먼트지?"라고 가정하고 작동합니다. 커스텀 컴포넌트는 브라우저 표준 change 이벤트를 발생시키지 않으므로 register의 핸들러가 작동할 수 없습니다.
Controller의 역할: 엔진(useForm)과 컴포넌트 사이에서 데이터를 번역하여 전달하는 '조종사(Pilot)'이자 '어댑터'입니다. 컴포넌트가 어떤 형태든 상관없이 엔진의 제어권 안으로 끌어들입니다.
📖 상세 개념 가이드 1: Controller의 핵심 부품들
Controller를 제대로 다루기 위해서는 조종석에 있는 버튼들의 기능을 정확히 알아야 합니다.

<Controller
  name="isAgreed"                 // 1. 엔진 도서관의 고유 주소 (Key)
  control={control}               // 2. 엔진과 통신하는 무전기 채널
  rules={{ required: "필수!" }}    // 3. 유효성 검사 가이드라인
  render={({ field, fieldState }) => (
    /* 4. 도구 상자(field)와 신호등(fieldState) */
    <CustomComponent
      {...field}
      isError={fieldState.invalid}
    />
  )}
/>

🔍 속성별 정밀 분석

name (고유 주소): 엔진 내부 저장소에서 특정 데이터를 찾아가기 위한 주소입니다. Zod 스키마가 이 주소를 보고 데이터를 검증합니다.
control (무전기 채널): 메인 엔진과 소통하기 위한 전용 무전 채널입니다. useForm에서 꺼내온 객체를 그대로 넘겨주어야만 엔진이 이 컴포넌트를 관리 리스트에 포함합니다.
rules (가이드라인):register의 두 번째 인자와 동일합니다. 필수값 여부 등을 설정하여 엔진이 에러를 판단하게 돕습니다.
render (조종실): 가장 핵심적인 구문입니다. 자식 컴포넌트를 어떻게 그릴지 결정하는 함수로, field(데이터 통로)와 fieldState(상태 신호등)를 제공합니다.
📖 상세 개념 가이드 2: field 객체 내부의 마법 (onChange와 Ref)
render 안에서 우리가 꺼내 쓰는 field 객체 안에는 value, onChange, onBlur, ref라는 4대 천왕이 살고 있습니다.

/* [Inside field]: 조종사가 제공하는 핵심 부품들 */
render={({ field: { onChange, onBlur, value, ref } }) => (
  <button
    ref={ref}                        // 1. 포커스 제어를 위한 고속 전화선
    onBlur={onBlur}                  // 2. 검사 타이밍 신호탄
    onClick={() => onChange(!value)} // 3. 생값(Raw Value) 보고
  >
    {value ? "ON" : "OFF"}           // 4. 실시간 데이터 기초 공사
  </button>
)}

🔍 동작 원리 상세 분석

value (데이터 기초 공사):defaultValues에서 시작된 데이터가 흐르는 통로입니다. 초기값이 탄탄해야 리액트의 제어 컴포넌트 원칙을 어기지 않고 화면에 올바른 상태를 보여줍니다.
onChange (스마트 게이트웨이):가장 중요한 디테일입니다. 표준 인풋은 e.target.value를 던지지만, 커스텀 토글은 !value 같은 생값(Raw Value)을 직접 던집니다. Controller의 onChange는 인자가 이벤트 객체인지 순수 값인지 스스로 판단하여 엔진 저장소에 반영합니다.
ref (고속 전화선): 엔진이 브라우저의 실제 DOM 요소에 직접 말을 걸기 위한 연결선입니다. 에러 발생 시 해당 컴포넌트로 화면을 스크롤하거나 포커스를 맞출 때 사용됩니다.
onBlur (종료 감지): 사용자가 컴포넌트를 건드리고 떠나는 순간을 엔진에 보고합니다. 이 신호가 있어야 "입력이 끝났으니 검증을 시작하자"는 타이밍을 잡을 수 있습니다.
💻 실습: Tailwind CSS v4 커스텀 토글 스위치 구현
/* [File Path]: src/components/CustomUIForm.tsx */
import { Controller, useForm } from "react-hook-form";

export default function CustomUIForm() {
  const { control, handleSubmit } = useForm({
    // 💡 커스텀 컴포넌트를 쓸 때는 초기값 설정이 필수입니다!
    defaultValues: { pushNotification: false }
  });

  return (
    <form onSubmit={handleSubmit(data => console.log("제출됨:", data))} className="p-10 bg-slate-50 min-h-[300px] rounded-2xl border border-slate-200">
      <Controller
        name="pushNotification"
        control={control}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="text-sm font-semibold text-slate-700">푸시 알림 수신 설정</span>

              {/* 실제 스위치 구현부: 비표준 태그인 button 사용 */}
              <button
                type="button"
                ref={field.ref}
                onBlur={field.onBlur}
                onClick={() => field.onChange(!field.value)} // 클릭 시 불리언 반전 보고
                className={`${field.value ? 'bg-indigo-600' : 'bg-slate-200'}
                  relative inline-flex h-7 w-12 items-center rounded-full transition-all
                  outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2`}
              >
                {/* 움직이는 원 부분: 데이터에 반응하는 선언적 UI */}
                <span className={`${field.value ? 'translate-x-6' : 'translate-x-1'}
                  inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md`}
                />
              </button>
            </div>

            {/* 에러 메시지 표시: fieldState 활용 */}
            {fieldState.error && (
              <span className="text-xs text-rose-500 ml-1">{fieldState.error.message}</span>
            )}
          </div>
        )}
      />

      <button type="submit" className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200">
        설정 저장하기
      </button>
    </form>
  );
}

🔍 코드 구현 디테일 분석

동작 치환: 비록 button 태그를 썼지만, field.onChange를 통해 클릭 행위를 '데이터 업데이트'라는 의미 있는 사건으로 완전히 치환했습니다.
선언적 UI:field.value 상태에 따라 배경색(bg-indigo-600)과 원의 위치(translate-x-6)가 실시간으로 결정됩니다.
번역의 묘미:!field.value라는 순수 불리언 값을 넘겨주었음에도, Controller 조종사가 이를 완벽하게 엔진 저장소에 기록합니다.
