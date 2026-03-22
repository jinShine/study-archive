# 프론트엔드 개발자 마스터 커리큘럼

> **목표**: 비전공 뉴비가 **2~3년차 실무 수준의 풀스택 프론트엔드 개발자**로 성장
> **대상**: 코딩을 처음 배우는 프론트엔드 지망생
> **철학**: 비유 먼저 → 코드 나중 / "왜?"에 답할 수 있는 개발자 / 면접에서 살아남는 CS 기초

---

## 전체 로드맵

```
Part 1: HTML & CSS           ██████████ (01~14)    화면을 그리는 언어
Part 2: JavaScript & TS      ██████████ (15~32)    브라우저를 움직이는 엔진
Part 3: React                ██████████ (33~55)    현대 UI 라이브러리 + 실무 생태계
Part 4: Next.js              ██████████ (56~90)    풀스택 프레임워크 + 배포 + 프로젝트
```

### 면접 우선순위 범례

```
🔴 필수: 못 답하면 탈락. 반드시 자기 말로 설명할 수 있어야 함
🟡 이해: 물어보면 설명할 수 있으면 가산점
🟢 참고: 있다는 것만 알면 됨 (시니어 영역이지만 알면 차별화)
```

---
---

# Part 1. HTML & CSS (+Tailwind CSS)

> 집을 짓기 전에 땅부터 다져야 한다.
> HTML과 CSS를 모르면 React는 공중누각이고, 면접에서 "CSS 할 줄 아세요?" 한마디에 무너진다.

---

## Phase 1: HTML — 웹 문서의 뼈대

> HTML은 "무엇을 보여줄까"를 정의하는 구조의 언어다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 01 | **웹의 동작 원리** | 브라우저 → DNS → 서버 → 응답, HTTP/HTTPS, 클라이언트-서버 모델, URL 구조 | 🔴 |
| 02 | **HTML 기본 태그와 문서 구조** | `<!DOCTYPE>`, `<html>/<head>/<body>`, 메타 태그, `<h1>~<h6>`, `<p>`, `<a>`, `<img>`, `<ul>/<ol>`, `<div>/<span>` | 🔴 |
| 03 | **시맨틱 HTML** | `<header>/<nav>/<main>/<section>/<article>/<aside>/<footer>`, 왜 `<div>` 남발이 나쁜가, SEO와의 관계 | 🔴 |
| 04 | **폼과 입력 요소** | `<form>`, `<input>` 타입들(text/email/password/number/checkbox/radio), `<select>`, `<textarea>`, `<label>`, `<button>`, `name` 속성의 중요성 | 🟡 |
| 05 | **웹 접근성(a11y) 기초** | WAI-ARIA(`role`, `aria-label`, `aria-hidden`), alt 텍스트, 키보드 네비게이션, 스크린 리더, 색상 대비, 왜 접근성이 법적 의무인가 | 🟡 |

> **실습**: 자기소개 페이지 (HTML only, CSS 없이, 시맨틱 태그만으로 구조 잡기)

---

## Phase 2: CSS 기초 — 화면을 꾸미는 언어

> CSS는 "어떻게 보여줄까"를 정의하는 스타일의 언어다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 06 | **CSS 선택자와 캐스케이드** | 태그/클래스/ID 선택자, 자손/자식/형제 결합자, 의사 클래스(`:hover`/`:focus`/`:nth-child`), 특이성(Specificity) 점수 계산, `!important`를 쓰면 안 되는 이유 | 🔴 |
| 07 | **박스 모델 완전 정복** | `content → padding → border → margin`, `box-sizing: border-box`가 필수인 이유, 마진 겹침(Margin Collapsing), `outline` vs `border` | 🔴 |
| 08 | **display와 position** | `block`/`inline`/`inline-block`/`none`, `static`/`relative`/`absolute`/`fixed`/`sticky`, z-index와 쌓임 맥락(Stacking Context) | 🔴 |
| 09 | **색상, 단위, 타이포그래피** | `px`/`rem`/`em`/`%`/`vw`/`vh`, `clamp()`, 웹 폰트(@font-face, Google Fonts), `line-height`, `letter-spacing` | 🟡 |

> **실습**: Phase 1의 자기소개 페이지에 CSS 스타일링 적용

---

## Phase 3: CSS 레이아웃 — 현대 웹의 배치 기술

> Flexbox와 Grid를 마스터하면 어떤 레이아웃이든 만들 수 있다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 10 | **Flexbox 완전 정복** | `display: flex`, 주축(main axis)/교차축(cross axis), `justify-content`/`align-items`/`align-self`, `flex-grow`/`flex-shrink`/`flex-basis`, `flex-wrap`, `gap`, 실전 레이아웃 패턴 5가지 | 🔴 |
| 11 | **Grid 완전 정복** | `display: grid`, `grid-template-columns`/`rows`, `fr` 단위, `grid-area`, `repeat()`/`minmax()`/`auto-fill`/`auto-fit`, Flex vs Grid 선택 기준 | 🔴 |
| 12 | **반응형 웹 디자인** | `@media` 쿼리, 모바일 퍼스트(min-width) vs 데스크톱 퍼스트(max-width), 브레이크포인트 전략, 뷰포트 메타 태그, 반응형 이미지(`srcset`), `container` 쿼리 | 🔴 |
| 13 | **CSS 애니메이션과 전환** | `transition` (hover 효과), `@keyframes`/`animation`, `transform`(translate/rotate/scale), GPU 가속(`will-change`), Reflow를 유발하지 않는 애니메이션 속성 | 🟡 |

