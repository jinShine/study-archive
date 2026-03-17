[실습] 45강. [Solution] useFieldArray: 고유 ID 기반의 리스트 관리로 성능과 데이터 일관성을 동시에 잡는 기술
지난 시간 우리는 동적인 리스트 폼을 useState로 직접 관리하려 할 때 마주치는 끔찍한 인덱스 버그와 상태 불일치의 고통을 생생하게 경험했습니다. 항목을 하나 삭제했을 뿐인데 엉뚱한 칸의 값이 사라지거나 포커스가 튀어버리는 현상은 프론트엔드 개발자의 밤을 지새우게 만드는 고약한 난제였죠.

오늘은 이러한 동적 배열 데이터 관리의 모든 문제를 단번에 해결해 주는 React Hook Form의 전용 해결사인 useFieldArray의 강력한 기술력을 설계부터 구현까지 낱낱이 파헤쳐 보겠습니다.

❓ 왜 useFieldArray를 사용해야 하는가?
단순히 useState를 써도 될 것 같은데, 왜 굳이 이 훅을 배워야 할까요? 이유는 명확합니다.

데이터 무결성: RHF 내부 저장소와 UI 상태를 완벽하게 동기화합니다. "지웠는데 남아있는" 현상이 사라집니다.
고유 ID (field.id) 생성: 리액트에서 가장 골치 아픈 '인덱스를 키로 사용할 때 발생하는 버그'를 원천 차단합니다.
성능 최적화: 배열 전체를 리렌더링하지 않고, 추가/삭제/수정된 특정 항목만 정밀하게 업데이트합니다.
복합 로직 지원: 단순 추가/삭제를 넘어 순서 변경(move), 특정 위치 삽입(insert) 등을 메서드 하나로 해결합니다.
🏗️ Step 1. 데이터의 뼈대, 인터페이스 설계
동적 폼에서는 데이터가 배열 형태로 들어오기 때문에 이 구조를 명확히 선언하는 것이 모든 설계의 시작입니다.

/* [Step 1]: 데이터 규격 정의 */
interface CareerForm {
  // careers는 객체(company, period)를 담은 '배열'임을 명시하여 설계도를 완성합니다.
  careers: {
    company: string;
    period: string;
  }[];
}

💡 코드 상세 설명 및 배경

배경: 동적 리스트는 단순히 문자열 배열이 아니라 객체 배열({ }[])인 경우가 대부분입니다. 이 구조를 미리 정의하지 않으면 나중에 엔진이 어떤 필드를 만들어야 할지 몰라 헤매게 됩니다.
동작 원리: 타입스크립트에게 careers라는 키가 "객체들이 담긴 리스트"임을 선언합니다. 이를 통해 추후 careers.0.company와 같은 경로를 작성할 때 강력한 타입 추론의 보호를 받을 수 있습니다.
실무 팁: 배열 내부의 객체가 복잡하다면 별도의 interface로 분리하여 가독성을 높이는 것이 좋습니다.
닻(Anchor) 내리기: useForm 초기화
인터페이스를 정의했다면 이제 엔진을 호출할 차례입니다. 동적 배열을 다룰 때 가장 중요한 규칙은 defaultValues를 반드시 설정해야 한다는 점입니다.

/* [Step 2]: useForm 초기화 (defaultValues 설정 필수) */
export default function SmartDynamicForm() {
  const { register, control, handleSubmit } = useForm<CareerForm>({
    defaultValues: {
      // 폼이 시작될 때 최소 한 개의 비어있는 입력 칸은 보여주도록 초기값을 잡습니다.
      careers: [{ company: "", period: "" }]
    }
  });
}
💡 코드 상세 설명 및 배경

배경: 배열 필드는 초기 구조가 잡혀 있어야 엔진이 안정적으로 리스트의 형태를 인지합니다. 초기값이 없으면 undefined 에러가 나거나 첫 번째 항목 추가 시 레이아웃이 깨질 수 있습니다.
동작 원리:defaultValues는 엔진에게 "우리 집 장부에는 careers라는 리스트가 있고, 현재 1번 칸이 비어있는 상태야"라고 알려주는 기준점(Anchor) 역할을 합니다.
상세 설명: 비어있는 리스트에서 시작하고 싶다면 careers: []로 두어도 되지만, 사용자 경험을 위해 빈 입력칸 하나를 미리 넣어두는 것이 좋습니다.
👨‍✈️ 배열 조종사: useFieldArray 장착
오늘의 주인공입니다. 이 훅은 무전기인 control과 관리할 배열의 이름인 name을 받아 조작 권한을 부여합니다. 단순히 배열을 수정하는 것을 넘어, RHF 엔진과 UI를 실시간으로 동기화하는 '필드 전용 관제 시스템'입니다.

