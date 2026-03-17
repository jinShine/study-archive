[실습] 40강. [Solution] 선언적 검증: if문 없이 완성하는 우아한 에러 핸들링
지난 시간 우리는 리액트의 기본 기능만으로 검증 로직을 구현하려다 마주친 그 끔찍한 스파게티 코드의 현장을 함께 목격했습니다. 정규표현식이라는 난해한 암호와 useEffect가 만들어내는 의존성 지옥, 그리고 글자 하나를 칠 때마다 화면이 두 번씩 다시 그려지는 성능 저하까지 정말 총체적인 난국이었죠.

특히 사용자가 값을 입력한 뒤 아주 미세한 시차를 두고 에러가 나타나는 동기화 지연(Sync Lag) 문제는 서비스의 완성도를 갉아먹는 치명적인 독이었습니다. 오늘은 이 모든 고통을 단 한 줄의 코드로 해결해 주는 선언적 검증(Declarative Validation)의 마법을 배워보겠습니다.

📖 상세 개념 가이드 1: 선언적 검증(Declarative Validation)이란?
우리가 지향해야 할 선언적 검증이란 "이메일 형식이 틀렸다면 에러 메시지 상태를 바꾸고, 아니라면 지워라"와 같이 컴퓨터에게 구체적인 행동 지침을 내리는 명령형 방식에서 벗어나는 것을 의미합니다. 대신 "이 필드는 필수값이고, 이메일 형식을 따라야 해"라고 규칙 자체를 선언하는 방식입니다.

💡 시니어의 비유
주방장에게 "바닥에 물이 있으면 닦고, 기름이 있으면 세제로 치워라"라고 일일이 지시하는 것이 아니라, "주방은 항상 청결 등급 A를 유지해야 해"라고 명확한 기준을 던져주는 것과 같습니다. 기준만 명확하다면 청소는 시스템이 알아서 수행합니다.

📖 상세 개념 가이드 2: 엔진 설정과 검증 모드(Mode)
이 마법 같은 시스템을 가능하게 하는 핵심 도구는 register 함수의 두 번째 인자입니다. 하지만 그전에, 검증이 언제 일어날지 결정하는 전략을 먼저 세워야 합니다.

/* [Concept Code]: useForm 초기 설정 */
const { 
  register, 
  handleSubmit, 
  watch, 
  formState: { errors } 
} = useForm<FormInputs>({
  // "onChange"로 설정하면 타이핑할 때마다 즉시 검증 결과가 업데이트됩니다.
  mode: "onChange"
});
🔍 상세 분석 및 동작 원리

배경: 사용자가 입력을 마치고 버튼을 누를 때까지 에러를 보여주지 않을 것인지(onSubmit), 아니면 입력 즉시 피드백을 줄 것인지(onChange) 결정해야 합니다. 실무에서는 사용자 경험(UX)을 위해 onChange나 onTouched를 선호합니다.
동작 원리 (검증 타이밍):onChange 모드는 일반적인 리액트의 onChange와 다릅니다. 컴포넌트 전체를 매번 다시 그리는 대신, 내부적으로 DOM 이벤트를 가로채서 규칙과 대조한 뒤 오직 에러 상태에 변화가 생길 때만 리액트에게 신호를 보냅니다.
에러 객체(errors):formState 내부의 errors는 평소엔 비어있다가 규칙 위반 시 필드 이름을 키(Key)로 메시지를 담습니다.
Proxy 기술: RHF는 Proxy(대리인) 기술을 사용합니다. 리액트가 폼 전체를 무식하게 감시하는 것이 아니라, 우리가 errors.email처럼 특정 필드에 접근하는 그 '순간'을 포착하여 해당 데이터가 변했을 때만 정밀하게 리렌더링을 일으킵니다.
💻 실습 1단계: 기본 규칙 적용 (필수값 & 패턴)
이제 지저분한 regex.test()를 걷어내고 pattern 속성을 사용해 보겠습니다. 이는 내부적으로 대조 작업을 자동화하는 선언적 도구입니다.

/* [File Path]: src/components/CleanValidationForm.tsx (일부) */