> **실습**: 반응형 랜딩 페이지 (모바일/태블릿/데스크톱 3단계 브레이크포인트)

---

## Phase 4: Tailwind CSS — 실무 표준 유틸리티 프레임워크

> 2026년 현재 프론트엔드 실무에서 가장 많이 쓰이는 CSS 방법론. Next.js 공식 추천

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 14 | **Tailwind CSS 핵심** | 유틸리티 퍼스트(Utility-First) 철학, 설치와 설정(`tailwind.config`), 핵심 클래스(spacing/color/typography/flex/grid), 반응형 접두사(`sm:`/`md:`/`lg:`), 다크 모드(`dark:`), 상태 변형(`hover:`/`focus:`/`group-hover:`), `@apply`를 지양해야 하는 이유, `cn()`/`clsx` 조건부 클래스 유틸, Tailwind v4 `@import "tailwindcss"` | 🟡 |

> **실습**: Phase 3의 랜딩 페이지를 Tailwind CSS로 전면 리팩토링

---

### Part 1 면접 핵심 질문

```
🔴 "브라우저에 URL을 입력하면 화면이 뜨기까지 무슨 일이 일어나나요?"
🔴 "시맨틱 HTML을 사용해야 하는 이유는?"
🔴 "CSS 박스 모델을 설명해주세요. box-sizing: border-box는 왜 쓰나요?"
🔴 "Flexbox의 주축과 교차축이란?"
🔴 "Reflow와 Repaint의 차이는? 성능에 영향을 주는 CSS 속성은?"
🔴 "반응형 웹을 구현하는 방법은? 모바일 퍼스트란?"
🟡 "CSS 특이성(Specificity) 점수를 계산하는 방법은?"
🟡 "Flexbox와 Grid의 차이점은? 언제 각각 쓰나요?"
🟡 "웹 접근성(a11y)이란? 왜 중요한가?"
```

---
---

# Part 2. JavaScript & TypeScript

> 브라우저를 움직이는 엔진.
> JavaScript 기초가 부실하면 React에서 전부 무너진다. 면접 3대장(클로저, 이벤트 루프, this)이 여기에 있다.

---

## Phase 5: JavaScript 기초 — 언어의 뼈대

> 변수, 함수, 스코프. 이 세 가지가 JavaScript의 전부다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 15 | **변수와 데이터 타입** | `var`/`let`/`const`, 호이스팅(Hoisting), TDZ(Temporal Dead Zone), 원시 타입 7가지 vs 참조 타입, `typeof`, `null` vs `undefined` | 🔴 |
| 16 | **연산자와 타입 변환** | `===` vs `==`(암묵적 변환), Truthy/Falsy, 단축 평가(`&&`/`||`/`??`), 옵셔널 체이닝(`?.`), Nullish Coalescing | 🔴 |
| 17 | **함수 심화** | 함수 선언 vs 표현식 vs 화살표, 매개변수(기본값/rest), 일급 객체(First-class), 고차 함수(Higher-order), 콜백 패턴 | 🔴 |
| 18 | **스코프와 클로저** | 전역/함수/블록 스코프, 렉시컬 스코프(Lexical Scope), 스코프 체인, 클로저(Closure) 정의와 활용(데이터 은닉, 팩토리, React Hooks의 원리) | 🔴 |
| 19 | **this 바인딩** | 전역/메서드/생성자/화살표 함수에서의 `this`, `call`/`apply`/`bind`, 왜 화살표 함수가 `this`를 바인딩하지 않는가, React 이벤트 핸들러에서의 `this` | 🔴 |

> **실습**: 콘솔에서 클로저와 this 동작 추적 (코드 실행 순서 예측 → 실제 확인)

---

## Phase 6: JavaScript 핵심 자료구조와 메서드

> 배열과 객체를 자유자재로 다루지 못하면 React 컴포넌트를 작성할 수 없다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 20 | **배열 고급 메서드** | `map`/`filter`/`reduce`/`find`/`findIndex`/`some`/`every`/`flat`/`flatMap`, 체이닝, 원본 변경 메서드 vs 새 배열 반환 메서드 구분 | 🔴 |
| 21 | **객체와 구조 분해** | 객체 리터럴, 계산된 속성명, 구조 분해 할당(Destructuring), 스프레드 연산자(`...`), 얕은 복사 vs 깊은 복사, `Object.keys`/`values`/`entries`/`assign`/`freeze` | 🔴 |
| 22 | **불변성(Immutability)** | 왜 원본을 직접 변경하면 안 되는가(참조 공유 문제), 스프레드로 복사 후 수정, 중첩 객체의 깊은 불변 업데이트, `structuredClone()`, React 상태 업데이트와의 연결 | 🔴 |
| 23 | **Map, Set, Symbol** | `Map` vs 일반 객체, `Set`으로 중복 제거, `WeakMap`/`WeakSet`(가비지 컬렉션), `Symbol` 기초, `for...of` vs `for...in` | 🟡 |

