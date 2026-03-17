[실습] 46강. 성능 최적화 디테일: useWatch(구독) vs getValues(일회성)
지난 시간 우리는 useFieldArray를 통해 동적 리스트 폼의 구조적 안정성을 확보했습니다. 고유 ID라는 강력한 무기 덕분에 인덱스가 꼬이는 지옥에서 벗어날 수 있었죠.

하지만 구조가 완벽하다고 해서 성능까지 자동으로 최적화되는 것은 아닙니다. 폼이 커질수록 특정 입력값에 따라 UI가 실시간으로 변해야 할 때 컴포넌트 전체가 다시 그려지는 비효율을 어떻게 막을지, 혹은 값은 가져오고 싶은데 렌더링은 일으키고 싶지 않을 땐 어떻게 해야 할지 고민에 빠지게 됩니다. 오늘은 React Hook Form이 제공하는 두 가지 핵심 데이터 접근 방식인 useWatch와 getValues를 파헤쳐 보겠습니다.

📖 상세 개념 가이드 1: useWatch — 정교한 구독 시스템
우리는 종종 비밀번호를 입력할 때 실시간으로 강도를 표시하거나, 체크박스를 눌렀을 때만 추가 입력창을 보여주는 기능을 구현해야 합니다. 이때 리액트의 일반적인 상태인 useState를 쓰면 글자 하나를 칠 때마다 폼 전체가 리렌더링되는 비극이 발생하지만, useWatch는 구독 기반의 도구로서 이 문제를 해결해 줍니다.

🔍 watch vs useWatch: 아파트 안내 방송의 비유
이 차이를 이해하는 가장 쉬운 방법은 아파트 단지의 안내 방송에 비유하는 것입니다.

watch 함수: 단지 내 특정 집에 택배가 왔다는 사실을 아파트 전체 스피커로 방송하는 것과 같습니다. 택배와 상관없는 옆집 사람들도 하던 일을 멈추고 방송을 들어야 하죠(컴포넌트 전체 리렌더링).
useWatch 훅: 해당 세대에만 설치된 전용 인터폰으로 호출하는 방식입니다. 오직 택배를 기다리던 그 집만 반응하고 다른 이웃들은 평온을 유지합니다(특정 하위 컴포넌트만 리렌더링).
💻 useWatch 기본 사용법
/* [Concept]: 하위 컴포넌트에서 특정 필드만 구독하기 */
import { useWatch } from "react-hook-form";

function Watcher({ control }) {
  // 1. "userName" 필드의 변화만 감시합니다.
  // 2. 이 값이 변할 때 '이 컴포넌트만' 리렌더링됩니다.
  const userName = useWatch({
    control,
    name: "userName",
    defaultValue: "방문자" // 초기값 설정 가능
  });

  return <p>현재 입력 중인 이름: {userName}</p>;
}

💡 코드 상세 분석

동작 원리:useWatch는 내부적으로 구독(Subscription) 모델을 사용합니다. 전체 폼 상태가 변해도, 내가 지정한 name의 값이 변하지 않았다면 리액트에게 렌더링 신호를 보내지 않습니다.
성능 포인트: 부모 컴포넌트가 아닌, 값을 실제로 사용하는 말단 자식 컴포넌트에서 이 훅을 사용하면 부모의 리렌더링을 완벽하게 차단할 수 있습니다.
📖 상세 개념 가이드 2: getValues — 렌더링을 깨우지 않는 조용한 스냅샷
반면 단순히 값을 읽어오기만 하면 되고 화면을 다시 그릴 필요가 없는 순간도 있습니다. 예를 들어 제출 버튼을 눌렀을 때 현재 값을 확인하거나 로직 계산을 위해 잠깐 값을 참조할 때입니다. 이럴 때 필요한 도구가 바로 렌더링을 깨우지 않는 조용한 스냅샷인 getValues입니다.

🔍 getValues의 동기적(Synchronous) 특성
getValues는 구독이 아니라 일회성 폴라로이드 사진입니다. 호출하는 순간의 데이터 저장소 상태를 찍어서 가져올 뿐 리액트의 렌더링 사이클을 전혀 건드리지 않습니다.

💻 getValues 기본 사용법
/* [Concept]: 리렌더링 없이 현재 저장소의 값 탈취하기 */
const { getValues } = useForm();

const handleCheckData = () => {
  // 1. 호출하는 그 찰나의 값을 동기적으로 즉시 가져옵니다.
  // 2. 리액트의 상태 업데이트(setState)처럼 다음 렌더링을 기다릴 필요가 없습니다.
  const currentValues = getValues();
  const specificValue = getValues("email"); // 특정 필드만 선택 가능

  console.log("렌더링 없이 가져온 데이터:", currentValues);
};
💡 코드 상세 분석

