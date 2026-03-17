[실습] 55강: 리셋(Reset)과 비동기 로딩의 함정 — reset vs resetField: 서버 데이터를 가져온 후 기본값을 안전하게 업데이트하는 법
지난 시간 우리는 dirtyFields 장부를 활용해 수정된 데이터만 쏙 골라내어 서버에 아주 가볍게 전송하는 PATCH 요청의 실무 기법을 함께 알아보았습니다. 네트워크 자원까지 아끼는 정교한 최적화까지 마스터했으니 이제 여러분의 폼은 기술적으로 매우 성숙한 단계에 이르렀습니다.

하지만 실무 환경에서는 폼에 데이터를 채워 넣는 시작점에서 의외로 많은 개발자가 발목을 잡히곤 합니다. 특히 서버에서 데이터를 불러오는 속도가 우리 생각보다 느릴 때, 폼의 기본값이 제대로 반영되지 않거나 이전 데이터가 남아있는 버그를 마주하게 되는데요. 오늘은 폼의 생명주기를 완벽하게 관리하기 위한 reset과 resetField의 활용법, 그리고 비동기 데이터 로딩의 함정에서 벗어나는 안전한 전략을 아주 세밀하게 파헤쳐 보겠습니다.

📖 상세 개념 가이드 1: 호텔 객실 관리자로 이해하는 리셋 전략
이 고충을 이해하기 위해 아주 쉬운 현실 예시를 하나 들어보겠습니다. 여러분이 호텔의 객실 관리자라고 상상해 보세요.

💡 호텔 객실 비유 새로운 손님이 오기 전 방을 완벽하게 정리해야 합니다. 기본 상태(Default Values)로 준비를 마쳤는데, 손님이 문을 열고 들어오기 직전에야 "와인과 과일을 준비해달라"는 특별 요청(Server Data)이 도착했습니다.

단순히 탁자 위에 와인을 쓱 올려두는 것이 아니라, 방 전체의 관리 장부와 청소 상태를 새로운 손님의 요청이 반영된 상태로 완전히 다시 설정해야 합니다. 여기서 방 전체를 다시 정돈하는 행위가 reset이고, 화장실의 수건 하나만 교체하는 정밀한 작업이 resetField입니다.

📖 상세 개념 가이드 2: 왜 defaultValues에 서버 데이터를 바로 넣으면 안 될까?
React Hook Form에서 가장 흔히 발생하는 실수는 useForm의 defaultValues에 서버 데이터를 직접 넣으려고 하는 것입니다.

/* [Bad Example]: 데이터가 오기 전에 폼이 이미 굳어버립니다. */
const { data } = useQuery("/api/user"); // 비동기 데이터 로딩

const { register } = useForm({
  defaultValues: data, // ⚠️ 위험! data가 undefined일 때 폼이 초기화됩니다.
});
🔍 기술적 배경 및 상세 설명
마운트 시점의 고착: 리액트 훅 폼의 엔진은 컴포넌트가 마운트될 때 딱 한 번 초기값을 설정합니다. 즉, useForm이 호출되는 그 찰나의 data 값이 무엇이냐가 중요합니다.
동기적 한계: 서버 데이터는 네트워크를 타고 비동기적으로 오기 때문에, 첫 렌더링 시점에는 data가 아직 도착하지 않은 undefined 상태일 확률이 높습니다.
반영 실패: 나중에 데이터가 도착해서 data 변수값이 바뀌더라도, 이미 초기화가 끝난 폼 엔진은 새로운 값을 쳐다보지 않습니다. 결국 사용자는 서버 데이터를 불러왔음에도 빈 입력창만 보게 되는 '데이터 실종' 버그가 발생합니다.
📖 상세 개념 가이드 3: reset — 기준점(Source of Truth)의 통째 교체
reset 함수는 단순히 입력창의 글자를 지우는 도구가 아니라, 폼 엔진이 가지고 있는 기준점(Initial State) 자체를 통째로 갈아 끼우는 강력한 명령입니다.

/* [Concept Code]: reset의 핵심 역할 */
const handleLoadComplete = (userData) => {
  reset(userData); // "자, 이제부터 이 userData가 새로운 진실이야!"
};
🔍 동작 원리 분석 및 상세 설명
상태 장부 초기화: 서버 데이터로 reset을 호출하면 엔진은 isDirty, touchedFields 같은 모든 상태 장부를 깨끗하게 0으로 초기화합니다. 즉, "이 데이터는 방금 서버에서 온 깨끗한 상태이니 수정된 게 없다"라고 선언하는 것입니다.
전체 덮어쓰기:reset을 호출할 때 인자로 넘기지 않은 필드들은 폼이 처음 마운트되었을 때의 완전 초기 기본값으로 돌아가 버립니다. 만약 특정 필드 하나만 핀셋으로 집어내듯 초기화하고 싶다면 resetField를 사용해야 합니다.
💻 실습: 서버 데이터를 가져온 후 안전하게 폼을 초기화하는 실전 패턴
이제 useEffect와 reset을 결합한 정석 아키텍처를 구현해 보겠습니다.