> **실습**: 배열/객체 메서드 30제 챌린지 (map/filter/reduce 조합 문제)

---

## Phase 7: 비동기 프로그래밍 — JavaScript의 심장

> 웹은 본질적으로 비동기다. 여기가 면접 최다 출제 구간

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 24 | **이벤트 루프와 실행 모델** | 싱글 스레드, Call Stack, Web API, Task Queue(Macrotask), Microtask Queue, `setTimeout` 0초의 비밀, `requestAnimationFrame` | 🔴 |
| 25 | **콜백과 Promise** | 콜백 지옥(Callback Hell), `Promise` 3가지 상태(pending/fulfilled/rejected), `.then`/`.catch`/`.finally`, `Promise.all`/`allSettled`/`race`/`any` | 🔴 |
| 26 | **async/await** | `async` 함수는 Promise를 반환, `await`는 `.then`의 문법적 설탕, try-catch 에러 핸들링, 순차 vs 병렬(`Promise.all`) 실행 전략, Top-level await | 🔴 |
| 27 | **fetch API와 네트워크** | HTTP 메서드(GET/POST/PUT/PATCH/DELETE), 요청/응답 구조, Headers, `res.ok`/`res.json()`, AbortController, CORS의 개념과 해결법 | 🔴 |

> **실습**: 외부 API(JSONPlaceholder) 연동 — fetch + async/await + 에러 핸들링

---

## Phase 8: DOM과 브라우저 API

> React가 추상화해주는 DOM의 실체를 알아야 진짜 실력이 된다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 28 | **DOM 조작과 이벤트** | DOM 트리, `querySelector`/`getElementById`, `createElement`/`appendChild`, 이벤트 버블링/캡처링, `event.target` vs `event.currentTarget`, 이벤트 위임(Event Delegation) | 🔴 |
| 29 | **브라우저 렌더링 파이프라인** | HTML 파싱 → DOM 트리 → CSSOM → 렌더 트리 → Layout → Paint → Composite, `<script>` 태그의 `defer`/`async`, Critical Rendering Path | 🔴 |
| 30 | **브라우저 저장소** | `localStorage`/`sessionStorage` (동기, 5MB), Cookie (4KB, HttpOnly/Secure/SameSite), IndexedDB 개념, 각각의 실무 사용처 | 🟡 |

> **실습**: Vanilla JS로 To-Do 앱 (DOM 직접 조작 + 이벤트 위임 + localStorage 저장)

---

## Phase 9: 모듈 시스템과 현대 JavaScript

> 팀으로 개발하려면 코드를 쪼개고 합치는 방법을 알아야 한다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 31 | **ES Modules** | `import`/`export`(named/default), CommonJS(`require`) vs ESM, 동적 `import()`, 트리 셰이킹(Tree-shaking), 번들러(Vite/Webpack)의 역할 | 🟡 |
| 32 | **최신 JavaScript 문법 총정리** | ES2020~2025 핵심(옵셔널 체이닝, Nullish Coalescing, `structuredClone`, `Array.at()`, `Object.groupBy()`, Top-level await, `using` 키워드), Polyfill과 Babel의 역할 | 🟡 |

> **실습**: Phase 8의 To-Do 앱을 모듈 단위로 분리 (HTML/CSS/JS 파일 분리)

---

## Phase 10: TypeScript — 안전한 코드의 시작

> 2026년 현업에서 TypeScript 없는 프로젝트는 거의 없다. React + Next.js 모두 TS가 기본

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 33 | **타입 시스템 기초** | 타입 추론(Inference), 기본 타입(string/number/boolean/null/undefined), 배열/튜플/객체 타입, 유니온(`\|`)/인터섹션(`&`), 리터럴 타입 | 🔴 |
| 34 | **interface vs type** | 인터페이스 선언 병합(Declaration Merging), extends vs `&`, 언제 각각 써야 하는가(팀 컨벤션), `readonly`, 인덱스 시그니처 | 🔴 |
| 35 | **제네릭(Generics)** | `<T>` 타입 변수, 제네릭 함수/인터페이스/클래스, 제약 조건(`extends`), 실전: API 응답 래퍼 타입 설계 | 🟡 |
| 36 | **유틸리티 타입과 타입 가드** | `Partial`/`Required`/`Pick`/`Omit`/`Record`/`ReturnType`/`Parameters`, 타입 가드(`typeof`/`in`/`instanceof`/사용자 정의 `is`), 타입 단언(`as`), 판별 유니온(Discriminated Union) | 🟡 |
| 37 | **실무 TypeScript 패턴** | `any` vs `unknown` vs `never`, `as const`, Enum 대안(`const` 객체), API 응답 타입 설계, React 컴포넌트 Props 타입 패턴, `satisfies` 연산자 | 🟡 |

> **실습**: Phase 8의 To-Do 앱을 TypeScript로 전면 마이그레이션

---

### Part 2 면접 핵심 질문

