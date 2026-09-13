# 폼(Form) 처리와 유효성 검증 심화 · 제어 vs 비제어 · React Hook Form · Zod · 폼 접근성

> 주제: 신입~주니어 프론트엔드가 면접에서 "useState로 input value 묶어서 폼 만들어 봤어요"를 넘어 "**제어/비제어 컴포넌트의 차이를 React의 데이터 흐름 관점에서 설명하고**, 타이핑마다 리렌더링이 왜 생기며 어떻게 격리하는지, React Hook Form이 어떤 원리로 리렌더링을 줄이는지, 검증을 언제(onChange/onBlur/onSubmit)·어디서(클라이언트/서버) 해야 하는지, 스키마 검증(Zod)으로 타입과 런타임 검증을 어떻게 한 소스로 묶는지, 그리고 폼을 **접근성 있게**(label·aria-invalid·에러 안내·포커스) 만드는 법을 설계 수준으로 설명할 줄 안다"를 보여주는 심화 — 제어 vs 비제어 컴포넌트, 폼 상태의 성격과 리렌더링 비용, React Hook Form의 내부 원리(ref 기반 + 구독형 formState), 검증 타이밍 전략과 클라이언트/서버 이중 검증, Zod 스키마와 타입 추론, 브라우저 네이티브 검증(Constraint Validation API), 폼 접근성, 파일 업로드, React 19 폼 액션, 흔한 함정
> 출처: 일일 심화 자료 (기존 1.html.md의 폼/입력 요소 기초, 4.react_next.md Q58 "컴포넌트 간 통신"·Q59 "성능 최적화", 07-16 리렌더링 최적화 편, 07-17 접근성 편, 07-18 TypeScript 편, 07-19 상태 관리 편, 08-09 React Hooks 편을 **"사용자 입력을 받는 화면"이라는 실무 주제로 묶어 확장한 편**. daily 폴더 최초의 폼 전용 심화)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화
> ※ 본 문서는 React 18/19 안정(stable) API 기준입니다. React Hook Form은 v7 계열, Zod는 v3 계열 API를 예시로 씁니다. 라이브러리 API는 메이저 버전에서 바뀔 수 있으니 실제 도입 시 해당 버전 공식 문서를 확인하세요.

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-제어-컴포넌트와-비제어-컴포넌트의-차이가-뭔가요) | 제어 vs 비제어 컴포넌트 · 무엇이 진실의 원천인가 | 🔴 |
| [D2](#d2-제어-컴포넌트로-폼을-만들면-타이핑할-때마다-리렌더링되는데-괜찮은가요) | 폼 리렌더링 비용 · 상태 격리 전략 | 🔴 |
| [D3](#d3-react-hook-form은-어떤-원리로-리렌더링을-줄이나요) | React Hook Form 내부 원리 (ref + 구독형 formState) | 🔴 |
| [D4](#d4-유효성-검증은-언제-어디서-해야-하나요) | 검증 타이밍(onChange/onBlur/onSubmit)과 클라이언트/서버 이중 검증 | 🔴 |
| [D5](#d5-zod-같은-스키마-검증-라이브러리는-왜-쓰나요) | 스키마 검증 · 타입 추론 · 단일 진실 공급원 | 🟡 |
| [D6](#d6-폼을-접근성-있게-만들려면-무엇을-해야-하나요) | 폼 접근성 (label·aria-invalid·에러 안내·포커스) | 🔴 |
| [D7](#d7-브라우저-기본-폼-기능은-어디까지-해주나요-constraint-validation-api) | 네이티브 폼 검증 · Constraint Validation API | 🟡 |
| [D8](#d8-파일-업로드와-이미지-미리보기는-어떻게-구현하나요) | 파일 업로드 · 미리보기 · 진행률 | 🟡 |
| [D9](#d9-react-19의-폼-액션useactionstate은-기존-방식과-무엇이-다른가요) | React 19 폼 액션 · `useActionState` · `useFormStatus` | 🟢 |
| [D10](#d10-폼-구현에서-흔히-겪는-함정과-실전-체크리스트) | 흔한 함정과 실전 체크리스트 | 🟡 |

---

## D1. 제어 컴포넌트와 비제어 컴포넌트의 차이가 뭔가요? 🔴

**💬 30초 답변**
> **제어 컴포넌트(controlled)** 는 입력값의 **진실의 원천(single source of truth)이 React state**인 방식입니다. `value={state}` + `onChange={e => setState(e.target.value)}`로 묶어서, 화면에 보이는 값이 항상 state와 일치합니다. **비제어 컴포넌트(uncontrolled)** 는 진실의 원천이 **DOM 자신**입니다. 브라우저가 input 내부에 값을 들고 있고, React는 필요할 때 `ref`나 `FormData`로 그 값을 읽어 옵니다. 제어 방식은 입력 중 실시간 검증·포맷팅·다른 UI 연동처럼 **"값이 바뀔 때마다 뭔가 해야 할 때"** 유리하고, 비제어 방식은 **제출 시점에만 값이 필요할 때** 리렌더링 없이 가볍게 처리할 수 있습니다. 실무에서는 폼 라이브러리가 기본을 비제어로 두고, 필요한 필드만 구독해 제어처럼 쓰는 **혼합 전략**을 많이 씁니다.

**📖 핵심 개념**

🎯 **비유**: 제어 컴포넌트는 **비서에게 받아쓰기를 시키는 사장님**입니다. 손님이 한 글자 말할 때마다 비서(onChange)가 사장님 수첩(state)에 적고, 화면에는 **사장님 수첩을 그대로 옮겨 보여줍니다**(value). 수첩에 없는 글자는 화면에도 절대 안 나타납니다. 비제어 컴포넌트는 **손님이 직접 종이(DOM)에 쓰게 두는** 방식입니다. 사장님은 다 쓰고 나면(submit) 그 종이를 걷어 가서 읽습니다. 매 글자마다 사장님이 개입하지 않으니 조용하고 빠르지만, 중간에 무슨 글자가 쓰였는지는 모릅니다.

📌 **왜 "제어"라는 이름인가**: React가 DOM의 값을 **덮어쓸 권한을 가진다**는 뜻입니다. `value` prop이 주어지면 사용자가 아무리 타이핑해도 리렌더링 후 값은 언제나 `value`로 되돌아갑니다. 그래서 `value`만 주고 `onChange`를 안 주면 **입력이 아예 안 되는 것처럼 보이는** 유명한 버그가 생깁니다(React가 개발 모드에서 경고를 띄웁니다). 읽기 전용 의도라면 `readOnly`를 함께 주거나 `defaultValue`를 써야 합니다.

📌 **비교표**

| 항목 | 제어 컴포넌트 | 비제어 컴포넌트 |
|---|---|---|
| 값의 진실의 원천 | React state | DOM 노드 |
| 값 읽기 | `state` 변수 | `ref.current.value` 또는 `FormData` |
| 초기값 지정 | `value` | `defaultValue` / `defaultChecked` |
| 입력마다 리렌더링 | 발생 | 발생하지 않음 |
| 실시간 검증·포맷팅 | 쉬움 | 어려움(직접 이벤트 처리 필요) |
| 조건부 비활성/연동 UI | 쉬움 | 번거로움 |
| 코드량 | 많음 | 적음 |
| 적합한 상황 | 입력 중 상호작용이 필요한 폼 | 제출 시점에만 값이 필요한 단순 폼 |

```jsx
// 제어 컴포넌트 — value의 주인은 React state
function ControlledInput() {
  const [email, setEmail] = useState('');
  // 입력할 때마다 이 컴포넌트가 리렌더링된다.
  // 대신 email 값을 언제든 읽고, 실시간으로 검증/가공할 수 있다.
  const isInvalid = email.length > 0 && !email.includes('@');

  return (
    <>
      <input
        value={email}                                  // React가 값을 "제어"
        onChange={(e) => setEmail(e.target.value)}     // 반드시 함께 있어야 입력이 반영됨
      />
      {isInvalid && <p>이메일 형식이 아닙니다.</p>}
    </>
  );
}
```

```jsx
// 비제어 컴포넌트 — value의 주인은 DOM
function UncontrolledForm() {
  const emailRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 제출 시점에 DOM에서 값을 "읽어" 온다. 타이핑 중에는 리렌더링이 전혀 없다.
    console.log(emailRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={emailRef} defaultValue="" name="email" />
      <button type="submit">제출</button>
    </form>
  );
}
```

```jsx
// 비제어 + FormData — ref조차 없이 name만으로 전체 폼 값을 한 번에 수집
function FormDataForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);   // name 속성 기준으로 수집
    const data = Object.fromEntries(formData);        // { email: '...', password: '...' }
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />             {/* name이 없으면 FormData에 안 담긴다 */}
      <input name="password" type="password" />
      <button type="submit">제출</button>
    </form>
  );
}
```

📌 **"제어 ↔ 비제어 전환" 경고**: `value={undefined}`로 시작했다가 나중에 값이 생기면 React가 *"A component is changing an uncontrolled input to be controlled"* 경고를 냅니다. 서버에서 받은 초기값을 `value`에 바로 꽂을 때 자주 겪습니다. 해결은 **처음부터 빈 문자열로 초기화**(`value={data?.name ?? ''}`)하거나, 데이터가 로드된 뒤에 폼을 마운트하는 것입니다.

**🔥 예상 꼬리질문**

**Q. 그럼 실무에서는 어느 쪽을 기본으로 하나요?**
A. "매 입력마다 값을 알아야 하는가"로 판단합니다. 검색어 자동완성, 실시간 글자 수 카운트, 입력값에 따라 다른 필드를 보여주는 폼 → 제어. 로그인·회원가입처럼 제출 시점에만 값이 필요한 폼 → 비제어(또는 폼 라이브러리)로 두면 성능과 코드량 모두 이득입니다. 규모가 커지면 React Hook Form 같은 라이브러리로 **기본은 비제어, 필요한 필드만 구독**하는 방식이 사실상 표준입니다.

**Q. 제어 컴포넌트의 값을 프로그래밍으로 초기화(reset)하려면요?**
A. 제어라면 `setState('')` 한 줄이면 됩니다. 비제어라면 `formRef.current.reset()`(폼 전체를 `defaultValue`로 되돌림)을 쓰거나, 컴포넌트에 `key`를 바꿔 주어 **강제로 새 인스턴스를 마운트**하는 방법이 있습니다. `key` 변경 리셋은 "이 사용자 폼을 다른 사용자 폼으로 갈아끼울 때" 특히 유용한 React 관용구입니다.

**Q. `<input type="file">`은 왜 제어 컴포넌트로 못 만드나요?**
A. 보안 때문입니다. 파일 input의 `value`를 스크립트로 임의 지정할 수 있으면, 웹사이트가 사용자 몰래 특정 경로의 파일을 업로드시킬 수 있습니다. 그래서 브라우저는 파일 input의 값 설정을 금지하며(빈 문자열로 초기화하는 것만 허용), **항상 비제어로만** 다뤄야 합니다. (D8에서 자세히)

<details><summary>📝 한 줄 요약</summary>
제어 컴포넌트는 값의 주인이 React state(입력마다 리렌더링, 실시간 상호작용에 유리), 비제어는 값의 주인이 DOM(리렌더링 없음, 제출 시 ref/FormData로 읽음)이다. "매 입력마다 값이 필요한가"로 고른다.
</details>

---

## D2. 제어 컴포넌트로 폼을 만들면 타이핑할 때마다 리렌더링되는데, 괜찮은가요? 🔴

**💬 30초 답변**
> 입력 하나짜리 작은 컴포넌트라면 전혀 문제가 안 됩니다. React의 리렌더링은 생각보다 싸고, 대부분의 폼에서 병목이 되지 않습니다. 문제는 **폼 state를 너무 위쪽 컴포넌트에 두었을 때** 생깁니다. 페이지 최상단에 `const [form, setForm] = useState({...})`를 두면, 한 글자 칠 때마다 **그 아래 전체 트리(무거운 테이블, 차트, 리스트까지)가 리렌더링**됩니다. 해법은 우선순위대로 ① **state를 실제로 쓰는 가장 낮은 컴포넌트로 내리기(상태 격리)**, ② 형제 트리를 `children`으로 넘겨 리렌더링에서 분리하기, ③ 정말 필요한 곳에만 `memo`, ④ 그래도 무거우면 **비제어/폼 라이브러리로 전환**입니다. `useMemo`/`useCallback`을 먼저 뿌리는 건 대개 잘못된 순서입니다.

**📖 핵심 개념**

🎯 **비유**: 사무실에서 누가 이름표 하나를 고쳤다고 **건물 전체에 화재경보(전체 리렌더링)** 를 울리는 상황입니다. 경보 자체를 없애려 애쓰기(memo 남발)보다, **경보기의 관할 구역을 그 방으로 좁히는 것(상태를 아래로 내리기)** 이 근본 해법입니다.

📌 **상태를 아래로 내린다(colocation)**: 07-16 리렌더링 최적화 편의 원칙이 폼에서 가장 극적으로 드러나는 지점입니다. "이 state를 실제로 읽는 컴포넌트가 어디인가"를 묻고, 그 지점까지 state를 내립니다.

```jsx
// 🚫 나쁨: state가 너무 위에 있어 타이핑 한 번에 페이지 전체가 리렌더링
function Page() {
  const [keyword, setKeyword] = useState('');
  return (
    <div>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <HeavyDashboard />   {/* keyword와 무관한데 매 글자마다 리렌더링됨 */}
    </div>
  );
}
```

```jsx
// ✅ 좋음: state를 쓰는 최소 단위로 격리
function SearchBox({ onSubmit }) {
  const [keyword, setKeyword] = useState('');   // 리렌더링 범위가 이 컴포넌트로 한정
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(keyword); }}>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
    </form>
  );
}

function Page() {
  return (
    <div>
      <SearchBox onSubmit={handleSearch} />
      <HeavyDashboard />   {/* 이제 타이핑에 영향받지 않음 */}
    </div>
  );
}
```

📌 **여러 필드를 하나의 객체 state로 관리할 때**: 필드마다 `useState`를 만드는 대신 객체 하나로 묶고 `name` 속성으로 일반화하면 코드가 훨씬 짧아집니다. 단, **업데이트는 반드시 불변하게(스프레드)** 해야 합니다.

```jsx
const [form, setForm] = useState({ name: '', email: '', message: '' });

const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));  // 함수형 업데이트 + 계산된 프로퍼티명
};

<input name="name"  value={form.name}  onChange={handleChange} />
<input name="email" value={form.email} onChange={handleChange} />
```

> ⚠️ `setForm({ ...form, [name]: value })`처럼 **prev 대신 클로저의 `form`을 참조**하면, 짧은 시간에 여러 번 업데이트될 때 오래된 값(stale closure)을 기반으로 덮어쓸 수 있습니다. 함수형 업데이트(`prev =>`)가 안전합니다. (08-09 Hooks 편의 stale closure 참고)

📌 **필드가 많고 상태 전이가 복잡하면 `useReducer`**: "비밀번호를 바꾸면 확인 필드의 에러도 지운다" 같은 **연관 규칙**이 늘어나면 `useState` 여러 개보다 리듀서 하나가 읽기 쉽습니다. 상태 변경 규칙이 한곳에 모여 테스트하기도 좋습니다.

📌 **입력마다 비싼 작업(API 호출·무거운 계산)은 반드시 늦춘다**: 검색어 자동완성은 매 글자마다 요청을 보내면 안 됩니다. **디바운스(debounce)** 로 "입력이 멈춘 뒤 300ms"에 한 번만 호출하고, 화면 갱신 우선순위를 낮추고 싶으면 React 18의 `useDeferredValue`를 씁니다. (3.js.md Q53 디바운싱/스로틀링, 07-30 동시성 편 참고)

```jsx
function SearchWithDeferred() {
  const [keyword, setKeyword] = useState('');
  // 입력창은 즉시 반응(긴급), 무거운 결과 목록은 뒤늦게 따라옴(비긴급)
  const deferredKeyword = useDeferredValue(keyword);

  return (
    <>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <HeavyResultList keyword={deferredKeyword} />
    </>
  );
}
```

**🔥 예상 꼬리질문**

**Q. `memo`를 붙이면 해결되지 않나요?**
A. 부분적으로만요. `memo`는 props가 얕은 비교로 같을 때 리렌더링을 건너뛰지만, 부모가 매 렌더마다 새 객체·새 함수를 props로 넘기면 무력화됩니다(그래서 `useCallback`까지 줄줄이 붙게 됩니다). **상태를 아래로 내리는 구조 변경**이 먼저이고, `memo`는 구조로 못 푸는 잔여 문제에 씁니다.

**Q. 그래도 부모에 state가 있어야 하는 상황이라면요?**
A. 형제 트리를 `children`으로 받으면 그 부분은 부모의 state 변경에 리렌더링되지 않습니다. `children`은 상위에서 이미 만들어진 엘리먼트라서, state가 바뀐 컴포넌트가 다시 렌더링돼도 **동일한 엘리먼트 참조가 그대로 전달**되기 때문입니다.

```jsx
function FormShell({ children }) {
  const [value, setValue] = useState('');
  return (
    <>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      {children}          {/* 부모에서 만들어져 내려온 엘리먼트 → 리렌더링 대상 아님 */}
    </>
  );
}
// 사용: <FormShell><HeavyDashboard /></FormShell>
```

**Q. 리렌더링이 몇 번 일어나는지 어떻게 확인하나요?**
A. React DevTools의 **Profiler**로 커밋별 렌더링 시간을, **"Highlight updates when components render"** 옵션으로 어떤 컴포넌트가 다시 그려지는지 시각적으로 확인합니다. 추측 말고 측정부터 하는 게 원칙입니다.

<details><summary>📝 한 줄 요약</summary>
폼 리렌더링 자체는 대개 싸다. 문제는 state를 너무 위에 둬서 무관한 트리까지 다시 그리는 것. 해법 순서는 상태 격리 → children 분리 → memo → 비제어 전환이며, 비싼 부수효과는 디바운스/useDeferredValue로 늦춘다.
</details>

---

## D3. React Hook Form은 어떤 원리로 리렌더링을 줄이나요? 🔴

**💬 30초 답변**
> 핵심은 두 가지입니다. 첫째, **입력을 기본적으로 비제어로 다룹니다.** `register('email')`이 반환하는 `ref`를 input에 연결해 DOM 노드를 직접 참조하고, 값은 라이브러리 내부 저장소에 담아둡니다. 그래서 **타이핑해도 React state가 안 바뀌고 리렌더링이 발생하지 않습니다.** 둘째, **`formState`를 Proxy로 구현한 구독 모델**입니다. 컴포넌트가 `formState.errors`를 실제로 읽었을 때만 "이 컴포넌트는 errors를 구독한다"고 기록하고, 그 값이 바뀔 때만 리렌더링합니다. 읽지 않은 필드나 상태는 아무리 바뀌어도 리렌더링을 유발하지 않습니다. MUI 같은 제어형 UI 라이브러리를 써야 할 때는 `<Controller>`로 그 필드만 제어 방식으로 감싸는 탈출구를 제공합니다.

**📖 핵심 개념**

🎯 **비유**: 일반 제어 폼이 **회의실 전체에 스피커로 모든 변경사항을 방송하는 것**이라면, React Hook Form은 **관심 있는 사람만 신청해 두는 구독형 알림**입니다. "에러 알림만 받겠다"고 신청한 사람은 값이 아무리 바뀌어도 조용하고, 에러가 생길 때만 알림을 받습니다.

📌 **`register`가 실제로 하는 일**: `register('email')`은 `{ name, onChange, onBlur, ref }` 객체를 반환하고, 이를 스프레드로 input에 펼칩니다. `ref` 콜백에서 DOM 노드를 라이브러리 내부 필드 목록에 등록하고, `onChange`/`onBlur`에서 값을 내부 저장소에 갱신하며 검증 타이밍을 판단합니다. **React state를 거치지 않으므로 리렌더링이 없습니다.**

```jsx
import { useForm } from 'react-hook-form';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },  // 구조분해로 "읽는" 순간 구독이 등록된다
  } = useForm({
    defaultValues: { email: '', password: '' },  // 항상 지정하는 습관을 들일 것
    mode: 'onBlur',                              // 검증 타이밍 (D4 참고)
  });

  const onSubmit = async (data) => {
    // data는 검증을 통과한 값 객체 { email, password }
    await login(data);
  };

  return (
    // handleSubmit이 preventDefault와 검증을 대신 처리해 준다
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="email">이메일</label>
      <input
        id="email"
        type="email"
        aria-invalid={errors.email ? 'true' : 'false'}
        aria-describedby={errors.email ? 'email-error' : undefined}
        {...register('email', {
          required: '이메일을 입력해 주세요.',
          pattern: { value: /^\S+@\S+\.\S+$/, message: '이메일 형식이 아닙니다.' },
        })}
      />
      {errors.email && (
        <p id="email-error" role="alert">{errors.email.message}</p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '로그인 중…' : '로그인'}
      </button>
    </form>
  );
}
```

📌 **`formState`가 Proxy인 이유**: 만약 `formState` 전체 변화에 반응했다면, `isDirty`·`touchedFields` 같은 값이 매 입력마다 바뀌므로 결국 매번 리렌더링됩니다. Proxy의 `get` 트랩으로 **"실제로 접근한 속성"만 구독 목록에 넣기 때문에**, `errors`만 읽은 컴포넌트는 `isDirty`가 바뀌어도 조용합니다. 그래서 **`formState.errors`처럼 점 표기로 매번 접근하지 말고, 구조분해로 한 번 꺼내 쓰는** 것이 권장 패턴입니다(둘 다 구독은 되지만, 조건부 접근 시 구독이 누락되는 실수를 막습니다).

📌 **값을 화면에 실시간으로 보여줘야 할 때**: `watch()`는 폼 컴포넌트 전체를 리렌더링시킵니다. 특정 필드만 필요하면 **`useWatch`** 를 별도의 작은 자식 컴포넌트에서 호출해 **리렌더링 범위를 그 자식으로 격리**합니다. D2의 "상태를 아래로 내린다"와 같은 원리입니다.

```jsx
// 글자 수 카운터만 리렌더링되고, 폼 나머지는 조용하다
function CharCount({ control }) {
  const message = useWatch({ control, name: 'message' });
  return <span>{message?.length ?? 0} / 200</span>;
}
```

📌 **`<Controller>` — 제어형 컴포넌트와의 다리**: MUI `TextField`, react-select, 커스텀 DatePicker처럼 `value`/`onChange` prop만 받는 컴포넌트는 `ref`를 꽂을 수 없습니다. 이때 `Controller`가 그 필드만 제어 방식으로 관리해 줍니다. 대가는 그 필드에 한해 리렌더링이 발생한다는 것입니다.

```jsx
<Controller
  name="country"
  control={control}
  rules={{ required: '국가를 선택해 주세요.' }}
  render={({ field, fieldState }) => (
    <Select {...field} error={!!fieldState.error} />   // field = { value, onChange, onBlur, name, ref }
  )}
/>
```

📌 **주요 API 한눈에**

| API | 역할 |
|---|---|
| `register(name, rules)` | 비제어 입력 등록 + 검증 규칙 지정 |
| `handleSubmit(onValid, onInvalid)` | `preventDefault` + 전체 검증 후 콜백 실행 |
| `formState.errors` | 필드별 에러 객체 |
| `formState.isSubmitting` | 제출 중 여부 (중복 제출 방지용) |
| `formState.isDirty` / `dirtyFields` | 초기값 대비 변경 여부 (변경분만 PATCH 보낼 때) |
| `formState.isValid` | 전체 유효 여부 (`mode: 'onChange'` 등 필요) |
| `watch` / `useWatch` | 값 구독 (후자가 리렌더링 범위 좁음) |
| `setValue` / `getValues` / `reset` | 값 프로그래밍 제어 |
| `setError` | 서버 검증 실패를 필드 에러로 주입 |
| `resolver` | Zod/Yup 등 스키마 검증 연결 (D5) |

**🔥 예상 꼬리질문**

**Q. 폼 라이브러리를 꼭 써야 하나요?**
A. 필드가 2~3개고 검증도 단순하면 순수 React로 충분합니다. 그러나 필드가 늘고 "필드별 에러 메시지 + blur 시 검증 + 제출 중 비활성 + 서버 에러 반영 + 동적 필드 추가/삭제"가 겹치기 시작하면, 직접 만든 코드는 금세 라이브러리를 어설프게 재구현한 모양이 됩니다. **경계는 "검증 규칙과 에러 표시가 여러 필드에 반복되기 시작할 때"** 라고 답하면 좋습니다.

**Q. `defaultValues`를 안 주면 무슨 일이 생기나요?**
A. 필드가 `undefined`로 시작해 제어/비제어 전환 경고, `isDirty` 오작동, `reset()` 시 예상과 다른 초기화가 생길 수 있습니다. 서버에서 받아온 값으로 폼을 채우는 수정(edit) 화면이라면, 데이터를 받은 뒤 `reset(serverData)`로 초기값을 다시 심는 것이 정석입니다.

**Q. 서버가 "이미 사용 중인 이메일입니다"라고 응답하면 어떻게 표시하나요?**
A. `setError('email', { type: 'server', message: '이미 사용 중인 이메일입니다.' })`로 해당 필드에 주입하면 클라이언트 검증 에러와 같은 UI로 보여줄 수 있습니다. 어떤 필드에도 속하지 않는 에러는 `setError('root.serverError', ...)`처럼 루트 에러로 두고 폼 상단에 표시합니다.

**Q. Formik과 뭐가 다른가요?**
A. Formik은 폼 값을 **React state로 관리하는 제어 방식**이 기본이라 입력마다 리렌더링이 발생합니다. React Hook Form은 비제어 + 구독 모델이라 큰 폼에서 렌더링 비용이 훨씬 적고 번들도 가볍습니다. 다만 Formik의 제어 방식이 개념적으로 더 단순해 학습 곡선이 완만하다는 평가도 있습니다. 최근 신규 프로젝트에서는 React Hook Form 채택이 일반적입니다.

<details><summary>📝 한 줄 요약</summary>
React Hook Form은 ①입력을 ref 기반 비제어로 다뤄 타이핑 시 리렌더링을 없애고, ②formState를 Proxy 구독 모델로 만들어 "실제로 읽은 상태"가 바뀔 때만 리렌더링한다. 제어형 UI 컴포넌트는 Controller로, 값 실시간 표시는 useWatch로 범위를 좁혀 처리한다.
</details>

---

## D4. 유효성 검증은 언제, 어디서 해야 하나요? 🔴

**💬 30초 답변**
> **"어디서"의 답은 항상 둘 다입니다.** 클라이언트 검증은 **UX(빠른 피드백)** 를 위한 것이고, 서버 검증은 **보안·데이터 무결성**을 위한 것입니다. 브라우저 검증은 개발자 도구나 curl로 얼마든지 우회되므로, **클라이언트 검증은 결코 보안 수단이 아닙니다.** **"언제"** 는 UX 연구에서 정착된 원칙이 있습니다. 아직 다 입력하지도 않았는데 첫 글자부터 빨간 에러를 띄우는 건(`onChange` 즉시 검증) 오히려 불쾌합니다. 권장 패턴은 **"처음에는 blur 시점(또는 제출 시점)에 검증하고, 한 번 에러가 난 필드는 그때부터 입력 중에도 실시간으로 재검증"** 하는 것입니다. React Hook Form의 `mode: 'onBlur'` + `reValidateMode: 'onChange'`가 정확히 이 조합입니다.

**📖 핵심 개념**

🎯 **비유**: 시험지를 걷기도 전에 옆에서 "1번 틀렸어!"라고 계속 외치면 짜증납니다(onChange 즉시 검증). 반대로 다 제출한 뒤에야 "10개 틀렸습니다"라고 하면 어디를 고쳐야 할지 막막합니다(onSubmit만). 좋은 감독관은 **한 문항을 다 풀고 넘어갈 때(blur) 알려 주고, 이미 틀렸다고 알려 준 문항은 고치는 즉시(onChange) "이제 맞았어요"라고 확인**해 줍니다.

📌 **검증 타이밍 옵션 비교**

| 모드 | 언제 검증 | 장점 | 단점 |
|---|---|---|---|
| `onSubmit` (기본) | 제출 시 | 입력 중 방해 없음 | 에러를 늦게 알게 됨 |
| `onBlur` | 포커스가 벗어날 때 | 자연스러운 타이밍 | 마우스로 바로 제출하면 늦음 |
| `onChange` | 입력할 때마다 | 즉시 피드백 | 다 입력하기 전에 에러 표시 → 불쾌 |
| `onTouched` | 첫 blur 이후 onChange | 균형 좋음 | — |
| `all` | blur + change 모두 | 가장 즉각적 | 리렌더링·소음 많음 |

```jsx
const { register, handleSubmit, formState: { errors } } = useForm({
  mode: 'onBlur',            // 처음엔 포커스가 벗어날 때 검증
  reValidateMode: 'onChange' // 한 번 에러가 난 뒤에는 입력 중 실시간 재검증
});
```

📌 **클라이언트 검증 = UX, 서버 검증 = 보안**: 이 문장은 면접에서 그대로 말해도 좋을 만큼 핵심입니다. 클라이언트 검증만 믿으면 다음이 뚫립니다.
- 브라우저 개발자 도구로 `disabled`·`maxlength` 속성 제거
- 폼을 거치지 않고 `fetch`/curl로 API 직접 호출
- `<form novalidate>` 삽입으로 네이티브 검증 무력화

서버는 **모든 입력을 신뢰하지 않는다(never trust the client)** 는 전제로 다시 검증하고, DB 제약(UNIQUE, NOT NULL)까지 걸어 두는 것이 정석입니다. (07-21 웹 보안 편에서 다룬 XSS 방어도 결국 "입력을 믿지 않는다"의 다른 표현입니다.)

📌 **검증 종류의 층위**
1. **형식(format)**: 이메일 모양인가, 숫자인가, 길이는 맞는가 → 클라이언트에서 즉시 가능
2. **비즈니스 규칙**: 비밀번호와 확인이 일치하는가, 시작일 < 종료일인가 → 클라이언트에서 가능(필드 간 검증)
3. **서버만 아는 사실**: 이미 가입된 이메일인가, 재고가 남아 있는가, 쿠폰이 유효한가 → **반드시 서버**

3번을 입력 중에 미리 확인해 주고 싶다면(중복 이메일 실시간 체크) **디바운스 + 비동기 검증**을 씁니다. 단, 이때도 최종 제출 시 서버가 다시 검증해야 합니다(체크한 사이에 남이 가입할 수 있으므로 — 경쟁 조건).

```jsx
// 비동기 검증 예시: 디바운스된 중복 확인
{...register('email', {
  required: '이메일을 입력해 주세요.',
  pattern: { value: /^\S+@\S+\.\S+$/, message: '이메일 형식이 아닙니다.' },
  validate: async (value) => {
    const { available } = await checkEmailAvailable(value);   // 실무에선 디바운스 래핑
    return available || '이미 사용 중인 이메일입니다.';        // true면 통과, 문자열이면 에러 메시지
  },
})}
```

📌 **필드 간(cross-field) 검증**: "비밀번호 확인"처럼 다른 필드 값을 참조해야 할 때는 `getValues`를 씁니다. 스키마 검증(Zod)이라면 `.refine()`으로 더 선언적으로 표현할 수 있습니다(D5).

```jsx
{...register('passwordConfirm', {
  validate: (value) =>
    value === getValues('password') || '비밀번호가 일치하지 않습니다.',
})}
```

📌 **에러 메시지 작성 원칙(UX 카피)**: "Invalid input" 같은 메시지는 도움이 안 됩니다. **무엇이 왜 잘못됐고 어떻게 고치는지**를 담습니다.
- 🚫 "형식이 올바르지 않습니다" → ✅ "비밀번호는 8자 이상이며 숫자를 1개 이상 포함해야 합니다"
- 🚫 "필수 항목입니다" → ✅ "배송받을 주소를 입력해 주세요"
- 규칙은 **에러가 나기 전에 미리** 알려 주는 것이 더 좋습니다(입력창 아래 힌트 텍스트).

**🔥 예상 꼬리질문**

**Q. 제출 버튼을 폼이 유효할 때까지 `disabled`로 막는 건 어떤가요?**
A. 흔하지만 접근성·UX 관점에서는 권장되지 않습니다. 사용자는 **왜 버튼이 안 눌리는지** 알 수 없고, 스크린 리더 사용자는 비활성 버튼을 건너뛰기도 합니다. **버튼은 항상 누를 수 있게 두고, 누르면 검증 결과와 첫 에러 필드로 포커스를 이동**시키는 편이 낫습니다. 다만 **제출 진행 중**(`isSubmitting`) 비활성화는 중복 제출 방지를 위해 타당합니다.

**Q. 실시간 검증이 성능에 부담이 되진 않나요?**
A. 형식 검증(정규식)은 사실상 무시할 만한 비용입니다. 부담이 되는 건 **비동기 검증(네트워크)** 이고, 이건 디바운스와 요청 취소(`AbortController`)로 다룹니다. 이전 요청이 늦게 도착해 최신 결과를 덮어쓰는 **경쟁 조건**을 반드시 처리하세요.

**Q. 서버 에러를 폼에 어떻게 매핑하나요?**
A. 서버가 `{ errors: { email: "이미 사용 중" } }`처럼 **필드 키 기준의 구조화된 에러**를 내려 주도록 API를 설계하고, 프론트는 그 키를 그대로 `setError(key, ...)`에 넣습니다. 문자열 하나만 내려오면 필드 매핑이 불가능해 폼 상단 배너로만 표시할 수밖에 없습니다. 이건 **백엔드와 사전에 합의할 인터페이스**라고 답하면 협업 감각까지 보여줄 수 있습니다.

<details><summary>📝 한 줄 요약</summary>
클라이언트 검증은 UX, 서버 검증은 보안 — 둘 다 필수다. 타이밍은 "blur에 첫 검증, 에러 이후엔 onChange 재검증"이 표준이며, 서버만 아는 사실(중복·재고)은 디바운스된 비동기 검증 + 제출 시 서버 재검증으로 다룬다.
</details>

---

## D5. Zod 같은 스키마 검증 라이브러리는 왜 쓰나요? 🟡

**💬 30초 답변**
> 검증 규칙을 각 필드의 props에 흩뿌리는 대신, **데이터의 모양(shape)을 하나의 스키마 객체로 선언**하고 그 스키마를 검증·타입·문서의 **단일 진실 공급원**으로 쓰기 위해서입니다. TypeScript의 타입은 **컴파일 타임에만 존재하고 런타임에는 사라지므로**, 서버 응답이나 사용자 입력이 실제로 그 타입인지 보장해 주지 못합니다. Zod는 **런타임에 실제로 검사**하면서, 동시에 `z.infer<typeof schema>`로 **그 스키마에서 TypeScript 타입을 추론**해 줍니다. 즉 타입 정의와 검증 로직이 따로 놀다 어긋나는 문제가 사라집니다. React Hook Form과는 `zodResolver`로 연결하고, **같은 스키마를 서버(API 핸들러)에서도 재사용**하면 클라이언트·서버 검증 규칙이 자동으로 일치합니다.

**📖 핵심 개념**

🎯 **비유**: TypeScript 타입은 **건물 설계도**입니다. 설계도상으로는 완벽하지만, 실제로 지어진 건물에 벽이 제대로 섰는지는 **현장 검사(런타임 검증)** 를 해야 압니다. Zod는 설계도이면서 동시에 **현장 검사관**입니다. 게다가 검사 기준서(스키마)에서 설계도(타입)를 자동으로 뽑아내므로, 둘이 어긋날 수가 없습니다.

📌 **타입만으로는 부족한 이유**: 07-18 TypeScript 편에서 다룬 대로, `as` 단언이나 `any` 경유로 들어온 값은 타입 체커를 통과해도 실제 값은 다를 수 있습니다. `fetch` 응답에 `as User[]`를 붙이는 순간, 그건 **"검증"이 아니라 "약속"** 일 뿐입니다. 서버 API가 필드명을 바꿨는데 프론트는 타입만 믿고 있다가 런타임에 `undefined.map is not a function`으로 터지는 사고가 대표적입니다.

```ts
import { z } from 'zod';

// 1) 스키마 = 검증 규칙 + 타입의 단일 소스
export const signUpSchema = z
  .object({
    email: z.string().min(1, '이메일을 입력해 주세요.').email('이메일 형식이 아닙니다.'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .regex(/[0-9]/, '숫자를 1개 이상 포함해야 합니다.'),
    passwordConfirm: z.string(),
    age: z.coerce.number().int().min(14, '만 14세 이상만 가입할 수 있습니다.'),
    //   ^ coerce: input에서 오는 문자열 "20"을 숫자로 변환한 뒤 검증
    terms: z.literal(true, { errorMap: () => ({ message: '약관에 동의해 주세요.' }) }),
  })
  // 2) 필드 간 검증은 refine으로 선언적으로
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],   // 어느 필드의 에러로 붙일지 지정
  });

// 3) 스키마에서 타입을 "추론" — 타입을 따로 손으로 쓰지 않는다
export type SignUpInput = z.infer<typeof signUpSchema>;
// { email: string; password: string; passwordConfirm: string; age: number; terms: true }
```

```tsx
// 4) React Hook Form과 연결
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm<SignUpInput>({
  resolver: zodResolver(signUpSchema),   // 검증을 스키마에 위임
  mode: 'onBlur',
  defaultValues: { email: '', password: '', passwordConfirm: '' },
});
```

```ts
// 5) 같은 스키마를 서버에서도 재사용 (Next.js Route Handler 예시)
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signUpSchema.safeParse(body);   // 예외를 던지지 않고 결과 객체를 반환

  if (!parsed.success) {
    // flatten()으로 { fieldErrors: { email: ['...'] } } 형태를 얻어 그대로 응답
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  // 이 시점의 parsed.data는 타입이 SignUpInput으로 좁혀져 있고, 실제로 검증도 통과했다
  await createUser(parsed.data);
  return Response.json({ ok: true }, { status: 201 });
}
```

📌 **`parse` vs `safeParse`**: `parse`는 실패 시 `ZodError`를 **던지고**, `safeParse`는 `{ success, data | error }` 객체를 **반환**합니다. 폼·API 경계처럼 실패가 정상 시나리오인 곳에서는 `safeParse`가 흐름을 읽기 쉽게 만듭니다.

📌 **스키마 검증을 쓰기 좋은 다른 지점들**
- **API 응답 검증**: `userListSchema.safeParse(await res.json())` — 서버 계약 위반을 프론트에서 조기에 잡음
- **환경 변수 검증**: 빌드/부팅 시 `envSchema.parse(process.env)`로 누락된 키를 즉시 발견
- **URL 검색 파라미터 파싱**: 문자열뿐인 쿼리스트링을 타입 있는 객체로 변환

📌 **대안 라이브러리**: Yup(오래되고 널리 쓰임), Valibot(번들 크기 최적화에 강점), ArkType 등이 있습니다. 선택 기준을 물으면 **"TypeScript 타입 추론 품질, 번들 크기, 서버와의 공유 가능성"** 을 들면 됩니다.

**🔥 예상 꼬리질문**

**Q. 검증 스키마가 번들 크기를 키우지 않나요?**
A. 커집니다. Zod는 런타임 라이브러리이므로 그만큼의 코드가 클라이언트로 갑니다. 그래서 ① 검증이 정말 클라이언트에 필요한지(서버 전용 스키마는 서버 컴포넌트/라우트 핸들러에만 두면 클라이언트 번들에 포함되지 않습니다 — 08-14 RSC 편 참고), ② 번들이 민감하면 Valibot처럼 트리셰이킹 친화적인 대안을 검토합니다. (07-26 번들링 편의 트리셰이킹과 연결)

**Q. `z.infer`로 뽑은 타입과 폼 입력 타입이 다를 때는요?**
A. `input` 타입(변환 전)과 `output` 타입(변환 후)이 다를 수 있습니다. `z.coerce.number()`처럼 변환이 있으면 폼에서 들어오는 값은 문자열, 검증 후 값은 숫자입니다. Zod는 `z.input<typeof schema>`와 `z.output<typeof schema>`를 각각 제공하므로 상황에 맞는 쪽을 씁니다.

**Q. 클라이언트와 서버가 다른 저장소/언어면 스키마 공유가 안 되는데요?**
A. 그럴 땐 스키마 공유 대신 **에러 응답 형식을 합의**하는 것이 현실적인 대안입니다. 모노레포라면 `packages/schema`에 스키마를 두고 양쪽에서 import하는 구조가 이상적입니다.

<details><summary>📝 한 줄 요약</summary>
TypeScript 타입은 런타임에 사라지므로 실제 값을 보장하지 못한다. Zod는 런타임 검증과 타입 추론을 하나의 스키마로 묶어 "검증 규칙과 타입이 어긋나는 문제"를 없애고, 같은 스키마를 클라이언트·서버·API 응답 검증에 재사용할 수 있게 한다.
</details>

---

## D6. 폼을 접근성 있게 만들려면 무엇을 해야 하나요? 🔴

**💬 30초 답변**
> 네 가지가 핵심입니다. ① **모든 입력에 프로그래밍적으로 연결된 `<label>`** — `htmlFor`/`id` 쌍으로 묶어야 스크린 리더가 "이메일, 편집 텍스트"라고 읽어 주고, 라벨 클릭 시 포커스도 이동합니다. placeholder는 라벨이 될 수 없습니다(입력하면 사라지고, 대비도 낮습니다). ② **에러를 색깔로만 알리지 않기** — 색약 사용자를 위해 텍스트와 아이콘을 함께 쓰고, `aria-invalid="true"`와 `aria-describedby`로 에러 메시지를 입력과 연결합니다. ③ **에러 발생을 실시간으로 알리기** — 에러 영역에 `role="alert"`(또는 `aria-live`)를 줘서 스크린 리더가 즉시 읽게 하고, 제출 실패 시 **첫 번째 에러 필드로 포커스를 이동**시킵니다. ④ **키보드만으로 전체 폼을 완주할 수 있는가** — 커스텀 셀렉트·모달·날짜 선택기에서 특히 자주 깨집니다. 여기에 `autocomplete` 속성을 제대로 주면 자동완성이 동작해 모두에게 편해집니다.

**📖 핵심 개념**

🎯 **비유**: 화면을 보지 않고 **전화로만 안내받아 서류를 작성**한다고 상상해 보세요. "빈칸에 적으세요"만 반복하면 무엇을 적어야 할지 알 수 없습니다(라벨 없음). "빨간 칸이 틀렸어요"는 전화로 전혀 도움이 안 됩니다(색상 의존). 좋은 안내는 "**세 번째 칸, 이메일입니다. 형식이 올바르지 않습니다. 지금 그 칸으로 이동합니다**"라고 말해 줍니다. 그게 `label` + `aria-describedby` + `role="alert"` + 포커스 이동입니다.

📌 **접근성 있는 필드의 완성형**

```jsx
function EmailField({ error, ...props }) {
  const id = useId();                     // React 18+ — 서버/클라이언트 일관된 고유 id
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      {/* ① 라벨은 htmlFor로 명시적으로 연결 */}
      <label htmlFor={id}>이메일 주소</label>

      <input
        id={id}
        type="email"
        autoComplete="email"              // ④ 브라우저 자동완성 (모바일에서 특히 유용)
        inputMode="email"                 //    모바일 키보드 레이아웃 최적화
        // ② 에러 상태를 보조기기가 알 수 있게 (색상만으로 알리지 않기)
        aria-invalid={error ? 'true' : 'false'}
        // ② 힌트와 에러 메시지를 입력과 프로그래밍적으로 연결 (공백 구분, 여러 개 가능)
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        {...props}
      />

      <p id={hintId}>업무용 이메일을 권장합니다.</p>

      {/* ③ role="alert"이면 렌더링되는 순간 스크린 리더가 읽어 준다 */}
      {error && <p id={errorId} role="alert">⚠ {error}</p>}
    </div>
  );
}
```

📌 **`autocomplete` 속성은 접근성이면서 UX**: `name`, `email`, `tel`, `street-address`, `postal-code`, `cc-number`, `current-password`, `new-password` 등 표준 토큰이 정해져 있습니다. 제대로 지정하면 자동완성이 동작해 입력 시간이 크게 줄고, 인지·운동 장애가 있는 사용자에게 특히 큰 도움이 됩니다. 회원가입의 새 비밀번호에는 `new-password`, 로그인에는 `current-password`를 써야 비밀번호 관리자가 올바르게 동작합니다.

📌 **`inputMode`와 `type`의 역할 분담**: `type="number"`는 스피너·스크롤 변경 같은 부작용과 앞자리 0 손실 문제가 있어, **전화번호·카드번호·인증번호처럼 "숫자로 생긴 문자열"에는 `type="text" inputMode="numeric"`** 조합이 더 안전합니다. 실제 수량·나이처럼 산술적 의미가 있는 값에만 `type="number"`를 씁니다.

📌 **제출 실패 시 포커스 이동**: 필드가 많은 폼에서 화면 아래쪽 필드에 에러가 나면, 사용자는 무엇이 잘못됐는지 못 볼 수 있습니다. 폼 상단에 **에러 요약(error summary)** 을 두고 거기로 포커스를 옮기거나, **첫 번째 에러 필드로 직접 포커스**를 이동시킵니다.

```jsx
const onInvalid = (errors) => {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;
  const el = document.querySelector(`[name="${firstKey}"]`);
  el?.focus();                                        // 포커스 이동 = 스크린 리더도 그 지점을 읽음
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
};

<form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
```
> React Hook Form은 `shouldFocusError` 옵션(기본 true)으로 이 동작을 상당 부분 자동 처리하지만, `Controller`로 감싼 커스텀 컴포넌트는 `ref` 연결이 필요해 직접 처리해야 할 수 있습니다.

📌 **그룹 입력에는 `<fieldset>` + `<legend>`**: 라디오 버튼이나 체크박스 묶음은 개별 라벨만으로는 "무엇에 대한 선택인지"가 전달되지 않습니다. `<fieldset><legend>배송 방법</legend>...</fieldset>`으로 감싸면 스크린 리더가 그룹 이름을 함께 읽어 줍니다.

📌 **필수 표시**: `*` 기호만으로는 보조기기에 전달되지 않을 수 있습니다. `required` 속성(또는 `aria-required="true"`)을 함께 주고, 폼 상단에 "\* 표시는 필수 항목입니다"라는 설명을 두는 것이 안전합니다.

**🔥 예상 꼬리질문**

**Q. `placeholder`를 라벨 대신 쓰면 안 되는 이유를 더 설명해 주세요.**
A. ① 입력을 시작하면 사라져서 **무엇을 적는 칸이었는지 확인할 수 없고**, ② 기본 색 대비가 낮아 저시력 사용자에게 읽히지 않으며, ③ 브라우저·번역기 처리 방식이 제각각이고, ④ 일부 스크린 리더는 placeholder를 라벨로 읽지 않습니다. **라벨은 항상 시각적으로도 남아 있어야 합니다.** 공간이 부족하면 라벨을 위로 띄우는 플로팅 라벨 패턴을 쓰되, 실제 `<label>` 요소는 유지합니다.

**Q. `aria-label`을 쓰면 `<label>` 없이도 되지 않나요?**
A. 시각적 라벨이 정말 불가능한 경우(아이콘만 있는 검색창 등)의 **차선책**입니다. 하지만 시각적 라벨이 없으면 **인지 장애·초보 사용자·음성 제어 사용자**가 불리해집니다. ARIA의 제1규칙 — "네이티브 HTML로 할 수 있으면 ARIA를 쓰지 마라" — 를 기억하세요. (07-17 접근성 편 참고)

**Q. `role="alert"`와 `aria-live="polite"`는 언제 각각 쓰나요?**
A. `role="alert"`는 `aria-live="assertive"`와 같아서 **읽던 것을 끊고 즉시** 알립니다. 제출 실패 에러처럼 즉각적인 주의가 필요할 때 적합합니다. 반면 "저장되었습니다" 같은 보조 정보는 `aria-live="polite"`로 현재 읽기가 끝난 뒤 전달하는 게 덜 방해됩니다. 실시간 검증 결과를 매 글자마다 assertive로 알리면 소음이 되므로, **디바운스하거나 blur 이후에만** 알리세요.

<details><summary>📝 한 줄 요약</summary>
폼 접근성의 4대 요소 — ①htmlFor/id로 연결된 진짜 label(placeholder는 라벨이 아님), ②aria-invalid + aria-describedby로 에러를 프로그래밍적으로 연결(색상만으로 알리지 않기), ③role="alert"와 제출 실패 시 첫 에러로 포커스 이동, ④키보드 완주 가능성과 올바른 autocomplete.
</details>

---

## D7. 브라우저 기본 폼 기능은 어디까지 해주나요? (Constraint Validation API) 🟡

**💬 30초 답변**
> HTML만으로도 상당한 검증이 됩니다. `required`, `type="email"`, `minlength`/`maxlength`, `min`/`max`, `pattern`, `step` 같은 속성을 주면 브라우저가 제출을 막고 기본 말풍선으로 안내합니다. JS 없이 동작하고 접근성도 브라우저가 처리해 주므로 **가장 저렴한 1차 방어선**입니다. 다만 **말풍선의 문구·스타일을 개발자가 제어할 수 없고, 브라우저·언어마다 다르며, 디자인 시스템과 어울리지 않는다**는 한계가 있어 실무에서는 `<form noValidate>`로 기본 UI를 끄고 직접 에러를 그리는 경우가 많습니다. 그럴 때도 **속성 자체는 남겨 두는 것**이 좋습니다 — 시맨틱 정보와 모바일 키보드 최적화, 접근성 정보가 유지되기 때문입니다. 그리고 브라우저는 `checkValidity()`, `setCustomValidity()`, `validity` 객체 같은 **Constraint Validation API**를 제공해, 기본 검증 상태를 JS에서 읽어 쓸 수도 있습니다.

**📖 핵심 개념**

🎯 **비유**: 네이티브 검증은 **건물 입구의 기본 보안 게이트**입니다. 공짜로 설치돼 있고 웬만한 건 걸러 줍니다. 다만 게이트가 내는 경고음(말풍선)의 소리·문구를 바꿀 수 없어서, 인테리어에 맞추려면 게이트는 켜 두되 경고음만 끄고(`noValidate`) 우리 방식대로 안내하는 겁니다.

```html
<form novalidate>
  <!-- type="email": 이메일 형식 검사 + 모바일 키보드에 @ 표시 -->
  <!-- required: 빈 값 차단 + 접근성 트리에 "필수"로 노출 -->
  <input type="email" required maxlength="254" />

  <!-- pattern: 정규식 검사 (문자열 전체가 매칭돼야 함, ^ $ 앵커 불필요) -->
  <!-- title: pattern 실패 시 브라우저 안내에 함께 노출 -->
  <input type="text" inputmode="numeric" pattern="[0-9]{6}" title="숫자 6자리를 입력하세요" />

  <!-- 산술적 의미가 있는 값에만 type="number" -->
  <input type="number" min="1" max="99" step="1" />
</form>
```

📌 **Constraint Validation API 주요 멤버**

| 멤버 | 설명 |
|---|---|
| `input.validity` | `valueMissing`, `typeMismatch`, `patternMismatch`, `tooShort`, `rangeOverflow` 등 플래그 |
| `input.validationMessage` | 브라우저가 만든 에러 문구(언어별로 다름) |
| `input.checkValidity()` | 유효 여부를 boolean으로 반환(UI 없음) |
| `input.reportValidity()` | 검사 + 기본 말풍선 표시 |
| `input.setCustomValidity(msg)` | 커스텀 에러 지정. **빈 문자열로 반드시 해제**해야 다시 유효해짐 |
| `form.checkValidity()` | 폼 전체 검사 |

```js
// 커스텀 메시지를 네이티브 검증에 얹기
emailInput.addEventListener('input', (e) => {
  const input = e.currentTarget;
  if (input.validity.typeMismatch) {
    input.setCustomValidity('이메일은 example@domain.com 형태로 입력해 주세요.');
  } else {
    input.setCustomValidity('');   // ← 이 해제를 빼먹으면 영원히 invalid 상태로 남는다
  }
});
```

📌 **CSS 의사 클래스**: `:required`, `:invalid`, `:valid`로 스타일링할 수 있지만, `:invalid`는 **아무것도 입력하지 않은 초기 상태에도 매칭**되어 페이지 로드 직후 모든 필드가 빨갛게 보이는 문제가 있습니다. 이를 해결하려고 나온 것이 **`:user-invalid`**(사용자가 실제로 상호작용한 뒤에만 매칭)입니다. 브라우저 지원이 최근 몇 년 사이 넓어졌지만, 도입 전 [caniuse](https://caniuse.com)나 MDN에서 지원 범위를 확인하는 것을 권합니다.

```css
/* 사용자가 건드린 뒤에만 에러 스타일 적용 */
input:user-invalid {
  border-color: #d32f2f;
}
```

📌 **점진적 향상(progressive enhancement) 관점**: JS 번들이 아직 로드되지 않았거나 실패한 상황에서도, `<form action="/api/signup" method="post">`와 네이티브 검증 속성이 있으면 **폼은 여전히 동작합니다.** Next.js의 서버 액션이나 Remix 같은 프레임워크가 이 원칙을 적극적으로 채택하는 이유이기도 합니다. 면접에서 "JS가 실패하면 어떻게 되나요?"라는 질문에 이 관점으로 답하면 좋습니다.

**🔥 예상 꼬리질문**

**Q. `type="email"`의 검증은 얼마나 믿을 만한가요?**
A. 형식 검사가 매우 느슨합니다. `a@b`처럼 TLD가 없어도 통과하는 브라우저가 있습니다. 그래서 "명백히 잘못된 입력을 거르는 1차 필터"로만 쓰고, **정확한 판단은 서버에서 실제 인증 메일을 보내 확인**하는 것이 유일하게 확실한 방법입니다. 지나치게 엄격한 이메일 정규식은 정상적인 주소를 거부하는 부작용이 더 큽니다.

**Q. `pattern` 정규식은 JS 정규식과 같나요?**
A. 문법은 JS 정규식이지만, **문자열 전체가 매칭돼야** 통과하도록 암묵적으로 `^(?:...)$`가 적용됩니다. 그래서 `^`/`$`를 직접 쓸 필요가 없습니다. 또한 `pattern` 실패 시 안내가 빈약하므로 `title` 속성으로 규칙을 설명해 주세요.

**Q. `noValidate`를 쓰면 접근성이 나빠지지 않나요?**
A. 기본 말풍선은 사라지지만, **우리가 D6처럼 `aria-invalid` + `aria-describedby` + `role="alert"`로 대체 구현하면 오히려 더 낫습니다**(스타일·문구·다국어를 우리가 제어하므로). 중요한 건 "네이티브 UI를 끈다면 그만큼의 접근성을 직접 구현한다"는 책임입니다.

<details><summary>📝 한 줄 요약</summary>
HTML 네이티브 검증(required·type·pattern·min/max)은 JS 없이 동작하는 저렴한 1차 방어선이다. 실무에선 noValidate로 기본 말풍선만 끄고 속성은 남겨 시맨틱·모바일 키보드·접근성 이점을 유지하며, 필요하면 Constraint Validation API로 상태를 읽어 쓴다.
</details>

---

## D8. 파일 업로드와 이미지 미리보기는 어떻게 구현하나요? 🟡

**💬 30초 답변**
> `<input type="file">`은 **보안상 항상 비제어**입니다(스크립트로 `value`를 지정할 수 없습니다). 선택된 파일은 `e.target.files`(`FileList`)로 접근하고, 서버로 보낼 때는 JSON이 아니라 **`FormData`에 담아 `multipart/form-data`로 전송**합니다. 이때 `Content-Type` 헤더를 **직접 지정하면 안 됩니다** — 브라우저가 `boundary` 값을 포함해 자동으로 설정해 줘야 하기 때문입니다. 미리보기는 `URL.createObjectURL(file)`로 임시 URL을 만들어 `<img src>`에 넣고, **다 쓰면 `URL.revokeObjectURL`로 해제**해 메모리 누수를 막습니다. 업로드 진행률이 필요하면 `fetch`로는 업로드 진행률을 얻기 까다로워 `XMLHttpRequest`의 `upload.onprogress`를 쓰거나 라이브러리를 씁니다. 클라이언트에서 확장자·용량을 검사하더라도 **서버에서 MIME 타입·크기·확장자를 반드시 재검증**해야 합니다.

**📖 핵심 개념**

🎯 **비유**: 파일 업로드는 **택배 접수**입니다. 상자 안의 내용물(`File`)을 창구에서 직접 만들어 넣을 수는 없고(스크립트로 value 설정 불가), 고객이 가져온 것만 받습니다. 접수 양식(FormData)에 상자를 얹어 보내되, **송장 번호(boundary)는 우체국이 발급**하므로 우리가 임의로 적으면(Content-Type 수동 설정) 배송이 실패합니다.

```jsx
function AvatarUpload() {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const MAX_SIZE = 5 * 1024 * 1024;                       // 5MB
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) 클라이언트 검증 = UX용 (서버에서 반드시 재검증)
    if (!ALLOWED.includes(file.type)) return setError('JPG, PNG, WebP만 업로드할 수 있습니다.');
    if (file.size > MAX_SIZE) return setError('파일 크기는 5MB 이하여야 합니다.');
    setError('');

    // 2) 미리보기용 임시 URL 생성 (blob: 스킴)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);                // 이전 URL 해제 (메모리 누수 방지)
      return URL.createObjectURL(file);
    });
  };

  // 3) 언마운트 시에도 반드시 해제
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);       // name 속성 기준 수집
    await fetch('/api/avatar', {
      method: 'POST',
      body: formData,
      // ⚠️ headers: { 'Content-Type': 'multipart/form-data' } ← 절대 쓰지 말 것!
      //    boundary가 빠져 서버가 파싱하지 못한다. 브라우저가 자동으로 붙인다.
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="avatar">프로필 이미지</label>
      <input
        id="avatar"
        name="avatar"
        type="file"
        accept="image/jpeg,image/png,image/webp"   // 파일 선택창의 필터일 뿐, 검증이 아님
        onChange={handleChange}
      />
      {error && <p role="alert">{error}</p>}
      {preview && <img src={preview} alt="선택한 이미지 미리보기" width={120} />}
      <button type="submit">업로드</button>
    </form>
  );
}
```

📌 **`createObjectURL` vs `FileReader.readAsDataURL`**: 둘 다 미리보기를 만들 수 있지만,
- `createObjectURL` → `blob:` URL을 즉시 반환. **동기적이고 메모리 효율적**. 해제 필요.
- `readAsDataURL` → base64 `data:` URL. 비동기이고 **원본보다 약 33% 큰 문자열**을 메모리에 만듦.
큰 이미지에는 `createObjectURL`이 표준적인 선택입니다.

📌 **업로드 진행률**: `fetch`는 **다운로드** 진행률은 `ReadableStream`으로 읽을 수 있지만(5.common.md Q108 참고), **업로드** 진행률은 표준적으로 지원되지 않습니다. 그래서 진행률 UI가 필요하면 아직 `XMLHttpRequest`가 현실적인 답입니다.

```js
const xhr = new XMLHttpRequest();
xhr.upload.onprogress = (e) => {
  if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
};
xhr.open('POST', '/api/upload');
xhr.send(formData);
```

📌 **대용량 파일 전략**: 수백 MB 이상이면 ① **청크 분할 업로드**(파일을 `file.slice()`로 잘라 순차 전송, 실패 시 그 청크만 재시도), ② **Presigned URL**(서버가 발급한 임시 URL로 클라이언트가 S3 같은 스토리지에 직접 업로드 — 서버 대역폭·메모리 절약) 방식을 씁니다. 실무 경험을 물으면 Presigned URL 패턴을 언급하면 좋습니다.

📌 **클라이언트 검증의 한계**: `accept` 속성은 **파일 선택 대화상자의 필터일 뿐**이고, 사용자는 "모든 파일"을 골라 우회할 수 있습니다. `file.type`도 확장자 기반 추정이라 조작 가능합니다. 서버는 **실제 바이트의 매직 넘버(file signature)** 까지 확인하고, 업로드 파일을 **실행 가능한 경로에 두지 않으며**, 파일명을 그대로 쓰지 않고 새로 생성해야 합니다. (07-21 웹 보안 편의 "입력을 믿지 않는다" 원칙의 연장선)

**🔥 예상 꼬리질문**

**Q. React Hook Form에서 파일 input은 어떻게 다루나요?**
A. `register('avatar')`로 등록하면 값이 `FileList`로 들어옵니다. 검증은 `validate`에서 `files[0]`의 `size`/`type`을 확인하면 되고, 제출 시에는 `data.avatar[0]`을 `FormData`에 담습니다. 파일 input은 `defaultValue`로 초기화할 수 없다는 점도 기억하세요.

**Q. 여러 파일을 받으려면요?**
A. `multiple` 속성을 주면 `files`에 여러 항목이 담깁니다. `FormData`에는 같은 키로 `append`를 반복하면 됩니다(`for (const f of files) formData.append('files', f)`). 드래그 앤 드롭은 `dragover`에서 `preventDefault`를 호출해야 브라우저 기본 동작(파일 열기)을 막을 수 있고, 파일은 `e.dataTransfer.files`에서 얻습니다.

**Q. 이미지를 업로드 전에 압축하려면요?**
A. `canvas`에 그린 뒤 `canvas.toBlob(cb, 'image/webp', 0.8)`로 재인코딩하거나, `createImageBitmap` + `OffscreenCanvas`를 **Web Worker**에서 사용해 메인 스레드를 막지 않고 처리합니다. (08-15 Web Worker 편과 연결되는 좋은 답변 소재입니다.)

<details><summary>📝 한 줄 요약</summary>
파일 input은 보안상 항상 비제어이며, FormData로 multipart 전송하되 Content-Type을 직접 지정하면 안 된다. 미리보기는 createObjectURL + revokeObjectURL로, 업로드 진행률은 XHR upload.onprogress로 다루고, 클라이언트 검증(accept·size·type)은 UX용일 뿐 서버 재검증이 필수다.
</details>

---

## D9. React 19의 폼 액션(`useActionState`)은 기존 방식과 무엇이 다른가요? 🟢

**💬 30초 답변**
> React 19부터 `<form>`의 `action` prop에 **함수를 직접 넘길 수 있습니다.** React가 `preventDefault`, `FormData` 수집, 대기(pending) 상태 관리, 제출 후 폼 리셋을 대신 처리해 줍니다. 즉 `onSubmit` + `useState`로 손수 관리하던 "제출 중 / 에러 / 결과" 3종 세트를 **`useActionState` 훅 하나로** 다룰 수 있게 됐습니다. 제출 버튼 같은 자식 컴포넌트는 **`useFormStatus`** 로 부모 폼의 제출 상태를 prop drilling 없이 읽을 수 있습니다. Next.js App Router에서는 이 액션을 **`'use server'` 서버 액션**으로 만들면 클라이언트 JS 없이도 폼이 서버로 제출되어(점진적 향상) 동작합니다. 다만 이건 "기존 방식을 대체"하기보다, **서버 중심 폼에 잘 맞는 새 선택지**로 이해하는 게 정확합니다. 복잡한 클라이언트 검증·실시간 상호작용이 많은 폼은 여전히 React Hook Form 같은 라이브러리가 유리합니다.

**📖 핵심 개념**

🎯 **비유**: 기존 방식이 **주문서를 직접 받아 적고, 접수 중인지 표시하고, 결과를 게시판에 붙이는 것을 전부 수동으로** 하는 가게라면, 폼 액션은 **주문 접수 시스템이 "접수 중" 표시와 결과 알림까지 자동으로 처리**해 주는 가게입니다. 우리는 "주문이 들어오면 무엇을 할지"만 적으면 됩니다.

```jsx
'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

// 액션 함수: (이전 상태, FormData) => 새 상태
async function submitAction(prevState, formData) {
  const email = formData.get('email');

  // 클라이언트/서버 어디서든 검증
  if (!email || !String(email).includes('@')) {
    return { ok: false, message: '이메일 형식이 아닙니다.' };
  }

  try {
    await subscribe(email);
    return { ok: true, message: '구독이 완료되었습니다.' };
  } catch {
    return { ok: false, message: '잠시 후 다시 시도해 주세요.' };
  }
}

function SubscribeForm() {
  // state = 액션의 반환값, formAction = form에 넘길 액션, isPending = 진행 중 여부
  const [state, formAction, isPending] = useActionState(submitAction, { ok: false, message: '' });

  return (
    <form action={formAction}>          {/* onSubmit/preventDefault 불필요 */}
      <label htmlFor="email">이메일</label>
      <input id="email" name="email" type="email" required />

      <SubmitButton />                  {/* 자식이 스스로 pending을 안다 */}

      {state.message && (
        <p role="alert" aria-live="polite">{state.message}</p>
      )}
      {isPending && <span>처리 중…</span>}
    </form>
  );
}

// useFormStatus는 "상위 form"의 상태를 읽는다 → 반드시 form의 자식 컴포넌트여야 한다
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? '전송 중…' : '구독하기'}
    </button>
  );
}
```

📌 **`useFormStatus`의 제약**: 이 훅은 **상위 `<form>`의 상태를 읽으므로, 그 `<form>`을 렌더링하는 같은 컴포넌트에서 호출하면 동작하지 않습니다.** 반드시 폼 안쪽의 **자식 컴포넌트**에서 호출해야 합니다. 면접에서 자주 언급되는 함정입니다.

📌 **기존 방식과의 비교**

| 관심사 | `onSubmit` + `useState` | 폼 액션 + `useActionState` |
|---|---|---|
| `preventDefault` | 직접 호출 | React가 처리 |
| 값 수집 | state 또는 FormData 수동 | `FormData`가 인자로 전달 |
| pending 상태 | `useState`로 직접 관리 | `isPending` / `useFormStatus` |
| 제출 후 폼 초기화 | 직접 `reset()` | 비제어 폼은 자동 리셋 |
| JS 없이 동작 | 불가 | 서버 액션이면 가능(점진적 향상) |
| 복잡한 클라이언트 검증 | 자유롭게 구현 | 라이브러리 병행이 유리 |

📌 **낙관적 업데이트(`useOptimistic`)**: 댓글 작성처럼 성공이 거의 확실한 액션은, 서버 응답을 기다리지 않고 UI를 먼저 갱신했다가 실패하면 되돌리는 방식이 체감 속도를 크게 개선합니다. React 19의 `useOptimistic`이 이 패턴을 훅으로 제공합니다. (07-19 TanStack Query 편의 낙관적 업데이트와 같은 아이디어입니다.)

📌 **서버 액션과 조합**: Next.js App Router에서 액션 함수 최상단에 `'use server'`를 두면 그 함수는 서버에서 실행됩니다. 폼 데이터는 서버로 전송되고, 검증·DB 쓰기·재검증(`revalidatePath`)까지 서버에서 처리한 뒤 결과만 돌아옵니다. **검증 스키마(D5)를 서버 액션 안에서 쓰면 클라이언트 번들도 가벼워집니다.** (자세한 서버/클라이언트 경계와 직렬화 규칙은 08-14 RSC 편 참고)

**🔥 예상 꼬리질문**

**Q. 그럼 React Hook Form은 이제 필요 없나요?**
A. 아닙니다. 폼 액션은 **제출 흐름과 pending 관리**를 간결하게 만들어 주지만, **필드별 실시간 검증, 에러 표시, 동적 필드 배열, 필드 간 연동** 같은 클라이언트 폼의 어려운 부분은 여전히 직접 해야 합니다. 실제로 두 가지를 함께 쓰는 패턴도 있습니다(RHF로 클라이언트 검증 → 서버 액션으로 제출). "무엇을 대체하는가"보다 **"어떤 폼에 어떤 도구가 맞는가"** 로 답하는 게 좋습니다.

**Q. 서버 액션에서 검증 에러를 어떻게 필드별로 돌려주나요?**
A. 액션의 반환값을 `{ fieldErrors: { email: ['...'] } }` 형태로 설계하고(Zod `error.flatten().fieldErrors`가 정확히 이 모양입니다), `useActionState`의 `state`에서 꺼내 각 필드 아래에 렌더링합니다. 반환값은 **직렬화 가능한 값**이어야 합니다(함수·클래스 인스턴스 불가).

**Q. 서버 액션도 보안 검증이 필요한가요?**
A. 반드시 필요합니다. 서버 액션은 사실상 **자동 생성된 API 엔드포인트**이므로, 인증·인가 확인과 입력 검증을 액션 내부에서 직접 해야 합니다. "클라이언트에서 호출하는 곳이 하나뿐이니 안전하다"는 생각은 틀렸습니다.

<details><summary>📝 한 줄 요약</summary>
React 19의 form action + useActionState는 preventDefault·FormData 수집·pending·리셋을 React에 위임하고, useFormStatus로 자식이 제출 상태를 읽는다(반드시 form의 자식이어야 함). 서버 액션과 결합하면 JS 없이도 동작하지만, 복잡한 클라이언트 검증은 여전히 폼 라이브러리가 유리하다.
</details>

---

## D10. 폼 구현에서 흔히 겪는 함정과 실전 체크리스트 🟡

**💬 30초 답변**
> 자주 터지는 것들은 대체로 정해져 있습니다 — **중복 제출**(제출 중 버튼을 안 막아 결제가 두 번 되는 사고), **제어/비제어 전환 경고**(초기값을 `undefined`로 두는 것), **`preventDefault` 누락으로 페이지가 새로고침**, **`name` 속성 누락으로 `FormData`가 비어 있음**, **에러를 색상으로만 표시**, **`type="number"`의 문자열/숫자 혼동**, **비동기 검증의 경쟁 조건**, **페이지 이탈 시 작성 내용 소실**입니다. 각각의 방어법을 알고 있으면 그 자체로 실무 경험의 증거가 됩니다.

**📖 핵심 개념**

📌 **① 중복 제출 방지** — 가장 실질적인 사고입니다. 결제·주문·댓글에서 특히 치명적입니다.

```jsx
// 클라이언트: 제출 중 버튼 비활성 + 중복 호출 가드
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? '처리 중…' : '결제하기'}
</button>
```
> 클라이언트 방어만으로는 부족합니다(네트워크 재시도, 새로고침 후 재제출 등). 서버에는 **멱등성 키(Idempotency-Key)** 를 함께 보내 같은 요청이 두 번 와도 한 번만 처리되도록 설계하는 것이 정석입니다. 이걸 언급하면 백엔드와의 협업 감각을 보여줄 수 있습니다.

📌 **② 페이지 이탈 경고** — 긴 폼을 작성하다 실수로 닫는 사고를 막습니다.

```jsx
useEffect(() => {
  if (!isDirty) return;                       // 변경사항이 있을 때만
  const handler = (e) => {
    e.preventDefault();
    e.returnValue = '';                       // 브라우저 기본 경고창 표시(문구 커스텀 불가)
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [isDirty]);
```
> `beforeunload`는 **브라우저 밖으로 나가는 경우(새로고침·탭 닫기)** 만 막습니다. SPA 내부 라우팅 이탈은 라우터가 제공하는 기능(Next.js의 `useRouter` 이벤트, React Router의 `useBlocker` 등)으로 별도 처리해야 합니다.

📌 **③ 자동 저장(임시 저장)** — 이탈 경고보다 근본적인 해법입니다. 디바운스된 값을 `localStorage`나 서버 draft API에 저장하고, 복귀 시 복원합니다. 단, **개인정보·비밀번호·카드번호는 절대 저장하지 마세요.** (07-31 브라우저 저장소 편 참고)

📌 **④ `type="number"`의 함정**: `e.target.value`는 **언제나 문자열**입니다. `""`(빈 값)일 수도 있어 `Number('')`는 `0`이 되는 함정도 있습니다. `e.target.valueAsNumber`를 쓰면 숫자(또는 `NaN`)를 얻고, React Hook Form이라면 `register('age', { valueAsNumber: true })`를 지정합니다. Zod라면 `z.coerce.number()`가 이 변환을 담당합니다.

📌 **⑤ 비동기 검증의 경쟁 조건**: "a" → "ab" → "abc"를 빠르게 입력하면 세 요청이 나가고, **"ab"의 응답이 "abc"보다 늦게 도착**해 잘못된 결과를 표시할 수 있습니다. 디바운스 + `AbortController`로 이전 요청을 취소하고, 응답이 **현재 값에 대한 것인지** 확인한 뒤 반영하세요.

```js
useEffect(() => {
  const controller = new AbortController();
  const timer = setTimeout(async () => {
    try {
      const res = await checkEmail(value, { signal: controller.signal });
      setAvailable(res.available);
    } catch (e) {
      if (e.name !== 'AbortError') setAvailable(null);
    }
  }, 300);
  return () => { clearTimeout(timer); controller.abort(); };  // 값이 바뀌면 이전 요청 취소
}, [value]);
```

📌 **⑥ 입력값 정규화(normalize)**: 이메일 앞뒤 공백, 전화번호의 하이픈, 전각 문자 등은 **검증 전에 정리**하는 것이 좋습니다. 다만 **비밀번호는 절대 trim하지 마세요**(사용자가 의도한 공백일 수 있습니다).

📌 **⑦ 실전 체크리스트**

**기능**
- [ ] 제출 중 버튼 비활성화 + 서버 멱등성 키로 중복 제출 방지
- [ ] 서버 에러를 필드별로 매핑해 표시(`setError`)
- [ ] 네트워크 실패 시 재시도 안내와 입력값 보존(폼을 초기화하지 않기)
- [ ] 긴 폼은 자동 저장 또는 이탈 경고
- [ ] 성공 후 동작 정의(리다이렉트/토스트/폼 리셋)

**검증**
- [ ] 클라이언트 검증 + **서버 재검증**(둘 다)
- [ ] `mode: 'onBlur'` + `reValidateMode: 'onChange'`
- [ ] 에러 메시지가 "무엇이·왜·어떻게"를 담고 있는가
- [ ] 비동기 검증에 디바운스 + 요청 취소

**접근성**
- [ ] 모든 입력에 `htmlFor`/`id`로 연결된 `<label>`(placeholder는 라벨이 아님)
- [ ] `aria-invalid` + `aria-describedby` + `role="alert"`
- [ ] 제출 실패 시 첫 에러 필드로 포커스 이동
- [ ] 라디오/체크박스 그룹은 `<fieldset>` + `<legend>`
- [ ] 키보드만으로 전체 폼 완주 가능
- [ ] 올바른 `autocomplete` / `inputMode` / `type`

**성능**
- [ ] 폼 state를 필요한 최소 범위로 격리
- [ ] 큰 폼은 비제어(React Hook Form) 기반
- [ ] 값 실시간 표시는 `useWatch`로 범위 한정
- [ ] 입력마다 나가는 요청은 디바운스

**🔥 예상 꼬리질문**

**Q. 폼을 어떻게 테스트하나요?**
A. React Testing Library에서 **사용자가 하는 것과 같은 방식**으로 테스트합니다. `screen.getByLabelText('이메일')`로 라벨 기준 조회(→ 이 쿼리가 통과한다는 것 자체가 접근성 검증이 됩니다), `userEvent.type`으로 입력, `userEvent.click`으로 제출, `await screen.findByRole('alert')`로 에러 표시 확인. 구현 세부(state 값)가 아니라 **동작**을 검증하는 것이 원칙입니다. (07-27 테스트 편 참고)

**Q. 다단계(multi-step) 폼은 어떻게 설계하나요?**
A. 단계별 컴포넌트를 두되 **폼 값은 상위에 한 번만 보관**(React Hook Form이면 하나의 `useForm`을 Context로 공유 — `FormProvider`/`useFormContext`)하고, 단계별로 **부분 스키마**를 만들어 그 단계만 검증한 뒤 다음으로 넘어갑니다. 마지막에 전체 스키마로 다시 검증합니다. 새로고침 대비로 현재 단계와 값은 URL 쿼리나 저장소에 남겨 두면 UX가 좋아집니다.

**Q. 동적으로 늘어나는 필드(예: "항목 추가")는요?**
A. React Hook Form의 `useFieldArray`가 `append`/`remove`/`move`를 제공합니다. 직접 구현한다면 **배열 인덱스를 `key`로 쓰지 않는 것**이 중요합니다 — 중간 항목을 삭제하면 입력값이 엉뚱한 행으로 밀리는 전형적인 버그가 납니다. 항목마다 고유 id를 부여하세요. (4.react_next.md Q64 `key` 참고)

<details><summary>📝 한 줄 요약</summary>
폼의 실전 사고는 중복 제출·제어/비제어 전환·name 누락·number 타입 혼동·비동기 경쟁 조건·작성 내용 소실로 정형화돼 있다. 각각 isSubmitting+멱등성 키, defaultValues, FormData 확인, valueAsNumber, 디바운스+AbortController, 자동 저장/이탈 경고로 방어한다.
</details>

---

## 🎯 핵심 한 장 요약

| 질문 | 30초 답변 요지 |
|---|---|
| **제어 vs 비제어** | 값의 주인이 React state냐 DOM이냐. 제어=실시간 상호작용 유리·입력마다 리렌더링, 비제어=제출 시 ref/FormData로 읽기·리렌더링 없음. "매 입력마다 값이 필요한가"로 판단 |
| **폼 리렌더링** | 리렌더링 자체는 싸다. 문제는 state가 너무 위에 있는 것. 해법 순서: 상태 격리 → children 분리 → memo → 비제어 전환 |
| **React Hook Form** | ①ref 기반 비제어로 타이핑 시 리렌더링 제거, ②formState를 Proxy 구독 모델로 만들어 실제 읽은 상태만 반응. 제어형 UI는 `Controller`, 값 표시는 `useWatch` |
| **검증 위치** | 클라이언트=UX, 서버=보안. **둘 다 필수**. 클라이언트 검증은 개발자 도구·curl로 우회 가능 |
| **검증 타이밍** | `mode: 'onBlur'` + `reValidateMode: 'onChange'` — 처음엔 blur, 에러 이후엔 실시간 |
| **Zod** | TS 타입은 런타임에 사라짐 → 스키마 하나로 런타임 검증 + 타입 추론 + 클라이언트/서버 공유 |
| **접근성 4대 요소** | ①진짜 `<label>`(htmlFor/id) ②`aria-invalid`+`aria-describedby` ③`role="alert"`+첫 에러로 포커스 ④키보드 완주·`autocomplete` |
| **네이티브 검증** | `required`/`type`/`pattern`은 JS 없이 동작하는 1차 방어선. `noValidate`로 말풍선만 끄고 속성은 유지 |
| **파일 업로드** | 항상 비제어. `FormData`+multipart, **`Content-Type` 수동 지정 금지**. 미리보기는 `createObjectURL`+`revokeObjectURL`, 진행률은 XHR |
| **React 19 폼 액션** | `action={fn}` + `useActionState`로 pending·결과 관리 위임, `useFormStatus`는 폼의 **자식**에서만 동작 |
| **최다 사고** | 중복 제출(→`isSubmitting`+멱등성 키), 제어/비제어 전환(→`defaultValues`), `name` 누락, `valueAsNumber`, 비동기 경쟁 조건(→디바운스+`AbortController`) |

---

## 🔗 함께 보면 좋은 자료

- `2026-07-16_react-rerender-optimization.md` — 상태 격리·`memo`·`children` 패턴의 원리 (D2의 배경)
- `2026-07-17_web-accessibility-aria.md` — ARIA 사용 원칙과 스크린 리더 동작 (D6의 배경)
- `2026-07-18_typescript-advanced-types.md` — 타입 추론·타입 가드 (D5의 배경)
- `2026-07-19_state-management-server-state-tanstack-query.md` — 서버 상태와 낙관적 업데이트 (D9)
- `2026-07-21_web-security-xss-csrf-csp.md` — "입력을 믿지 않는다" 원칙 (D4·D8)
- `2026-07-27_frontend-testing-rtl-playwright.md` — 폼 테스트 작성법 (D10)
- `2026-08-09_react-hooks-deep-dive-closure-effect-ref.md` — `useRef`·stale closure (D1·D2)
- `2026-08-14_react-server-components.md` — 서버 액션과 직렬화 경계 (D9)