<div>
  <input
    {...register("email", {
      // 1. 필수 여부 선언
      required: "이메일은 필수 입력 항목입니다.",
      // 2. 정규표현식 패턴 선언 (내부적으로 test() 자동 수행)
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/,
        message: "올바른 이메일 형식이 아닙니다."
      }
    })}
    placeholder="이메일"
  />
  {/* 별도의 에러 상태 관리 없이 errors 객체에서 즉시 꺼내 씁니다. */}
  {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
</div>
🔍 구문 신택스 및 pattern 심화 가이드

required: 값이 비어있을 때 보여줄 메시지를 직접 문자열로 적습니다. 폼 제출 시 이 값이 비어있으면 handleSubmit이 실행되지 않습니다.
pattern 속성 (동작 방식):
역할: HTML5의 원시 pattern 속성을 확장한 것으로, JavaScript의 RegExp.test() 메소드를 내부적으로 호출합니다.
신택스:{ value: 정규식, message: 에러문구 } 구조를 가집니다.
활용법: 이메일뿐만 아니라 전화번호(/\\\\d{3}-\\\\d{4}-\\\\d{4}/), 특수문자 포함 여부 등 복잡한 문자열 규칙을 검증할 때 사용합니다. 수동으로 if (regex.test(value))를 작성할 필요 없이, 엔진이 입력값이 바뀔 때마다 정규식과 대조하여 결과가 false면 즉시 errors 객체에 message를 주입합니다.
💻 실습 2단계: 길이 제한 및 커스텀 검증 (watch & validate)
우리가 지난 시간 가장 괴로워했던 비밀번호 확인(의존성 지옥) 로직을 validate와 watch로 해결해 보겠습니다.

/* [File Path]: src/components/CleanValidationForm.tsx (계속) */

<div>
  <input
    type="password"
    {...register("password", {
      required: "비밀번호를 입력해주세요.",
      // 3. 최소 길이 제한 선언
      minLength: { value: 8, message: "최소 8자 이상이어야 합니다." }
    })}
    placeholder="비밀번호"
  />
  {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
</div>

<div>
  <input
    type="password"
    {...register("passwordConfirm", {
      required: "비밀번호 확인이 필요합니다.",
      // 4. 커스텀 검증: watch('password')로 실시간 대조
      validate: (value) => value === watch('password') || "비밀번호가 일치하지 않습니다."
    })}
    placeholder="비밀번호 확인"
  />
  {errors.passwordConfirm && <p style={{ color: 'red' }}>{errors.passwordConfirm.message}</p>}
</div>
🔍 상세 분석 및 동작 원리

minLength: 문자열 길이를 체크하는 비즈니스 로직을 속성 하나로 해결합니다. 수동으로 .length를 체크하던 if문을 대체합니다.
watch 함수: 특정 필드의 현재 값을 실시간으로 훔쳐보는 망원경입니다. watch('password')는 비밀번호 필드와 이 검증 로직 사이에 직통 전화선(구독)을 연결합니다.
validate (커스텀 검증의 핵심): 불리언 값을 반환하는 함수를 작성합니다. true를 반환하면 합격, false나 문자열을 반환하면 불합격입니다. 문자열을 반환하면 그 내용이 그대로 에러 메시지가 됩니다. 복잡한 useEffect 의존성 배열을 고민할 필요가 전혀 없습니다.
📖 상세 개념 가이드 3: 파수꾼 handleSubmit의 보안 검사
handleSubmit은 우리가 만든 실제 제출 로직을 감싸 안는 고차 함수(Higher-Order Function)입니다.

/* [Concept Code]: handleSubmit의 구조 */

// 1. 우리가 실행하고 싶은 알맹이 함수(onSubmit)
const onSave: SubmitHandler<FormInputs> = (data) => {
  console.log("검문 통과! 서버로 전송합니다:", data);
};

// 2. 파수꾼(handleSubmit)이 알맹이를 감싸서 보호합니다.
<form onSubmit={handleSubmit(onSave)}>
  <button type="submit">제출</button>
</form>
🔍 상세 분석 및 동작 원리

배경: 전통적인 리액트 방식에서는 e.preventDefault()를 직접 적고, 모든 if문을 통과해야만 서버 전송 로직을 실행했습니다. 이 과정에서 개발자가 실수로 하나라도 빼먹으면 잘못된 데이터가 서버로 날아가는 대참사가 발생합니다.
동작 원리: > 1. 가로채기: 사용자가 버튼을 누르면 브라우저의 기본 제출 이벤트를 handleSubmit이 먼저 가로챕니다.
검문(Validation):register에 등록된 모든 규칙(required, pattern 등)을 전수 조사합니다.
결정: > * 에러가 하나라도 있다면? 우리가 만든 onSave를 아예 실행시키지 않고 errors 객체만 업데이트합니다.
모든 데이터가 안전하다면? 그제서야 깨끗하게 정제된 data 객체를 onSave의 인자로 넘겨주며 호출합니다.
상세 설명: 여기서 handleSubmit이 고차 함수인 이유는 "함수(onSave)를 인자로 받아서, 보안 로직이 추가된 새로운 함수를 반환"하기 때문입니다. 덕분에 우리는 비즈니스 로직(onSave)에만 집중할 수 있습니다.