```
🔴 "var/let/const의 차이? 호이스팅이란?"
🔴 "클로저란 무엇이고, 실무에서 어떻게 활용되나요?"
🔴 "this가 결정되는 4가지 규칙을 설명해주세요"
🔴 "이벤트 루프를 설명해주세요 (Call Stack, Microtask, Macrotask)"
🔴 "Promise와 async/await의 관계? 에러 처리는 어떻게?"
🔴 "깊은 복사와 얕은 복사의 차이? 불변성이 왜 중요한가?"
🔴 "이벤트 버블링/캡처링이란? 이벤트 위임은?"
🔴 "브라우저 렌더링 과정을 설명해주세요"
🔴 "CORS란 무엇이고, 왜 발생하며, 어떻게 해결하나요?"
🔴 "type과 interface의 차이? 언제 각각 쓰나요?"
🟡 "any vs unknown vs never의 차이?"
🟡 "제네릭이란? 왜 필요한가?"
🟡 "트리 셰이킹이란?"
```

---
---

# Part 3. React

> 현대 프론트엔드의 사실상 표준 라이브러리.
> React를 "잘" 쓰는 것 = 실무에서 가장 많이 쓰이는 라이브러리 생태계까지 함께 익히는 것.

---

## Phase 11: React 기초 — 선언적 UI의 혁명

> "왜 React인가?"부터 시작. jQuery 시대와 비교하며 혁명을 체감

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 38 | **React의 탄생과 철학** | 명령형(jQuery) vs 선언적(React), Virtual DOM, 재조정(Reconciliation), 컴포넌트 기반 설계, 단방향 데이터 흐름(One-way Data Flow), 순수 함수로서의 컴포넌트 | 🔴 |
| 39 | **JSX와 컴포넌트** | JSX 문법(표현식 삽입, 조건부 렌더링, 리스트와 `key`), 함수형 컴포넌트, Props(읽기 전용), `children`, 컴포넌트 합성(Composition) vs 상속 | 🔴 |
| 40 | **State와 이벤트** | `useState`, 불변성과 상태 업데이트(왜 `setState`로만 바꿔야 하는가), 배치 업데이트(Batching), 합성 이벤트(SyntheticEvent), 이벤트 핸들러 네이밍 관례 | 🔴 |
| 41 | **조건부 렌더링과 리스트** | `&&`/삼항/Early Return 패턴, `map`으로 리스트 렌더링, `key`가 필요한 이유(재조정 알고리즘), index를 key로 쓰면 안 되는 이유 | 🔴 |
| 42 | **컴포넌트 생명주기와 useEffect** | 마운트/업데이트/언마운트, `useEffect` 의존성 배열(빈 배열/값 포함/미전달), 클린업 함수, Strict Mode 더블 호출이 의도된 이유 | 🔴 |
| 43 | **useRef와 비제어 컴포넌트** | `useRef`(DOM 접근 + 렌더링 없는 값 저장), 제어 컴포넌트(Controlled) vs 비제어 컴포넌트(Uncontrolled), `forwardRef` | 🟡 |

> **실습**: React로 카운터 + 타이머 앱 (State, Effect, Ref 모두 활용)

---

## Phase 12: React 데이터 흐름과 폼

> 부모 → 자식 데이터 흐름과 폼 처리를 확실하게 잡는 구간

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 44 | **Props 심화와 데이터 흐름** | Props Drilling 문제, State 끌어올리기(Lifting State Up), 역방향 데이터 흐름(콜백 Props), Props 기본값과 타입 | 🔴 |
| 45 | **폼 제어와 유효성 검사** | 제어 컴포넌트 폼 패턴, 다중 입력 핸들링, 실시간 유효성 검사, `<form>` onSubmit + `FormData` 활용, 에러 메시지 표시 패턴 | 🟡 |
| 46 | **데이터 페칭 기초** | `useEffect` + `fetch` 패턴, 로딩/에러/성공 3가지 상태 관리, AbortController로 요청 취소, Race Condition 방지 | 🟡 |

> **실습**: 영화 검색 앱 (외부 API + 검색 폼 + 로딩/에러 처리)

---

## Phase 13: React 심화 패턴 — 면접에서 차이 만드는 구간

> 커스텀 훅, 최적화, Context. 여기를 통과하면 "React 쓸 줄 안다"고 말할 수 있다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 47 | **커스텀 훅 설계** | 로직 재사용의 원칙, 관심사 분리(SoC), `useFetch`/`useDebounce`/`useLocalStorage`/`useMediaQuery` 직접 구현, 훅의 규칙(Rules of Hooks) | 🔴 |
| 48 | **Context API** | `createContext`/`useContext`, Provider 패턴, Context 리렌더링 문제(모든 소비자 리렌더링), 해결법(분리/메모이제이션), 언제 Context를 쓰고 언제 안 쓰는가 | 🔴 |
| 49 | **렌더링 최적화** | `React.memo`, `useMemo`, `useCallback`, React DevTools Profiler로 불필요한 리렌더링 추적, "최적화하지 않는 것이 최선일 때"를 아는 안목, React Compiler(React 19)의 자동 메모이제이션 | 🔴 |
| 50 | **useReducer와 복잡한 상태** | `useReducer` vs `useState` 선택 기준, reducer 패턴(action/dispatch), `useReducer` + Context 조합 | 🟡 |
| 51 | **합성 패턴과 설계 원칙** | Compound Component 패턴, Render Props, 고차 컴포넌트(HOC), 컴포넌트 분리 기준(단일 책임 원칙), Headless UI 패턴 | 🟡 |