/* [Step 3]: useFieldArray 선언 및 조작 함수 추출 */
const { 
  fields,   // 실시간 데이터 스냅샷 (고유 ID 포함)
  append,   // 맨 뒤에 추가
  remove,   // 특정 항목 삭제
  move,     // 순서 변경
  insert    // 중간에 삽입
} = useFieldArray({
  control,         // 엔진과 소통하는 무전기 채널
  name: "careers"  // 인터페이스에 정의된 배열 필드명
});
💡 코드 상세 설명 및 기능별 정밀 분석
배경:useState로 리스트를 관리하면 삭제/추가 시마다 전체 배열을 복사하고 인덱스를 계산해야 합니다. useFieldArray는 이 지저분한 로직을 엔진 내부로 숨겨 가독성과 성능을 동시에 잡습니다.
동작 원리:fields는 RHF 내부 저장소의 특정 주소를 실시간으로 구독(Subscription)하는 전용 스냅샷입니다. 우리가 아래의 조작 함수들을 실행하면 엔진이 저장소를 고치고, 그 변화를 감지한 fields가 화면을 갱신합니다.
📍 각 기능별 상세 해설
append(obj) (맨 뒤에 추가):
동작: 리스트의 가장 마지막 인덱스 뒤에 새로운 객체를 덧붙입니다.
내부 로직: 새로운 데이터를 넣음과 동시에 리액트의 key로 사용할 고유 ID(field.id)를 즉시 생성하여 부여합니다.
실무 활용: "경력 추가", "상품 추가" 버튼처럼 가장 일반적인 추가 로직에 사용됩니다.
remove(index | index[]) (특정 항목 삭제):
동작: 지정한 인덱스의 항목을 배열에서 완전히 도려냅니다.
내부 로직: 단순히 값만 지우는 것이 아니라, 해당 인덱스와 연결된 유효성 검사 에러 메시지(errors)와 '수정됨(isDirty)' 상태까지 함께 청소합니다. 인덱스를 배열 형태로 넘기면 여러 개를 한 번에 지울 수도 있습니다.
실무 활용: 리스트 각 줄 옆에 붙은 "삭제" 버튼에 연결합니다.
move(from, to) (순서 변경):
동작:from 위치에 있던 데이터를 to 위치로 옮깁니다. (예: 1번 항목을 3번으로 이동)
내부 로직: 배열의 인덱스를 재조정하면서도 각 항목의 고유 ID(field.id)는 그대로 유지합니다. 따라서 순서가 바뀌어도 입력 중이던 인풋의 포커스가 풀리지 않습니다.
실무 활용: 사용자가 드래그 앤 드롭(Drag & Drop)으로 리스트 순서를 바꿀 때 필수적으로 사용됩니다.
insert(index, obj) (중간 삽입):
동작: 배열의 맨 끝이 아닌, 내가 원하는 특정 인덱스 위치에 데이터를 끼워 넣습니다.
내부 로직: 삽입된 위치 이후의 모든 항목 인덱스를 엔진이 자동으로 1씩 뒤로 밀어내며 경로를 재배정합니다.
실무 활용: "이 항목 위에 추가" 혹은 "중간에 끼워넣기" 기능 구현 시 사용됩니다.
🆔 고유 ID 시스템: 인덱스 버그의 원천 봉쇄
useFieldArray가 제공하는 fields 배열의 각 요소에는 우리가 정의하지 않은 id라는 속성이 포함되어 있습니다. 이것이 바로 동적 폼의 구세주입니다.

/* [Logic]: fields.map 내부에서의 id 활용 */
{fields.map((field, index) => (
  // 💡 중요: index가 아닌 field.id를 key로 사용합니다.
  <div key={field.id}>
    <input {...register(`careers.${index}.company`)} />
  </div>
))}

💡 코드 상세 설명 및 배경