/* [File Path]: src/components/UserProfileForm.tsx */
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function UserProfileForm({ userId }) {
  // 1. 초기 호출 시점에는 데이터가 없으므로 비어있는 상태로 시작합니다.
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm();

  useEffect(() => {
    // 2. 서버에서 사용자 데이터를 비동기로 불러옵니다.
    const fetchUserData = async () => {
      const response = await fetch(`/api/users/${userId}`);
      const userData = await response.json();

      // 3. [핵심] 데이터가 도착한 시점에 reset을 실행합니다.
      // 이 순간 폼은 서버 데이터로 채워지고, 수정 흔적인 dirty 상태도 초기화됩니다.
      reset(userData);
    };

    fetchUserData();
  }, [userId, reset]); // userId가 바뀌면 다시 로딩하고 리셋합니다.

  return (
    <form onSubmit={handleSubmit(data => console.log(data))} className="space-y-4">
      <div className="flex flex-col">
        <label className="text-sm font-bold text-slate-500">이름</label>
        <input {...register("name")} className="border-2 p-3 rounded-xl focus:border-indigo-500 outline-none" />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-bold text-slate-500">이메일</label>
        <input {...register("email")} className="border-2 p-3 rounded-xl focus:border-indigo-500 outline-none" />
      </div>

      {/* 4. reset 덕분에 로딩 직후에는 isDirty가 false가 되어 버튼이 비활성화됩니다.
          사용자가 수정을 시작해야만 버튼이 다시 살아납니다. */}
      <button
        type="submit"
        disabled={!isDirty}
        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black disabled:bg-slate-200 disabled:text-slate-400 transition-all"
      >
        저장하기
      </button>
    </form>
  );
}

🔍 상세 코드 분석 및 디테일 해설
reset(userData) 호출: 데이터를 불러오기 전에는 텅 빈 인풋 때문에 isDirty가 요동칠 수 있지만, reset이 실행되는 찰나에 모든 수정 흔적은 사라지고 폼은 '수정되지 않은 깨끗한 상태'가 됩니다.
의존성 배열 ([userId, reset]):userId가 변경될 때마다 useEffect가 다시 실행되도록 설계하여, 페이지 전환 시에도 폼이 항상 최신 사용자 데이터를 바라보게 만듭니다.
UX 최적화: 저장 버튼의 disabled={!isDirty} 속성이 reset과 연동되면서, 사용자가 실제로 한 글자라도 고치기 전까지는 버튼이 비활성화되는 아주 정교한 UX가 완성됩니다.
📖 상세 개념 가이드 4: 최신 트렌드 — values 속성 활용하기
최신 버전인 React Hook Form v7.45 이상을 사용하고 있다면, 위 과정을 훨씬 더 선언적으로 처리할 수 있습니다.

/* [Modern Pattern]: values 속성 사용 */
const { data, isLoading } = useQuery(["user", userId], fetchUser);

const { register } = useForm({
  // 💡 data가 바뀔 때마다 내부적으로 reset이 자동 실행됩니다!
  values: data,
});
🔍 장점 분석 및 상세 설명
간결함:useEffect와 reset을 직접 작성할 필요가 없습니다. 코드가 훨씬 읽기 쉬워집니다.
자동 동기화: 외부 데이터(data)가 변경될 때마다 폼이 자동으로 업데이트되어 최신 상태를 유지합니다. 서버 데이터가 실시간으로 변하는 환경에서 매우 권장되는 방식입니다.
주의사항:values 속성을 쓰면 외부 데이터가 변할 때마다 폼이 초기화되므로, 사용자가 수정 중인 값이 덮어씌워질 수 있습니다. 이를 방지하려면 옵션 설정을 추가로 고려해야 합니다.
📖 상세 개념 가이드 5: 정교한 제어를 위한 reset 옵션
reset 함수는 두 번째 인자로 옵션 객체를 받아 더욱 세밀하게 동작할 수 있습니다. (리스트 형식으로 정리)

keepDirtyValues: true: 서버 데이터를 새로 불러오면서도, 사용자가 이미 수정하고 있던 값들은 덮어쓰지 않고 유지합니다. 실시간 협업 툴이나 자동 저장 기능 구현 시 필수적입니다.
keepErrors: true: 데이터는 리셋하되 이전에 발생했던 유효성 검사 에러 메시지는 화면에 남겨둡니다. 데이터 갱신 후에도 경고를 유지해야 할 때 유용합니다.
keepDefaultValues: true: 새로운 값을 주입하여 UI는 바꾸되, "초기 기준점"은 바꾸지 않습니다. 즉, 데이터는 바뀌었지만 여전히 isDirty 상태가 유지되도록 만들 수 있습니다.
keepIsSubmitted: true: 폼 제출 여부(isSubmitted) 상태를 리셋하지 않고 그대로 유지합니다.