> **실습**: 재사용 가능한 모달 컴포넌트 시스템 (커스텀 훅 + Context + 합성 패턴)

---

## Phase 14: React 실무 생태계 — 현업에서 진짜 쓰는 라이브러리

> "React만 알면 되겠지?"는 착각. 실무 프로젝트는 이 라이브러리들의 조합이다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 52 | **TanStack Query (React Query)** | Server State vs Client State 분리의 철학, `useQuery`/`useMutation`, `queryKey` 전략, 캐싱/리패칭/스테일 타임, Optimistic Updates, Infinite Query(무한 스크롤), `queryClient.invalidateQueries`, DevTools | 🔴 |
| 53 | **Zustand 상태 관리** | 왜 Redux가 아닌 Zustand인가(보일러플레이트 비교), `create`로 스토어 생성, selector 패턴(리렌더링 최적화), 미들웨어(`persist`/`devtools`), Zustand vs Jotai vs Recoil 비교 | 🔴 |
| 54 | **React Hook Form + Zod** | 왜 제어 컴포넌트 폼이 대규모에서 느린가, `useForm`/`register`/`handleSubmit`, Zod 스키마 기반 검증(`zodResolver`), 서버 에러 통합, TypeScript 타입 자동 추론, 실무 회원가입 폼 패턴 | 🔴 |
| 55 | **React 19 신기능** | `use()` 훅(Promise/Context 읽기), `useActionState`, `useOptimistic`, `useFormStatus`, `<form>` action에 함수 바인딩, React Compiler 개념, Server Components 도입 배경 | 🟡 |

> **실습**: 쇼핑몰 장바구니 (TanStack Query 서버 상태 + Zustand 클라이언트 상태 + React Hook Form 결제 폼)

---

### Part 3 면접 핵심 질문

```
🔴 "Virtual DOM이란 무엇이고, 왜 쓰나요? 재조정(Reconciliation) 과정?"
🔴 "React에서 상태를 직접 변경하면 안 되는 이유?"
🔴 "useEffect의 의존성 배열을 설명해주세요"
🔴 "key가 필요한 이유? index를 key로 쓰면 안 되는 이유?"
🔴 "useMemo와 useCallback의 차이? 언제 쓰나요?"
🔴 "Context API의 리렌더링 문제와 해결법?"
🔴 "커스텀 훅은 왜 만드나요? 만들 때 주의사항은?"
🔴 "Server State와 Client State의 차이? 왜 분리해야 하나요?"
🔴 "TanStack Query의 캐싱 전략? staleTime과 gcTime?"
🔴 "React Hook Form이 제어 컴포넌트 폼보다 나은 이유?"
🟡 "useReducer는 언제 useState 대신 쓰나요?"
🟡 "Compound Component 패턴이란?"
🟡 "React 19에서 바뀐 핵심은?"
```

---
---

# Part 4. Next.js

> React의 한계를 넘어서는 풀스택 프레임워크.
> 렌더링 전략, 라우팅, API, 캐싱, 인증, DB, 배포까지 — 혼자서 서비스를 만들 수 있는 개발자가 되는 최종장.

---

## Phase 15: Next.js 기초 — 프레임워크의 세계로

> "왜 React만으로는 부족한가?"를 뼛속까지 체감하는 단계

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 56 | **Library vs Framework, IoC** | React(Library) vs Next.js(Framework), 제어의 역전(Inversion of Control), 설정보다 관습(Convention over Configuration), App Router | 🔴 |
| 57 | **렌더링 패러다임의 진화** | CSR → SSR → RSC, 각각의 장단점과 실무 배치 상황, Zero Bundle Size, `'use client'` 지시어, 하이브리드 모델 | 🔴 |
| 58 | **하이드레이션과 네비게이션** | Hydration의 정의, Hydration Mismatch(시간/랜덤/잘못된 HTML), Two-Pass Rendering, `suppressHydrationWarning`, Hard vs Soft Navigation, `<Link>`, Prefetching | 🔴 |
| 59 | **프로젝트 세팅과 구조** | `create-next-app`, TypeScript/Tailwind/App Router/Turbopack, `page.tsx`/`layout.tsx` 절대 규칙, Root Layout(`<html>/<body>` 필수), Colocation, `public/`, Special Files | 🔴 |
| 60 | **중첩 레이아웃과 상태 유지** | Nested Layout 샌드위치 구조, `children` Props, 레이아웃 불변성(Unmount 안 됨), Partial Rendering | 🟡 |

> **실습**: 다중 페이지 웹사이트 (정적 라우팅 + 공통 레이아웃 + 네비게이션)

---

## Phase 16: 라우팅 마스터 — 폴더가 곧 주소다