배경: 리액트에서 index를 key로 쓰면 항목 삭제 시 리액트가 "마지막 항목이 삭제되었다"고 오해하여 포커스를 엉뚱한 곳에 두거나 상태를 꼬이게 만듭니다.
동작 원리:field.id는 항목이 생성될 때 발급되는 '영원한 주민등록번호'입니다. 배열의 순서가 바뀌거나 중간 항목이 삭제되어도 이 ID는 해당 데이터를 끝까지 따라다닙니다.
실무 팁:field.id는 RHF 내부에서 관리하는 값이므로, 서버에 데이터를 보낼 때는 자동으로 제외됩니다. 걱정 없이 key로 사용하세요.
🚀 실무 테크닉: 임시 데이터(Template) 활용
실무에서는 사용자가 버튼을 눌렀을 때 특정 템플릿을 미리 채워주고 싶을 때가 많습니다.

/* [Step 4]: 임시 데이터를 이용한 추가 로직 */
const addDefaultCareer = () => {
  // 1. 임시 데이터 객체를 설계도 규격에 맞게 생성
  const tempCareer = {
    company: "새로운 회사",
    period: "1년"
  };

  // 2. append 함수에 이 데이터를 담아 호출
  append(tempCareer);
};

💡 코드 상세 설명 및 배경

배경: 신규 항목을 추가할 때 "미리 정의된 양식"을 넣어주면 데이터 일관성을 유지하기 쉽습니다.
동작 원리:append가 실행되는 순간, 엔진은 tempCareer에 고유 ID를 부여하여 fields 배열에 즉시 안전하게 편입시킵니다.
실무 팁:append 뿐만 아니라 prepend를 쓰면 리스트의 맨 위에 데이터를 추가할 수도 있습니다. 최신순 정렬이 필요한 폼에서 매우 유용합니다.
💻 최종 실습: 스마트 동적 경력 사항 입력 시스템
모든 기술을 집대성하여, 렉 없이 돌아가는 완벽한 동적 폼을 구현합니다.

import React from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";

interface CareerForm {
  careers: { company: string; period: string; }[];
}

export default function SmartDynamicForm() {
  const { register, control, handleSubmit } = useForm<CareerForm>({
    defaultValues: { careers: [{ company: "", period: "" }] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "careers" });

  const onSubmit: SubmitHandler<CareerForm> = (data) => console.log("최종 데이터:", data);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">동적 경력 사항 시스템</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        {fields.map((field, index) => (
          /* [Deep Dive]: field.id로 성벽을 쌓고, index로 경로를 안내합니다. */
          <div key={field.id} className="flex items-center gap-4 p-5 border rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
            <div className="flex-1 flex flex-col gap-1">
              <input
                // as const를 통해 careers.0.company와 같은 정교한 경로 추론 유지
                {...register(`careers.${index}.company` as const)}
                placeholder="회사명"
                className="border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <input
                {...register(`careers.${index}.period` as const)}
                placeholder="근무 기간"
                className="border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              삭제
            </button>
          </div>
        ))}

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={() => append({ company: "", period: "" })}
            className="flex-1 py-3 border-2 border-blue-500 text-blue-500 rounded-xl font-bold hover:bg-blue-50"
          >
            + 항목 추가
          </button>
        </div>

        <button type="submit" className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-200">
          데이터 서버 전송
        </button>
      </form>
    </div>
  );
}

💡 최종 코드 정밀 분석

key={field.id}: 삭제나 순서 변경에도 절대 포커스를 잃지 않게 만드는 마법의 열쇠입니다. 리액트의 재사용 최적화를 돕는 일등 공신입니다.
careers.${index}.company as const: 동적 경로를 register에 등록할 때 as const를 붙여주면 타입스크립트가 "이것은 단순한 글자가 아니라 특정 객체의 경로다"라고 인지하여 타입 안전성을 끝까지 지켜줍니다.
성능 포인트: 리스트가 아무리 길어져도 특정 인풋을 수정할 때 다른 항목들은 리렌더링되지 않습니다. useFieldArray가 구독 모델을 통해 변화를 격리하기 때문입니다.
🛠️ useFieldArray 조작 도구 모음 리스트
실무에서 배열을 다룰 때 사용하는 모든 무기를 정리해 드립니다.

append(obj): 리스트의 끝에 새로운 항목을 추가합니다. (가장 흔함)
prepend(obj): 리스트의 맨 앞에 추가합니다. (최신순 정렬 시 유용)
remove(index): 특정 순서의 항목을 삭제합니다. 연결된 유효성 검사와 에러 메시지도 함께 삭제됩니다.
move(from, to): 항목의 순서를 바꿉니다. 드래그 앤 드롭 구현 시 필수입니다.
insert(index, obj): 특정 중간 위치에 항목을 끼워 넣습니다.
replace(arr): 전체 리스트를 새로운 배열로 통째로 교체합니다.
