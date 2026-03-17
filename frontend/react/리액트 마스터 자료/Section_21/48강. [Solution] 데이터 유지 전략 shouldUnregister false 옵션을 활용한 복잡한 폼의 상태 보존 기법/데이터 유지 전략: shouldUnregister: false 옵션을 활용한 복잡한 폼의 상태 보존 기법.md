[실습] 48강. [Solution] 데이터 유지 전략: shouldUnregister: false 옵션을 활용한 복잡한 폼의 상태 보존 기법
지난 시간 우리는 다단계 폼에서 페이지를 넘길 때마다 애써 입력한 정보들이 마치 파쇄기에 들어간 종이처럼 사라져버리는 허무한 고통을 함께 나누었습니다. 리액트 컴포넌트가 화면에서 퇴장하는 언마운트(Unmount) 과정과 그에 맞춰 데이터를 즉시 삭제해버리는 리액트의 기본 생리가 충돌하며 발생한 문제였죠.

오늘은 이 데이터 유실 사태를 단 한 줄의 코드로 해결하고, 화면에서 사라진 데이터까지 엔진의 메모리에 안전하게 보관하는 shouldUnregister: false 전략에 대해 알아보겠습니다.

🏗️ 1. 아키텍처의 핵심: FormProvider와 useFormContext
다단계 폼에서 모든 자식 컴포넌트가 부모의 폼 엔진을 공유하려면 강력한 '중앙 신경망'이 필요합니다. RHF는 이를 위해 리액트의 Context API를 활용한 도구들을 제공합니다.

📍 FormProvider (중앙 방송국)
역할:useForm에서 생성된 모든 도구(register, handleSubmit 등)를 자식 컴포넌트들에게 전파하는 공급자입니다.
동작 원리: 리액트의 Context.Provider를 내부적으로 사용하여, 하위 트리에 있는 모든 컴포넌트가 부모의 폼 상태를 실시간으로 바라볼 수 있게 합니다.
📍 useFormContext (전용 수신기)
역할: 부모가 깔아놓은 신경망에 접속하여 폼 도구들을 꺼내 쓰는 수신기입니다.
왜 쓰는가? (Prop Drilling 해결): 부모에서 자식으로, 자식에서 또 그 밑으로 register를 일일이 넘겨주다 보면 코드가 지저분해집니다. useFormContext를 쓰면 중간 컴포넌트를 건너뛰고 부모 엔진에 직접 빨대를 꽂을 수 있습니다.
📖 2. 메인 엔진 설정과 데이터 설계도(Blueprint)
먼저 전체 단계를 총괄하는 부모 컴포넌트에서 엔진을 어떻게 세팅하는지 살펴보겠습니다. 단순히 옵션만 끄는 것이 아니라, 데이터가 담길 '자리'를 미리 확보하는 것이 중요합니다.

💻 부모 컴포넌트: MultiStepForm.tsx
/* [File Path]: src/components/MultiStepForm.tsx */
import { useForm, FormProvider } from "react-hook-form";

export default function MultiStepForm() {
  // 1. useForm 설정: shouldUnregister를 false로 두어 데이터 영속성을 확보합니다.
  const methods = useForm({
    shouldUnregister: false, // 💡 핵심: 언마운트 시 데이터 삭제 방지
    mode: "onChange",        // 실시간 검증으로 데이터 안정성 확보
    defaultValues: {
      // 2. 설계도 작성: 엔진이 메모리에 미리 자리를 확보하도록 구조를 정의합니다.
      step1: { email: "", name: "" },
      step2: { address: "", phone: "" },
      step3: { agreement: false }
    }
  });

  return (
    // 3. FormProvider: 하위 모든 단계가 이 엔진을 공유하도록 신경망을 연결합니다.
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(data => console.log("최종 합산 데이터:", data))}>
        {/* 현재 단계에 맞는 컴포넌트를 렌더링합니다 (예: <Step1Component />) */}
        <CurrentStepComponent />
      </form>
    </FormProvider>
  );
}

💡 상세 코드 분석