> Next.js의 심장인 파일 시스템 라우팅을 완벽하게 체화

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 61 | **동적 라우팅 [id]** | `[slug]`, `params`(Next.js 15 Promise), `await params`, `parseInt` 타입 변환, 라우팅 우선순위(정적 > 동적) | 🔴 |
| 62 | **Search Params와 서버 검색** | `?key=value`, `searchParams`(Promise), `<form>` action 서버 검색, `defaultValue`, 정렬+검색 조건 누적 | 🟡 |
| 63 | **Catch-all Segments** | `[...slug]` vs `[[...slug]]`(Optional), 배열로 경로 처리, `slug.join('/')`, Breadcrumb UI 구축, `notFound()` | 🟡 |
| 64 | **Route Groups & Private Folders** | `(소괄호)` URL 미반영 레이아웃 분리, `_언더바` 라우팅 제외, 다중 루트 레이아웃(마케팅 vs 앱), `suppressHydrationWarning` | 🟡 |

> **실습**: 쇼핑몰 상품 목록 → 상세 페이지 (동적 라우팅 + 검색 + Catch-all 카테고리)

---

## Phase 17: 아키텍처 — 서버와 클라이언트의 경계

> 서버 컴포넌트와 클라이언트 컴포넌트를 올바르게 분리하는 것이 Next.js의 핵심

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 65 | **서버 vs 클라이언트 컴포넌트** | 기본값 = 서버, `'use client'` 경계선, console.log로 실행 위치 확인, 서버(DB/보안/SEO) vs 클라이언트(onClick/useState/브라우저 API) 선택 기준 | 🔴 |
| 66 | **Composition 패턴** | 나뭇잎 패턴(Leaf Component), `'use client'` 전염성(번들 오염), children 주입으로 서버 컴포넌트 보존, Provider 래퍼 설계 | 🔴 |
| 67 | **3대 안전장치** | `not-found.tsx` + `notFound()` (404 커스텀), `loading.tsx` + Streaming SSR + `<Suspense>` fallback + 스켈레톤 UI, `error.tsx` + `reset()` + `global-error.tsx` + `digest` | 🔴 |

> **실습**: 대시보드 (사이드바 레이아웃 + 서버/클라이언트 분리 + 로딩/에러 처리)

---

## Phase 18: 데이터 패칭과 캐싱 — 성능의 끝판왕

> 주니어 코더와 시니어 아키텍트를 가르는 결정적 구간. 면접 최다 출제

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 68 | **서버 컴포넌트 페칭** | `async/await` 컴포넌트, `fetch` + `!res.ok` → error.tsx 연동, Zero Bundle Size, 네트워크 탭에 안 찍히는 이유 | 🔴 |
| 69 | **캐싱: Dynamic vs Static** | Next.js 15 Opt-in 철학(기본=동적), `no-store` vs `force-cache`, 컴파일러 SSG 판단 기준 3가지, 빌드 로그(○/ƒ/●), Data Cache vs Full Route Cache | 🔴 |
| 70 | **ISR & Revalidation** | `next: { revalidate: N }`, SWR(Stale-While-Revalidate) 패턴, TTL, `export const revalidate`, 프로덕션 테스트 필수 | 🔴 |
| 71 | **generateStaticParams** | 빌드 타임 정적 생성, 문자열 반환 필수, `dynamicParams`(true/false), 오프라인에서도 동작 | 🟡 |
| 72 | **generateMetadata & SEO** | 동적 메타데이터, Open Graph(소셜 공유 카드), Request Memoization(중복 요청 자동 제거) | 🟡 |

> **실습**: 뉴스 포털 (ISR 메인 + 정적 빌드 상세 + SEO 메타데이터)

---

## Phase 19: API & Mutation — 풀스택으로의 전환

> "프론트엔드 개발자도 API를 만들 수 있다"는 패러다임 전환

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 73 | **RESTful API 설계** | REST(명사+동사), HTTP 메서드, 상태 코드(200/201/400/401/403/404/500), JSON, PATCH vs PUT | 🔴 |
| 74 | **Route Handlers** | `route.ts` 규칙(page.tsx 공존 금지), GET/POST, `NextRequest`/`NextResponse`, `nextUrl.searchParams`, 동적 `[id]/route.ts` | 🟡 |
| 75 | **Server Actions & 'use server'** | RPC 부활, `FormData`, `<form action={fn}>`, API Route vs Server Actions 비교(DX/타입안전/캐시연동), 빌드 타임 Hidden Endpoint 생성 | 🔴 |
| 76 | **useFormStatus & useActionState** | `pending` 다중 클릭 방어(자식 컴포넌트 분리 필수), `prevState` 주입, `formAction`으로 TypeScript 에러 해결, 서버 결과 자동 동기화 | 🟡 |
| 77 | **캐시 무효화 & Mutation 패턴** | `revalidatePath`(경로 타격), `revalidateTag`(태그 마킹), `redirect`(마지막 호출 필수), 캐싱의 역설 | 🔴 |
| 78 | **낙관적 업데이트** | `useOptimistic`, 0초 렌더링 일루전, 자동 롤백 메커니즘, 좋아요 토글 실전, 서버 지연 1초 + 10% 에러 시뮬레이션 | 🟡 |

> **실습**: 풀스택 게시판 (CRUD + Server Actions + 캐시 무효화 + Optimistic UI)

---

