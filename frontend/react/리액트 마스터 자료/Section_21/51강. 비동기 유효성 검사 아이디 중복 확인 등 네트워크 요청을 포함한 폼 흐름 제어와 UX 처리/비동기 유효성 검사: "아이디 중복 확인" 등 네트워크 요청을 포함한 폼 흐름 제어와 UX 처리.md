[실습] 51강. 비동기 유효성 검사: "아이디 중복 확인" 등 네트워크 요청을 포함한 폼 흐름 제어와 UX 처리
지난 시간 우리는 서버가 던진 에러 메시지를 폼의 정확한 위치에 자동으로 매핑해주는 setError의 마법을 함께 알아보았습니다. 이제 우리 폼은 백엔드의 엄격한 검증 결과까지 우아하게 수용할 수 있는 튼튼한 소통 창구를 갖게 되었죠. 하지만 아키텍트의 관점에서 한 걸음 더 나아가 봅시다. 실시간성이 강조되는 현대 웹에서 비동기 검증은 선택이 아닌 필수입니다.

📖 상세 개념 가이드 1: 비동기(Async) vs 동기(Sync) 검증
비동기 유효성 검사라는 용어가 어렵다면, 이를 일상의 '식당 예약' 과정에 비유해 보세요.

💡 식당 예약 비유

여러분이 식당에 전화를 걸어 "오늘 저녁 7시, 4명 예약 가능한가요?"라고 묻습니다. 직원은 잠시 전화를 끊지 말고 기다려달라고 한 뒤, 예약 장부를 확인(네트워크 요청)하고 돌아와 "네, 가능합니다"라고 답합니다. 여기서 직원이 장부를 확인하는 동안 발생하는 '기다림의 시간'이 바로 프로그래밍에서의 비동기(Async)입니다.

반면 "이름이 무엇인가요?"라는 질문에 즉시 답하는 것은 내 머릿속 정보를 바로 꺼내는 것이기에 기다림이 없는 동기(Sync) 작업입니다.

📖 상세 개념 가이드 2: validate 속성과 async 함수 주입
React Hook Form의 register 함수는 validate라는 강력한 무기를 가지고 있습니다. 여기에 async 키워드를 붙이는 순간, 엔진은 이 검증이 '시간이 걸리는 외부 통신'임을 인지하고 완료될 때까지 기다립니다.

💻 실전 코드: 비동기 유효성 검사 핵심 로직
/* [Core Logic]: 비동기 유효성 검사 실전 구현 */
<input
  {...register("userId", {
    required: "아이디는 필수입니다.",
    // validate 속성에 async 함수를 정의하여 비동기 로직을 주입합니다.
    validate: async (value) => {
      // 1. 서버에 중복 확인 요청을 보냅니다. (Promise 반환)
      // 실제 API 호출 대신 mock 함수를 사용한 예시입니다.
      const isAvailable = await checkIdDuplicate(value);

      // 2. 서버 응답 결과에 따라 흐름을 제어합니다.
      // 반환값이 true면 통과, 문자열이면 그 내용이 에러 메시지가 됩니다.
      return isAvailable || "이미 사용 중인 아이디입니다.";
    }
  })}
/>

🔍 코드 상세 분석 및 동작 순서
함수 실행: 사용자가 입력을 마치면(혹은 설정된 모드에 따라) validate 함수가 호출됩니다.
Promise 대기:await checkIdDuplicate(value) 줄에서 엔진은 실행을 잠시 멈추고 서버의 응답을 기다리는 Promise 대기 상태가 됩니다.
결과 평가: 서버가 false를 응답하면 isAvailable은 false가 되고, 논리 합 연산(||)에 의해 뒤의 문자열이 반환되어 즉시 에러로 등록됩니다.
최종 반영: 모든 과정이 끝나면 엔진은 비로소 폼을 valid 혹은 invalid 상태로 확정 짓습니다.
📖 상세 개념 가이드 3: 컨트롤 타워 formState와 isValidating
비동기 검사가 진행되는 동안(0.5초~1초) 화면에 아무 변화가 없다면 사용자는 시스템이 멈췄다고 생각할 수 있습니다. 이때 우리는 formState라는 '종합 컨트롤 타워'의 신호를 읽어 시각적 피드백을 주어야 합니다.

💻 배경 지식: formState의 핵심 상태들
isValidating: 현재 비동기 유효성 검사가 진행 중인지 여부를 나타내는 불리언 값입니다. (오늘의 핵심!)
isDirty: 사용자가 단 한 번이라도 값을 수정했는지 여부입니다.
isSubmitting: 현재 서버로 폼 제출이 진행 중인지 여부입니다.
📖 상세 개념 가이드 4: 실시간 UX 처리와 시각적 피드백
isValidating 상태를 활용하여 사용자가 "아, 시스템이 확인 중이구나"를 인지하게 만드는 것이 고급 아키텍처의 핵심입니다.

💻 실습 코드: formState를 활용한 실시간 상태 표시
/* [UX Integration]: formState를 활용한 실시간 상태 표시 */
const { register, formState: { isValidating, errors } } = useForm({
  mode: "onBlur" // 포커스가 나갈 때 검증을 시작하여 서버 부하를 줄입니다.
});

return (
  <div className="flex flex-col gap-2">
    <div className="relative">
      <input
        {...register("userId", {
          validate: async (v) => await checkIdDuplicate(v)
        })}
        className="border-2 p-3 w-full rounded-xl focus:border-blue-500 outline-none"
      />

      {/* 1. isValidating이 true일 때만 '확인 중' 로더를 보여줍니다. */}
      {isValidating && (
        <span className="absolute right-3 top-3 text-xs text-blue-500 animate-pulse font-bold">
          서버 확인 중...
        </span>
      )}
    </div>

    {/* 2. 검증 결과가 에러로 판명 났을 때만 메시지를 노출합니다. */}
    {errors.userId && (
      <p className="text-red-500 text-sm font-medium ml-1">
        {errors.userId.message as string}
      </p>
    )}
  </div>
);

🔍 상세 분석 및 UX 전략
조건부 렌더링:{isValidating && ...} 구문을 통해 네트워크 통신 중에만 로딩 텍스트나 스피너를 노출하여 사용자에게 진행 상황을 알립니다.
상태 고립: 비동기 검증은 일반적인 타이핑보다 무거운 작업입니다. 만약 폼 전체가 크다면 useWatch 등을 활용해 특정 필드의 검증 상태만 정밀하게 UI에 반영하는 것이 성능상 유리합니다.
💡 시니어 아키텍트의 실전 팁: 성능 최적화 전략
모든 타이핑(onChange)마다 서버에 중복 확인 요청을 보내면 서버 비용이 폭증하고 사용자 환경도 느려집니다. 설계에서는 다음 두 가지를 고려하세요.

onBlur 모드 사용: 사용자가 입력을 완전히 마치고 다음 칸으로 넘어갔을 때만 서버에 물어봅니다.
useForm({ mode: "onBlur" })
디바운싱(Debouncing): 사용자가 입력을 멈추고 약 0.5초가 지났을 때만 서버에 요청을 보냅니다. 실시간 피드백을 주면서도 서버 부하를 획기적으로 줄이는 가장 세련된 방식입니다.