배경: "데이터는 궁금한데 화면은 안 바뀌어도 돼"라는 모든 상황(로깅, 조건문 처리 등)에 최적화되어 있습니다.
직접 접근: 리액트의 가상 DOM 과정을 거치지 않고 RHF 내부의 순수 자바스크립트 객체 저장소에 직접 접근하므로 비용이 거의 제로()에 가깝습니다.
📊 useWatch vs getValues 핵심 비교
useWatch (실시간 구독 모드)
주 목적: 실시간 UI 피드백 (비밀번호 강도, 조건부 필드 노출 등).
렌더링 수치:해당 하위 컴포넌트만 N회 발생 (부모는 0회).
특징: 데이터 변화를 감지하여 스트리밍 방식으로 화면을 갱신함.
getValues (조용한 스냅샷 모드)
주 목적: 로직 연산 및 데이터 참조 (제출 전 가공, 로그 기록 등).
렌더링 수치:전체 컴포넌트 0회 발생.
특징: 리액트 사이클을 거치지 않고 메모리 저장소에서 즉시 값을 탈취함.
💻 최종 실습: 구독 vs 스냅샷 성능 대조 시스템
이 코드는 두 기능의 차이를 극명하게 보여줍니다. RenderCounter를 통해 어떤 동작이 리렌더링을 유발하는지 직접 확인해 보세요.

import React, { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

interface PerformanceForm {
  title: string;
}

// 렌더링 횟수를 추적하는 헬퍼 컴포넌트
function RenderCounter({ name }: { name: string }) {
  const count = useRef(0);
  count.current++;
  return (
    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
      {name} Render: {count.current}
    </span>
  );
}

// 1. [useWatch] 전용 하위 컴포넌트: 성능 고립의 핵심
function TitleWatcher({ control }: { control: any }) {
  const title = useWatch({ control, name: "title" });
  return (
    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-indigo-700">useWatch (구독 중)</h3>
        <RenderCounter name="Child" />
      </div>
      <p className="text-indigo-900 italic">"{title || "대기 중..."}"</p>
    </div>
  );
}

export default function PerformanceDeepDive() {
  const { register, control, getValues } = useForm<PerformanceForm>();

  return (
    <div className="p-10 max-w-xl mx-auto space-y-6 font-sans">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">Performance Lab</h1>
        <RenderCounter name="Parent" />
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-slate-400 uppercase">Input Field</label>
          <input
            {...register("title")}
            placeholder="입력 시 Child만 반응합니다"
            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all"
          />
        </div>

        {/* 💡 이 자식 컴포넌트만 리렌더링됩니다. */}
        <TitleWatcher control={control} />

        <button
          type="button"
          onClick={() => alert(`[Snapshot]: ${getValues("title")}`)}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95"
        >
          getValues 스냅샷 (부모/자식 렌더링 0회)
        </button>
      </div>
    </div>
  );
}

🔍 코드 상세 분석

성능 고립:useWatch를 TitleWatcher라는 별도 컴포넌트로 뺐기 때문에, title을 입력할 때 Parent의 렌더링 횟수는 멈춰 있고 Child의 숫자만 올라가는 것을 볼 수 있습니다.
제로 리렌더링:getValues 버튼을 누르면 알림창은 뜨지만, 그 어떤 컴포넌트의 카운트도 올라가지 않습니다. 이것이 진정한 Zero-Overhead 접근입니다.
🛠️ 리액트 아키텍트 전용: 성능 대조 환경 생성 스크립트
🧪 수치로 증명하는 3가지 테스트 포인트
실습 환경(npm run dev)에서 RenderCounter의 숫자를 통해 다음 수치를 대조해 보세요.

렌더링 고립 (O(1) 성능)
수치:ParentContainer 카운트가 1(마운트)에서 고정되는지 확인.
검증: 10글자 입력 시 ChildComponent 카운트는 11(1 + 10)이 되지만, 부모는 1을 유지해야 함.
의미: 필드가 1,000개로 늘어나도 타이핑 중인 인풋 외에 전체 CPU 부하는 0%에 수렴함.
Zero-Render (비용 0원)
수치:getValues 버튼을 10번 클릭해도 모든 컴포넌트의 카운트 변화가 0인지 확인.
검증: 클릭 시 알림창은 뜨지만, 리액트 엔진은 단 한 번의 연산(Render)도 수행하지 않아야 함.
의미: 화면 갱신이 필요 없는 로직 처리 시 불필요한 배터리 소모와 성능 저하를 완벽히 차단함.
동기적 일관성 (0ms 지연)
수치: 입력 즉시 버튼 클릭 시 데이터 지연 시간 0ms.
검증: 리액트의 useState는 다음 렌더링까지 이전 값을 들고 있는 지연(약 16ms)이 발생하지만, getValues는 호출 즉시 최신본을 반환함.
의미: 찰나의 순간에 발생하는 데이터 불일치(Race Condition)를 아키텍처 레벨에서 차단함.