## Phase 20: 인증과 보안 — 서비스의 방패

> 로그인 없는 서비스는 없다. HTTP 무상태성을 이해하고 인증을 구현

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 79 | **HTTP 무상태성과 인증/인가** | Stateless 설계 이유(Scale-out), 인증(Authentication/401) vs 인가(Authorization/403), Session vs JWT 비교, Cookie 보안 속성(HttpOnly/Secure/SameSite) | 🔴 |
| 80 | **Middleware** | `middleware.ts` 위치와 실행 시점, NextRequest/NextResponse, 인증 가드(쿠키 검증 → 리다이렉트), Matcher(경로 필터링), 성능 주의사항 | 🟡 |
| 81 | **NextAuth.js (Auth.js) 실전** | OAuth Provider(Google/GitHub/Kakao), Session 전략 vs JWT 전략, `auth()` 서버 함수, Protected Routes, 역할 기반 접근 제어(RBAC) | 🟡 |

> **실습**: 소셜 로그인 (Google OAuth + 미들웨어 가드 + 보호된 라우트)

---

## Phase 21: 캐싱 심화 & 고급 라우팅

> 면접에서 차별화되는 고급 주제. 알면 무조건 가산점

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 82 | **마이크로 캐싱 & PPR** | 매크로(페이지 단위) 한계, `'use cache'` 컴포넌트 단위 캐싱, `cacheLife`(TTL), `cacheTag`/`updateTag`, `<Suspense>` 방호벽, PPR(Partial Prerendering) 빌드 로그(◐), Streaming SSR | 🟢 |
| 83 | **Memoization & HTTP 캐시 제어** | Request Memoization(렌더링 내 중복 제거), `Cache-Control`/`s-maxage`/`stale-while-revalidate`, CDN/프록시, `logging.fetches` 엑스레이 | 🟢 |
| 84 | **병렬 라우트(Parallel Routes)** | `@folder` 슬롯, layout.tsx 조립, `default.tsx` 필수, 장애 격리(Fault Isolation), 독립적 로딩/에러 | 🟢 |
| 85 | **인터셉팅 라우트 & 모달** | `(..)` 문법, Soft vs Hard Navigation 분기, `@modal` + `(..)` 융합(인스타그램 모달), History Stack(LIFO), `router.back()` vs `<Link>`, URL 상태 동기화 | 🟢 |

> **실습**: 인스타그램 스타일 사진 피드 (병렬 라우트 + 인터셉팅 모달 + URL 동기화)

---

## Phase 22: 데이터베이스와 ORM

> 프론트엔드도 DB를 이해해야 풀스택이 된다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 86 | **Prisma ORM 실전** | Schema 정의(`model`/`@id`/`@default`), Migration(`prisma migrate`), CRUD(`create`/`findMany`/`update`/`delete`), 관계 매핑(1:N/N:M `@relation`), Prisma Client, `.env` DB URL, Connection Pool, `prisma studio` | 🟡 |
| 87 | **Server Actions + Zod + Prisma 통합** | Zod 스키마 서버 사이드 검증, `safeParse`, 에러 메시지 한글화, FormData → Zod → Prisma 파이프라인, `revalidatePath` 연동 | 🟡 |

> **실습**: 풀스택 블로그 (Prisma DB + CRUD Server Actions + Zod 검증)

---

## Phase 23: 배포와 운영

> 로컬에서만 돌리면 의미 없다. 배포까지가 개발이다

| # | 주제 | 핵심 키워드 | 면접 |
|---|------|------------|------|
| 88 | **Vercel 배포와 환경 변수** | Vercel CLI, Git 연동 자동 배포, 환경 변수(`NEXT_PUBLIC_` vs 서버 전용), Preview/Production 분리, 도메인 연결 | 🟡 |
| 89 | **성능 최적화와 Web Vitals** | Core Web Vitals(LCP/INP/CLS), Lighthouse 분석, `next/image` 이미지 최적화(WebP/lazy loading/blur placeholder), 번들 분석(`@next/bundle-analyzer`), `next/font` 폰트 최적화, `React.lazy`/dynamic import | 🔴 |
| 90 | **SEO 완벽 가이드 & 배포 체크리스트** | `sitemap.xml`/`robots.txt`(App Router 자동 생성), canonical URL, JSON-LD 구조화 데이터, OG 디버거, 배포 전 체크리스트(HTTPS/에러 페이지/성능/접근성) | 🟡 |

> **실습**: 기존 프로젝트 Vercel 배포 + Lighthouse 90점 이상 달성

---

## Phase 24: 포트폴리오 프로젝트 — 배운 걸 증명하기

> 이력서에 쓸 수 있는 실전 프로젝트. 여기까지 오면 취업 준비 완료

