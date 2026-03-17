[실습] 41강. [Solution] Zod + Schema: 데이터의 모양이 곧 검증 규칙이 되는 설계
지난 시간 우리는 React Hook Form의 register 함수 안에 직접 검증 규칙을 적어 넣는 선언적 검증을 배웠습니다. 하지만 필드가 수백 개가 넘어가고 동일한 검증 로직(이메일, 비밀번호 등)이 여러 폼에서 반복된다면 어떨까요? 매번 규칙을 복사해 붙여넣는 행위는 결국 유지보수의 재앙으로 이어집니다.

오늘은 이 복잡한 규칙들을 컴포넌트 밖으로 완전히 분리하여, 데이터 설계도 하나로 타입 정의와 검증을 동시에 끝내는 Zod 스키마 설계를 아주 기초적인 부분부터 심화 기능까지 낱낱이 파헤쳐 보겠습니다.

🛠️ 1. 라이브러리 설치 및 역할 이해
Zod를 사용하기 위해서는 두 가지 핵심 도구가 필요합니다. 각 도구가 시스템에서 수행하는 역할을 리스트로 정리했습니다.

npm install zod @hookform/resolvers
zod (검증 엔진): 데이터의 원형을 정의하는 "데이터 규정집"입니다. "이 값은 문자열이어야 하고, 이메일 형식이어야 한다"는 규칙을 만듭니다.
@hookform/resolvers (통역사): React Hook Form(상태 관리)과 Zod(검증) 사이를 연결하는 "중간 다리"입니다. Zod가 내놓는 에러 리포트를 RHF가 이해할 수 있는 형식으로 번역해 줍니다.
📖 상세 개념 가이드 1: Zod의 철학과 기본 문법
Zod는 "데이터의 모양이 곧 규칙이다"라는 철학을 가지고 있습니다. 라이브러리를 임포트하고 기본 타입을 선언하는 신택스를 하나하나 뜯어보겠습니다.

📍 z 객체와 원시 타입 선언
import { z } from 'zod'; // 1. Zod의 모든 검증 도구가 담긴 'z'를 임포트합니다.

const nameSchema = z.string(); // 2. "이 데이터는 반드시 문자열이어야 한다"고 선언합니다.
💡 구문 상세 설명 및 동작 원리

import { z } from 'zod': Zod 라이브러리는 모든 기능을 z라는 객체 안에 담아 제공합니다. 일종의 '도구 상자'라고 생각하시면 됩니다.
z.string(): 가장 기초적인 빌딩 블록입니다. 자바스크립트는 변수에 숫자가 들어올지 문자열이 들어올지 런타임 전까지 알 수 없지만, 이 구문을 통해 "문자열이 아니면 통과시키지 않겠다"는 강력한 성벽을 먼저 쌓는 것입니다.
기타 타입:z.number()는 숫자, z.boolean()은 참/거짓, z.object()는 여러 데이터가 묶인 객체를 정의할 때 사용합니다.
📖 상세 개념 가이드 2: Zod 마스터를 위한 핵심 기능 가이드
실무에서 마주치는 복잡한 비즈니스 로직을 Zod 메서드로 구현하는 방법입니다.

/* [Zod Master Reference]: 실무 핵심 기능 정밀 분석 */
import { z } from 'zod';

// 1. 숫자 범위 (Number Range)
const ageSchema = z.number().min(19, "성인만 가입 가능합니다.").max(100, "나이를 확인해주세요.");

// 2. 열거형 (Enum)
const roleSchema = z.enum(["admin", "user", "guest"], {
  errorMap: () => ({ message: "권한을 반드시 선택해야 합니다." })
});

// 3. 선택 사항 (Optional & Nullable)
const nicknameSchema = z.string().optional();
const bioSchema = z.string().nullable();

// 4. 정규식 (Regex)
const phoneSchema = z.string().regex(/^\\\\d{3}-\\\\d{3,4}-\\\\d{4}$/, "010-0000-0000 형식을 지켜주세요.");

// 5. 문자열 변형 (Transformations)
const emailTrimSchema = z.string().trim().toLowerCase().email("이메일 형식이 아닙니다.");

// 6. 교차 검증 (Refine)
const passwordConfirmSchema = z.object({
  password: z.string().min(8),
  confirm: z.string()
}).refine((data) => data.password === data.confirm, {
  message: "비밀번호가 서로 일치하지 않습니다.",
  path: ["confirm"]
});

💡 구문 상세 설명 및 동작 원리

체이닝(Chaining): Zod의 모든 메서드는 점(.)으로 연결됩니다. .trim().email()처럼 작성하면 먼저 공백을 깎아낸 뒤 이메일인지 검사합니다. 앞의 검사가 실패하면 뒤는 실행하지 않고 즉시 에러를 반환합니다.
errorMap (Enum): Zod의 기본 영어 에러 메시지를 우리가 원하는 한국어 메시지로 덮어쓰는 우아한 방법입니다.
refine과 path:refine은 객체 전체를 인자로 받아 필드 사이의 관계를 대조합니다. 이때 path: ["confirm"]을 지정하면 에러 메시지가 폼 전체가 아닌 '비밀번호 확인' 인풋 밑에 정확히 나타납니다.
📖 상세 개념 가이드 3: 스키마 설계와 타입 추출 (z.infer)
이제 실제 설계도를 파일로 분리합니다. 이곳은 컴포넌트로부터 비즈니스 로직이 완전히 격리되는 '관심사 분리'의 핵심 장소입니다.