shouldUnregister: false: RHF 엔진의 기본 '결벽증'을 해제합니다. 입력 컴포넌트가 DOM에서 제거되더라도 폼 엔진 내부 메모리 주소(Internal Store)에 할당된 값을 삭제하지 말고 유지하라고 명령하는 영속성(Persistence)의 핵심입니다.
defaultValues의 선언적 구조: 엔진에게 전체 데이터 설계도를 미리 전달하는 과정입니다. 화면에 보이지 않는 2단계, 3단계의 데이터가 들어갈 자리까지 메모리에 미리 확보해두어 데이터의 '주소'를 잃지 않게 합니다.
FormProvider: useForm에서 반환된 methods 객체를 하위 트리 전체에 공급합니다. 전개 연산자({...methods})를 통해 register, control, errors 등 모든 도구가 useFormContext를 통해 접근 가능해집니다.
📖 3. 하위 단계에서의 데이터 접속 (useFormContext)
부모가 거대한 신경망(FormProvider)을 깔아주었다면, 자식 컴포넌트들은 useFormContext라는 도구를 사용하여 부모의 엔진에 빨대를 꽂듯 접속할 수 있습니다.

💻 자식 컴포넌트: Step1Component.tsx
/* [File Path]: src/components/steps/Step1Component.tsx */
import { useFormContext } from "react-hook-form";

function Step1Component() {
  // 부모의 FormProvider가 제공하는 모든 도구를 가져옵니다.
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">Step 1: 기본 정보</h2>

      {/* 부모가 설정한 defaultValues의 경로(step1.email)를 정확히 타겟팅합니다. */}
      <input
        {...register("step1.email", { required: "이메일은 필수입니다." })}
        placeholder="이메일 주소"
        className="border-2 p-3 w-full rounded-md focus:border-blue-500 outline-none"
      />
      {errors.step1?.email && <p className="text-red-500 text-xs">{errors.step1.email.message}</p>}
    </div>
  );
}

💡 상세 코드 분석

useFormContext: 부모 컴포넌트로부터 register를 직접 props로 넘겨받지 않아도 됩니다. 이는 관심사 분리(Separation of Concerns)를 가능하게 하여, 부모는 흐름만 제어하고 자식은 자신의 UI만 신경 쓰게 합니다.
경로 기반 등록 (step1.email): 부모의 거대 주머니 안에서 자신의 데이터가 저장될 위치를 명확히 지정합니다. 페이지가 넘어가 화면에서 사라져도, 이 주소지에 적힌 데이터는 부모 엔진이 끝까지 지켜줍니다.
errors.step1?.email: 중첩된 데이터 구조에 맞춰 에러 상태도 객체 경로를 따라 추론됩니다. shouldUnregister: false 덕분에 이전 단계의 에러 메시지도 증발하지 않고 그대로 유지됩니다.
🧪 4. 시스템 검증: 데이터가 살아있는지 확인하는 법
설계가 완벽하다면 아래와 같은 현상이 관찰되어야 합니다.

DOM 확인: 1단계에서 데이터를 입력하고 2단계로 넘어갑니다. 개발자 도구(Elements)에서 1단계의 인풋들이 완전히 사라졌는지 확인하세요.
데이터 영속성: 다시 '이전' 버튼을 눌러 돌아왔을 때, 사라졌던 인풋이 다시 그려지면서 방금 입력했던 값들이 마법처럼 다시 채워져 있어야 합니다.
최종 병합: 모든 단계를 마친 후 제출을 누르면, 엔진은 한 번도 동시에 화면에 존재한 적 없는 데이터들을 묶어 아래와 같은 결과물을 출력합니다.
/* 제출 시 콘솔에 찍히는 최종 결과물 */
{
  "step1": { "email": "user@example.com", "name": "홍길동" },
  "step2": { "address": "서울시 강남구", "phone": "010-1234-5678" },
  "step3": { "agreement": true }
}
📊 5. 아키텍처 비교: 수동 백업 vs shouldUnregister
코드 복잡도

수동 방식: 단계 이동 시마다 save 함수를 호출하고 전역 상태(Zustand 등)에 일일이 백업해야 함.
shouldUnregister: 설정 한 줄로 자동화되어 개발자의 개입이 거의 없음.
에러 상태 보존

수동 방식: 에러 메시지(errors)나 터치 여부(isDirty)까지 수동으로 백업하기는 매우 힘듦.
shouldUnregister: 엔진이 데이터뿐만 아니라 에러 상태와 메타 정보까지 완벽히 보존함.
데이터 무결성

수동 방식: 전역 상태와 폼 엔진의 데이터가 꼬이는 '상태 불일치' 버그 위험이 존재함.
shouldUnregister: 폼 엔진 단일 저장소(Single Source of Truth)로 운영되어 무결성이 보장됨.