| # | 주제 | 설명 |
|---|------|------|
| 91 | **프로젝트 설계** | 요구사항 분석, 와이어프레임(Figma), DB 스키마(ERD), API 설계, 폴더 구조 설계, 기술 스택 선정과 이유 |
| 92 | **풀스택 CRUD 구현** | Prisma DB + Server Actions + TanStack Query + 검색/필터/페이징 + 이미지 업로드 + Zod 검증 |
| 93 | **인증 & 권한 시스템** | NextAuth 소셜 로그인 + 미들웨어 가드 + 역할 기반 접근 제어(RBAC) + 보호된 라우트 |
| 94 | **성능 최적화 & 테스트** | ISR/PPR 적용, Lighthouse 90+ 달성, Vitest 단위 테스트, Playwright E2E 테스트 |
| 95 | **배포 & 회고** | Vercel 배포 + GitHub Actions CI/CD + Sentry 에러 추적 + README 작성 + 프로젝트 회고록 + 면접 대비 정리 |

---
---

## 학습 가이드

### 난이도와 예상 소요 기간

```
Part 1 (HTML/CSS):       2~3주    ← 급하게 넘기고 싶겠지만 여기가 기초 체력
Part 2 (JS/TS):          4~5주    ← 가장 오래 걸리지만 가장 중요. 면접 3대장이 여기
Part 3 (React):           4~5주    ← "아하!" 순간이 오는 구간 + 실무 라이브러리
Part 4 (Next.js):         5~6주    ← 풀스택 전환 + DB + 인증 + 배포 + 프로젝트

총 약 15~19주 (4~5개월, 하루 3시간 기준)
```

### 매일 학습 루틴

```
1. 개념 읽기 (비유로 이해)             → 30분
2. 코드 직접 쳐보기 (복붙 금지!)        → 1~2시간
3. 면접 Q&A 소리내어 답변해보기          → 15분
4. 모르는 부분 질문하기                 → 수시
```

### 실무에서 가장 많이 쓰는 기술 스택 (2026년 기준)

```
언어:        TypeScript (JavaScript 위에 타입 안전성)
UI 라이브러리: React 19
프레임워크:    Next.js 15+
스타일링:     Tailwind CSS v4
상태 관리:    Zustand (클라이언트) + TanStack Query (서버)
폼 처리:     React Hook Form + Zod
인증:        NextAuth.js (Auth.js)
DB/ORM:      Prisma + PostgreSQL (or Supabase)
테스트:      Vitest + React Testing Library + Playwright
배포:        Vercel (or Docker + AWS)
CI/CD:       GitHub Actions
모니터링:     Sentry + Vercel Analytics
UI 컴포넌트:  shadcn/ui (선택사항이지만 실무에서 압도적 점유율)
```

---

## 기존 학습 자료 매핑

> 이미 정리된 자료가 어느 Phase에 해당하는지 참고

| 기존 자료 | 커리큘럼 Phase | 비고 |
|---|---|---|
| React 정리 (01~09) | Phase 11~13 (38~51) | `frontend/react/` 폴더 |
| Next Part 1 (01~07.md) | Phase 15~18 (56~72) | `Next 마스터 자료/part1/` |
| Next Part 2 - 01. Route Handlers | Phase 19 (73~74) | `part2/01.md` |
| Next Part 2 - 02. Server Actions | Phase 19 (75~78) | `part2/02.md` |
| Next Part 2 - 03. 캐싱 혁명 | Phase 18, 21 (69~70, 82~83) | `part2/03.md` |
| Next Part 2 - 04. 고급 라우팅 | Phase 21 (84~85) | `part2/04.md` |

---

## 변경 이력

| 날짜 | 변경 내용 |
|---|---|
| 2026-03-21 | 독립 커리큘럼 전면 재설계 — 4 Part, 24 Phase, 95개 주제 |

### 2026-03-21 설계 상세

```
기존: Next.js 강의 매핑 커리큘럼 (10 Phase, 65개 주제)
변경: "2~3년차 실무 수준 프론트엔드 개발자 양성" 관점에서 완전히 새로 설계

설계 원칙:
  1. Part 4개로 대분류 (HTML/CSS → JS/TS → React → Next.js)
  2. 각 Part 내부를 Phase로 세분화 (총 24 Phase)
  3. 모든 주제에 면접 우선순위 (🔴/🟡/🟢) 부여
  4. Phase마다 직접 만드는 실습 프로젝트 명시
  5. Part마다 면접 킬러 질문 모음 수록
  6. 2026년 실무 표준 기술 스택 반영
     (TanStack Query, Zustand, Zod, React Hook Form, Prisma, NextAuth, shadcn/ui)
  7. 기존 강의 자료는 "학습 자료 매핑"에서 Phase와 연결
  8. 기존 강의에서 빠졌던 핵심 보강:
     - Phase 0~4: 웹 기초/CSS/Tailwind (프론트엔드 기초 체력)
     - Phase 5~9: JavaScript 심화 (클로저/이벤트 루프/비동기 = 면접 3대장)
     - Phase 10: TypeScript (현업 필수)
     - Phase 14: React 실무 생태계 (TanStack Query, Zustand, RHF+Zod)
     - Phase 20: 인증/미들웨어/NextAuth
     - Phase 22: Prisma DB 연동
     - Phase 23: 배포/성능/SEO
     - Phase 24: 포트폴리오 프로젝트
```

---

> 이 커리큘럼은 학습 진도와 목표에 맞춰 유동적으로 조정합니다.
> 새로운 주제가 필요하면 기존 Phase에 삽입하거나, 순서를 바꿀 수 있습니다.
