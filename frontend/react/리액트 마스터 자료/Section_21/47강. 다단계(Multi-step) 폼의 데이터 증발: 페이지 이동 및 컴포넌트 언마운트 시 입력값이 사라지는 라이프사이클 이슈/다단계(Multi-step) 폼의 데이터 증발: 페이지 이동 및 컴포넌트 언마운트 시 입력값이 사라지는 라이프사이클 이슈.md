[실습] 47강. [Pain] 다단계(Multi-step) 폼의 데이터 증발: 페이지 이동 및 컴포넌트 언마운트 시 입력값이 사라지는 라이프사이클 이슈
지금까지 우리는 register와 Controller를 통해 단일 페이지 내에서 폼을 얼마나 빠르고 정교하게 관리할 수 있는지 알아보았습니다. 하지만 실무의 세계는 냉혹합니다. 입력 항목이 50개가 넘어가면 사용자는 지루함을 느끼고, 우리는 이를 해결하기 위해 다단계(Multi-step) 폼이라는 카드를 꺼내 들게 되죠.

하지만 바로 이 지점에서 우리는 "1페이지를 쓰고 2페이지로 넘어갔는데, 다시 돌아오니 1페이지 내용이 싹 사라졌어요!"라는 사용자의 분노 섞인 피드백을 마주하게 됩니다. 왜 이런 일이 발생하는 걸까요?

📖 상세 개념 가이드 1: 데이터 증발의 현실적 비유
이 현상을 아주 쉬운 현실 예시로 비유해 보겠습니다. 여러분이 동사무소에서 아주 긴 서류를 작성하고 있다고 상상해 보세요.

💡 파쇄기 비유

서류가 너무 길어서 1페이지를 다 쓰고 다음 장으로 넘겼는데, 그 순간 담당 직원이 "어, 1페이지는 이제 안 보고 계시네요?"라며 여러분이 방금 쓴 1페이지를 파쇄기에 넣어버리는 것과 같습니다. 수정을 위해 다시 앞장을 보려고 하면 이미 종이는 가루가 되어 사라진 상태인 것이죠. 개발 세계에서 일어나는 데이터 증발이 바로 이 허무한 상황입니다.

📖 상세 개념 가이드 2: 기술적 원인 — 리액트 라이프사이클(Lifecycle)
이 문제의 근본 원인은 리액트가 컴포넌트를 교체하는 방식에 있습니다. 화면 전환은 단순한 '가림'이 아니라 '파괴와 생성'의 과정이기 때문입니다.

🔍 기술적 배경: 언마운트(Unmount)와 자동 해제(Unregister)
언마운트(Unmount): 컴포넌트가 DOM에서 완전히 제거되는 단계입니다. 연극 무대에서 배우가 퇴장하면서 소품까지 모두 들고 나가는 것과 같습니다.
RHF의 자동 등록 취소: React Hook Form은 기본적으로 매우 깔끔한 성격의 엔진입니다.
철학: "내 눈앞에 없는 인풋은 내가 관리할 필요가 없다."
동작: 컴포넌트가 언마운트되면 RHF는 메모리 절약과 데이터 정합성을 위해 해당 필드를 관리 대상에서 즉시 제외(Unregister)하고 데이터를 삭제합니다.
💻 실습: 데이터 유실 시뮬레이션 (DataLossForm.tsx)
실제로 다단계 폼을 구현했을 때 어떤 식으로 데이터가 증발하는지 코드를 통해 낱낱이 파헤쳐 보겠습니다.

