# 38강. useId -- 하이드레이션을 지키는 고유 정체성 부여 전략

## 도입

`Math.random()` 같은 무작위 숫자를 사용했을 때 서버와 브라우저의 아이디가 달라져 발생하는 '하이드레이션 불일치' 오류가 치명적인 문제가 된다. 이러한 혼란 속에서 우리를 구원해 줄 비밀 무기이자, 두 세계를 완벽하게 연결하는 `useId`의 신택스와 실전 활용법을 파헤쳐 본다.

## 개념 설명

### 트리 기반 ID 생성

- **ID 발급**: `useId()`를 호출하면 리액트는 해당 컴포넌트의 트리 내 절대적 위치를 기반으로 아이디를 만든다.
- **일관성 유지**: 서버에서 계산한 위치와 브라우저에서 계산한 위치가 같으므로, 양쪽에서 생성되는 아이디는 100% 일치한다.
- **접근성 결합**: `htmlFor`와 `id`를 동일한 값으로 묶어 사용자 편의성을 극대화한다.

### 접미사(Suffix) 전략

하나의 컴포넌트 내에 여러 입력창이 있을 때, `useId`를 남발하지 않고 하나의 뿌리 아이디로 관리하는 효율적인 기법이다.

1. **루트 ID 생성**: 하나의 기준이 되는 `baseId`를 발급받는다.
2. **접미사 결합**: 고유한 `baseId` 뒤에 `-lastName`, `-firstName` 같은 문자열을 덧붙여 하위 아이디들을 파생시킨다.
3. **유일함 보장**: 뿌리가 이미 유일하므로, 뒤에 무엇을 붙여도 결과물은 전체 페이지에서 유일함이 보장된다.

## 코드 예제

### 웹 접근성을 위한 고유 ID 설계 (AccessibilityInput.jsx)

라벨(`label`)과 입력창(`input`)을 논리적으로 연결하여 시각 장애인을 위한 스크린 리더 환경을 개선한다.

```jsx
import { useId } from 'react';

export default function AccessibilityInput({ label }) {
  // 1. 컴포넌트 인스턴스 전용 고유 ID 발급 (예: ":r1:")
  const id = useId();

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* 2. htmlFor 속성을 통해 라벨과 입력창을 논리적으로 연결한다. */}
      <label htmlFor={id} style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        {label}
      </label>

      {/* 3. 동일한 ID를 input에 주입하여 웹 표준을 준수한다. */}
      <input
        id={id}
        type="text"
        placeholder="내용을 입력해주세요"
        style={{ padding: '10px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
      />
    </div>
  );
}
```

### 접미사 전략을 활용한 멀티 ID 관리 (RegistrationForm.jsx)

```jsx
import { useId } from 'react';

export default function RegistrationForm() {
  // 1. 하나의 기준이 되는 루트(Root) ID 발급
  const baseId = useId();

  return (
    <form style={{ padding: '30px', border: '1px solid #eee', borderRadius: '12px' }}>
      <h2 style={{ marginTop: 0 }}>회원 가입 정보</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 성(Last Name) 입력 영역 */}
        <section>
          <label htmlFor={baseId + '-lastName'} style={{ display: 'block' }}>성</label>
          <input id={baseId + '-lastName'} type="text" style={{ width: '100%', padding: '8px' }} />
        </section>

        {/* 이름(First Name) 입력 영역 */}
        <section>
          <label htmlFor={baseId + '-firstName'} style={{ display: 'block' }}>이름</label>
          <input id={baseId + '-firstName'} type="text" style={{ width: '100%', padding: '8px' }} />
        </section>
      </div>
    </form>
  );
}
```

## 코드 해설

### 왜 ID에 콜론(:)이 포함되어 있을까?

실제로 `useId`가 생성하는 문자열을 보면 `:r1:`처럼 콜론이 포함된 경우가 많다. 이는 의도적인 설계이다.

- **스타일링 방지**: CSS 선택자에서 콜론은 특수 문자로 취급되어 일반적인 방법으로는 스타일을 입히기 어렵다. 이는 개발자가 이 ID를 CSS에서 직접 선택해 스타일을 입히는 나쁜 습관을 방지하려는 리액트 팀의 배려이다.
- **관심사 분리**: ID는 오직 웹 접근성과 요소 간의 관계 형성을 위해서만 사용하고, 꾸미는 스타일은 클래스(`class`)나 데이터 속성으로 관리하도록 유도하는 것이다.

## 실무 비유

`useId`는 주민등록번호 발급 시스템과 같다. 같은 동네(트리 위치)에서 같은 순서로 태어나면 항상 같은 번호를 받게 되므로, 서버에서 발급한 번호와 브라우저에서 발급한 번호가 100% 일치한다.

## 핵심 포인트

- `useId`는 컴포넌트 트리 위치를 기반으로 서버/클라이언트 간 동일한 고유 ID를 보장한다.
- `htmlFor`와 `id` 연결은 웹 접근성의 기본이며, `useId`가 이를 안전하게 지원한다.
- 하나의 `baseId`에 접미사를 붙여 여러 아이디를 관리하는 전략으로 `useId` 남발을 방지할 수 있다.

## 자가 점검

- [ ] `useId`가 `Math.random()`과 달리 서버와 클라이언트에서 동일한 값을 보장하는 원리를 이해했는가?
- [ ] 라벨의 `htmlFor`와 인풋의 `id`를 연결하는 것이 왜 웹 접근성에 중요한지 파악했는가?
- [ ] 하나의 `baseId`에 접미사를 붙여 여러 아이디를 관리하는 전략을 마스터했는가?
- [ ] `RegistrationForm` 컴포넌트를 두 번 렌더링해 보고, 각 폼 내부의 아이디들이 서로 충돌하지 않고 다르게 생성되는지 확인했는가?