📄 [File Path]: src/schemas/authSchema.ts
import { z } from 'zod';

// 1. 설계도(Schema) 정의: 데이터가 흘러갈 '규정집'입니다.
export const signupSchema = z.object({
  email: z.string()
    .min(1, "이메일은 필수 입력 사항입니다.")
    .email("유효한 이메일 형식이 아닙니다."),

  password: z.string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
    .regex(/[A-Z]/, "대문자를 최소 하나 포함해야 합니다.")
    .regex(/[0-9]/, "숫자를 최소 하나 포함해야 합니다."),

  passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),

  role: z.enum(["user", "creator"], {
    errorMap: () => ({ message: "가입 유형을 선택해주세요." })
  }),

  age: z.number().min(14, "만 14세 이상만 가입 가능합니다.")
}).refine((data) => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["passwordConfirm"],
});

// 2. [Magic] z.infer를 통해 스키마로부터 타입을 자동으로 추출합니다.
export type SignupInput = z.infer<typeof signupSchema>;

💡 구문 상세 설명 및 동작 원리

z.object({ ... }): 여러 필드를 묶어 하나의 큰 덩어리(객체)로 검증합니다. 회원가입 폼 전체를 하나의 '단위'로 취급하게 해줍니다.
z.infer<typeof schema> (타입 추출): Zod의 가장 강력한 기능입니다. 우리가 만든 설계도를 분석해서 자동으로 TypeScript 인터페이스를 만들어줍니다.
배경: 이제 설계도(signupSchema)가 바뀌면 타입(SignupInput)도 자동으로 변합니다. 타입과 검증 로직이 불일치해서 발생하는 런타임 에러를 원천 차단하는 '단일 진실 공급원(Single Source of Truth)'이 구축된 것입니다.
🔗 상세 개념 가이드: useForm 설정의 심층 분석
이제 설계한 Zod 보안 요원을 React Hook Form 엔진에 장착합니다. 이 짧은 코드는 폼 엔진의 유전자(Type)와 동작 방식(Strategy)을 결정합니다.

const { ... } = useForm<SignupInput>({
  resolver: zodResolver(signupSchema),
  mode: "onChange"
});

설정 항목 상세 가이드

제네릭 <SignupInput>: 폼 엔진에게 "이 폼은 오직 이 타입의 데이터만 다룬다"고 명령합니다. 이 덕분에 register("email") 대신 오타를 내면 타입스크립트가 즉시 잡아냅니다.
resolver (통역사): RHF라는 '상태 엔진'에 Zod라는 '검증 엔진'을 이식하는 플러그인 소켓입니다. 입력이 발생할 때마다 리졸버가 작동하여 에러를 판별합니다.
mode: "onChange" (전략): 사용자가 글자를 입력할 때마다 실시간으로 검증을 수행합니다. RHF는 비제어 방식이므로 매 타이핑마다 화면 전체가 리렌더링되지 않으며, 오직 에러 상태에 변화가 생길 때만 정밀하게 해당 부분만 다시 그립니다.
💻 상세 개념 가이드 4: UI 구현
컴포넌트는 이제 로직으로부터 자유로워졌습니다. 오직 '출력'에만 집중합니다.

📄 [File Path]: src/components/SignupForm.tsx
import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '../schemas/authSchema';

export default function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onChange"
  });

  const onSubmit: SubmitHandler<SignupInput> = (data) => {
    console.log("🚀 검증 통과! 정제된 데이터:", data);
  };

  return (
    <div style={containerStyle}>
      <h2>Premium Signup</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>

        <div style={groupStyle}>
          <label style={labelStyle}>Email</label>
          {/* register 내부가 깨끗해졌습니다. 규칙은 이미 스키마에 정의되어 있기 때문입니다. */}
          <input {...register("email")} placeholder="example@mail.com" style={inputStyle} />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Password</label>
          <input type="password" {...register("password")} placeholder="********" style={inputStyle} />
          {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
        </div>

        <button type="submit" style={buttonStyle}>Create Account</button>
      </form>
    </div>
  );
}

// 스타일 정의 (내용 유지)
const containerStyle = { padding: '40px', maxWidth: '420px', margin: '50px auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' };
const formStyle = { display: 'flex', flexDirection: 'column' as const, gap: '20px' };
const groupStyle = { display: 'flex', flexDirection: 'column' as const, gap: '6px' };
const labelStyle = { fontSize: '13px', fontWeight: 'bold', color: '#555' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' };
const errorStyle = { color: '#ff4d4f', fontSize: '12px', margin: '4px 0 0 4px' };
const buttonStyle = { padding: '14px', backgroundColor: '#007aff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