/* [File Path]: src/components/DataLossForm.tsx */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function DataLossForm() {
  const [step, setStep] = useState(1);
  const { register, handleSubmit } = useForm(); // ⚠️ 기본값: 화면에서 사라지면 데이터도 지워집니다.

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  return (
    <div className="p-10 max-w-md mx-auto bg-white shadow-lg rounded-2xl">
      <h1 className="text-xl font-bold mb-6 text-slate-800">Step: {step} / 2</h1>

      {/* 📍 Step 1: 이메일 입력 섹션 */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <h3 className="font-semibold">Step 1: 기본 정보</h3>
          <input
            {...register("email")}
            placeholder="이메일 입력"
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={nextStep} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">다음으로 이동</button>
        </div>
      )}

      {/* 📍 Step 2: 닉네임 입력 섹션 */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in">
          <h3 className="font-semibold">Step 2: 상세 정보</h3>
          <input
            {...register("nickname")}
            placeholder="닉네임 입력"
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex gap-2">
            <button onClick={prevStep} className="flex-1 bg-slate-200 p-3 rounded-xl font-bold">이전</button>
            <button onClick={handleSubmit((d) => console.log("제출 데이터:", d))} className="flex-1 bg-green-600 text-white p-3 rounded-xl font-bold">최종 제출</button>
          </div>
        </div>
      )}
    </div>
  );
}

🔍 코드 상세 분석 및 동작 순서 (하나하나 짚어보기)
조건부 렌더링 (step === 1 && ...): 이 구문이 문제의 시작입니다. step이 2가 되는 순간, 리액트는 Step 1의 div와 그 안의 input을 메모리에서 지워버립니다.
데이터 기록: 사용자가 이메일을 타이핑하면 RHF 내부 저장소에 기록됩니다. 하지만 '구독 중인 실제 DOM'이 사라지는 순간, RHF는 이 데이터가 더 이상 유효하지 않다고 판단합니다.
데이터 증발: Step 2에서 '이전' 버튼을 눌러 다시 Step 1로 돌아오면, 컴포넌트는 새로 '마운트'되지만 RHF 저장소의 email 값은 이미 비워져 있어 빈 입력창만 나타나게 됩니다.
📖 상세 개념 가이드 3: 고육지책 — 수동 전역 상태 관리의 고통
많은 개발자가 이 문제를 해결하기 위해 폼 엔진 밖에서 '임시 보관소'를 만드는 노가다를 선택합니다.

/* [Pain Point]: 수동으로 데이터를 백업하는 복합 배선 작업 */

// 1. 별도의 전역 저장소(Zustand 등)나 최상위 부모의 useState 생성
const [backup, setBackup] = useState({});

// 2. 단계 이동 시마다 "현재 데이터 챙겨서 저장하기" 로직을 수동으로 호출
const handleNext = (currentValues) => {
  setBackup((prev) => ({ ...prev, ...currentValues })); // 장부에 적어두기
  setStep(2); // 페이지 넘기기
};

// 3. 다시 돌아왔을 때 RHF 엔진에 "기존 장부 내용 다시 넣어줘"라고 명령
const { register } = useForm({
  defaultValues: backup // 관리 포인트가 두 곳(RHF와 백업 장부)으로 늘어남
});

🔍 아키텍처적 문제점 (리스트형)
중복 투자: 폼 데이터는 폼 엔진(useForm)이 관리해야 함에도, 단순히 화면에서 사라졌다는 이유로 별도의 보관함을 만드는 것은 명백한 자원 낭비입니다.
배선 작업의 복잡도: 필드가 100개라면 백업하고 복구하는 로직도 100개를 감당해야 합니다. 오타 하나로 데이터가 꼬이는 버그가 발생할 확률이 O(N)으로 증가합니다.
성능 저하: 전역 상태와 폼 엔진 간의 데이터를 계속해서 동기화하는 과정에서 불필요한 리렌더링이 유발됩니다.
결국 우리에게 필요한 핵심 전략은 화면(UI)이 사라지더라도 그 안에 담긴 데이터의 생명주기는 유지되도록 분리하는 것입니다. RHF 엔진에게 "이 인풋이 잠시 눈앞에서 사라지더라도 내가 가진 정보는 소중하니까 버리지 말고 끝까지 기억해 둬"라고 명령을 내릴 수 있어야 합니다.

