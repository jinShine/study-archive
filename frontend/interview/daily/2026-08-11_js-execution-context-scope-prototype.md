# JavaScript 실행 원리 심화 · 실행 컨텍스트 · 스코프 체인 · 호이스팅 · this · 프로토타입 체인 · 상속

> 주제: 신입~주니어 프론트엔드가 면접에서 "var/let 차이 알아요, this는 호출 방식이래요"를 넘어 "JS 엔진이 코드를 실행하기 전에 무엇을(실행 컨텍스트) 만들고, 식별자를 어떤 순서로(스코프 체인) 찾으며, 왜 호이스팅과 TDZ가 생기고, this가 어떤 규칙으로 결정되며, 객체가 없는 속성을 어떻게(프로토타입 체인) 찾아 올라가고, class/extends가 내부적으로 무엇인지"를 엔진 동작 수준으로 설명할 줄 안다를 보여주는 심화 — 실행 컨텍스트 2단계(생성/실행), 렉시컬 환경, 스코프 체인, 호이스팅과 TDZ, `this` 4대 규칙과 화살표 함수, `call/apply/bind`, 프로토타입 체인과 `[[Prototype]]`, `new`의 동작, `class`/상속의 실체
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화
> 출처: 일일 심화 자료 (기존 3.js.md Q39 "호이스팅"·Q41 "스코프 체인"·Q42 "this"·Q43 "실행 컨텍스트"·Q44 "프로토타입"·Q48 "클래스"의 심화 통합·확장편 · daily 미다룸 주제. 7/22 비동기/이벤트루프·8/9 React 훅 클로저와 상호 보완하는 **동기 실행 모델·객체 모델** 편)

---

이 문서는 자바스크립트 엔진이 코드를 **어떻게 실행하는가**를 두 축으로 관통합니다. 하나는 **실행의 축**(실행 컨텍스트 → 스코프 → 호이스팅 → this), 다른 하나는 **객체의 축**(프로토타입 체인 → new → class/상속). 이 둘을 이해하면 "왜 이렇게 동작하지?"라는 대부분의 JS 질문에 근거를 대고 답할 수 있습니다.

---

## Q1. 실행 컨텍스트(Execution Context)란 무엇이고, 왜 두 단계로 나뉘나요? 🔴

**💬 30초 답변**
> 실행 컨텍스트는 코드가 실행될 때 엔진이 만드는 **"이 코드가 실행될 환경 정보 묶음"**입니다. 안에는 변수·함수 식별자를 담는 **렉시컬 환경**, 외부 스코프를 가리키는 참조, 그리고 `this` 값이 들어 있습니다. 핵심은 컨텍스트가 **생성 단계(코드 실행 전 스캔)**와 **실행 단계(한 줄씩 실행)** 두 단계로 나뉜다는 점인데, 호이스팅·TDZ·스코프가 모두 이 "생성 단계"에서 결정되기 때문입니다.

**📖 핵심 개념**

🎯 **비유**: 연극 무대를 생각하세요. 배우들이 등장(코드 실행)하기 **전에** 무대 세팅(등장인물 목록·소품 배치)이 먼저 이뤄집니다. JS 엔진도 함수를 실행하기 전에 먼저 "이 스코프에 어떤 변수·함수가 있는지" 목록을 만들어 두고(생성 단계), 그다음 대본을 한 줄씩 읽습니다(실행 단계). 호이스팅은 마술이 아니라, 이 "먼저 세팅한다"의 결과입니다.

📌 **실행 컨텍스트의 구성 요소 (현대 ES 스펙 기준)**

- **LexicalEnvironment(렉시컬 환경)**: `let`/`const`/함수 선언 식별자를 담음. 그리고 **바깥 환경 참조(OuterEnv)**를 가짐 → 이것이 스코프 체인의 링크.
- **VariableEnvironment(변수 환경)**: `var` 식별자를 담음. (초기에는 LexicalEnvironment와 같은 곳을 가리키지만 `var`와 `let`을 구분해 관리)
- **ThisBinding**: 이 컨텍스트의 `this` 값.

📌 **두 단계**

1. **생성 단계 (Creation / 평가 단계)** — 코드 실행 전
   - 스코프에 선언된 식별자를 미리 등록한다.
   - `var` → `undefined`로 초기화(그래서 접근 가능, 값은 undefined).
   - `let`/`const` → 등록만 하고 **초기화 안 함** → TDZ(사각지대) 발생.
   - 함수 선언문 → **함수 전체를 통째로** 메모리에 올림(그래서 선언 전 호출 가능).
   - `this` 값 결정, OuterEnv(스코프 체인) 연결.
2. **실행 단계 (Execution)** — 한 줄씩
   - 변수에 실제 값 할당, 함수 호출 시 새 실행 컨텍스트 생성.

📌 **콜 스택(Call Stack)**: 실행 컨텍스트는 **스택(LIFO)**에 쌓입니다. 함수 호출 = push, 반환 = pop.

```js
function outer() {
  console.log("outer 시작");
  inner();
  console.log("outer 끝");
}
function inner() {
  console.log("inner 실행");
}
outer();
```

```
콜 스택 변화 (LIFO)
1) [전역 EC]
2) [전역 EC, outer EC]          // outer() 호출
3) [전역 EC, outer EC, inner EC] // inner() 호출 → "inner 실행"
4) [전역 EC, outer EC]           // inner 반환(pop)
5) [전역 EC]                     // outer 반환(pop)

출력: "outer 시작" → "inner 실행" → "outer 끝"
```

> 💡 콜 스택이 한계를 넘으면 `RangeError: Maximum call stack size exceeded`(스택 오버플로 — 종료 조건 없는 재귀가 대표 원인).

**🔥 예상 꼬리질문**
- Q. 실행 컨텍스트는 함수마다 생기나요? → A. 네. 함수가 **호출될 때마다** 새 실행 컨텍스트가 생성되어 콜 스택에 쌓입니다. 같은 함수를 재귀로 3번 부르면 컨텍스트도 3개. (그래서 각 호출은 자기만의 지역 변수 공간을 가짐)
- Q. 생성 단계에서 결정되는 게 정확히 뭔가요? → A. ① 식별자 등록(호이스팅) ② `this` 바인딩 ③ 스코프 체인(OuterEnv) 연결. 값 할당은 실행 단계.
- Q. `var`와 `let`은 왜 다르게 취급되나요? → A. 스펙상 `var`는 VariableEnvironment에서 생성 즉시 `undefined`로 초기화, `let`/`const`는 LexicalEnvironment에 등록만 되고 선언문 실행 시점에 초기화 → 그 사이 구간이 TDZ.

<details><summary>📝 한 줄 요약</summary>실행 컨텍스트 = 코드 실행 환경 묶음(렉시컬 환경 + 외부 참조 + this). 생성 단계에서 식별자·this·스코프를 미리 세팅하고(호이스팅·TDZ의 근원), 실행 단계에서 한 줄씩 실행하며 콜 스택에 쌓인다.</details>

---

## Q2. 스코프와 스코프 체인은 어떻게 동작하나요? 렉시컬 스코프란? 🔴

**💬 30초 답변**
> 스코프는 **식별자(변수·함수)에 접근할 수 있는 범위**입니다. 어떤 변수를 참조하면 엔진은 현재 스코프에서 찾고, 없으면 **바깥 스코프로 한 단계씩 올라가며** 찾는데(스코프 체인) 전역까지 없으면 `ReferenceError`입니다. 자바스크립트는 **렉시컬(정적) 스코프**라서, 스코프는 함수가 **어디서 호출됐는지가 아니라 어디서 정의됐는지(코드 작성 위치)**로 결정됩니다.

**📖 핵심 개념**

🎯 **비유**: 사무실에서 스테이플러를 찾는다고 해봅시다. 먼저 내 책상 서랍(현재 스코프)을 열고, 없으면 우리 팀 공용 캐비닛(바깥 스코프), 그래도 없으면 회사 비품실(전역)로 갑니다. 방향은 항상 **안 → 밖**이고 절대 반대로는 못 갑니다. 그리고 이 "찾아 올라가는 경로"는 내 책상이 **물리적으로 어디에 놓였는지(코드가 어디 적혔는지)**로 정해집니다.

📌 **렉시컬(정적) 스코프 vs 동적 스코프**

```js
const x = "global";
function foo() {
  console.log(x); // 어떤 x?
}
function bar() {
  const x = "bar";
  foo(); // bar 안에서 호출했지만...
}
bar(); // "global"
```

`foo`는 **정의된 위치**(전역)에서 `x`를 찾습니다. `bar`가 자기 지역 `x`를 갖고 있어도 무관합니다. JS는 **호출 위치가 아닌 정의 위치**로 스코프를 결정하기 때문(렉시컬 스코프)입니다. 만약 동적 스코프였다면 "bar"가 출력됐을 겁니다.

📌 **스코프 체인 = OuterEnv 링크의 연결**
- 각 실행 컨텍스트의 렉시컬 환경은 자신을 감싸는 환경(OuterEnv)을 가리킴.
- 이 OuterEnv는 **함수가 생성된 시점**(정의 위치)에 결정됨 → 렉시컬.

```js
const a = 1;
function outer() {
  const b = 2;
  function inner() {
    const c = 3;
    console.log(a, b, c); // 1 2 3
    // c는 inner에서, b는 outer에서, a는 전역에서 찾음
  }
  inner();
}
outer();
```

```
inner의 스코프 체인 (안 → 밖)
inner LexEnv {c} → outer LexEnv {b} → 전역 LexEnv {a, outer} → null
```

📌 **블록 스코프**: `let`/`const`/함수 선언은 `{}` 블록마다 스코프를 만듭니다. `var`는 함수 스코프만 가집니다(블록 무시).

```js
if (true) {
  var v = "var";
  let l = "let";
}
console.log(v); // "var" (함수/전역 스코프라 밖에서 접근 가능)
console.log(l); // ReferenceError (블록 스코프라 블록 밖에선 없음)
```

📌 **클로저와의 연결**: 클로저는 "함수가 **정의될 때의 렉시컬 환경(스코프 체인)을 기억**하는 현상"입니다. 즉 스코프 체인의 자연스러운 결과물입니다. (자세한 클로저·stale closure는 7/22, 8/9 자료 참고)

**🔥 예상 꼬리질문**
- Q. 스코프 체인은 언제 결정되나요? → A. 함수가 **정의(생성)될 때** OuterEnv가 고정됩니다. 호출될 때가 아닙니다. 이것이 렉시컬 스코프의 핵심.
- Q. `this`도 렉시컬하게 정해지나요? → A. 일반 함수의 `this`는 렉시컬이 **아니라** 호출 방식으로 동적 결정됩니다(다음 질문). 단, 화살표 함수의 `this`만 렉시컬. 스코프(변수 탐색)와 this는 서로 다른 메커니즘이라는 걸 구분해 답하면 좋습니다.
- Q. 전역 변수를 남발하면 왜 안 좋나요? → A. 스코프 체인 최상단이라 어디서든 덮어써질 수 있어 충돌·예측 불가·메모리 상주. 모듈 스코프/IIFE/블록 스코프로 캡슐화하는 게 정석.

<details><summary>📝 한 줄 요약</summary>스코프는 식별자 접근 범위, 스코프 체인은 안→밖으로 식별자를 찾아 올라가는 경로. JS는 렉시컬(정적) 스코프라 함수가 "정의된 위치"로 결정되며, 이 OuterEnv 링크가 클로저의 토대다.</details>

---

## Q3. 호이스팅과 TDZ(Temporal Dead Zone)를 설명해 주세요. 🔴

**💬 30초 답변**
> 호이스팅은 변수·함수 선언이 스코프 최상단으로 "끌어올려진 것처럼" 동작하는 현상입니다. 실제로 코드가 이동하는 게 아니라, **생성 단계에서 식별자를 미리 등록**하기 때문입니다. `var`는 `undefined`로 초기화되어 선언 전 접근 시 `undefined`, 함수 선언문은 통째로 올라가 선언 전 호출이 가능합니다. 반면 `let`/`const`는 등록은 되지만 초기화 전까지 접근이 막히는데(TDZ), 이 구간에서 접근하면 `ReferenceError`가 납니다.

**📖 핵심 개념**

📌 **선언 종류별 호이스팅 동작 (면접 표)**

| 선언 | 생성 단계 처리 | 선언 전 접근 |
|------|----------------|--------------|
| `var` | `undefined`로 초기화 | `undefined` (에러 아님) |
| `let` / `const` | 등록만, 초기화 X | ❌ `ReferenceError` (TDZ) |
| 함수 선언문 `function f(){}` | 함수 전체 등록 | ✅ 정상 호출 |
| 함수 표현식 `const f = () => {}` | 변수 규칙 따름(`const`면 TDZ) | ❌ |

```js
console.log(a); // undefined  (var는 undefined로 초기화됨)
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 2;

foo(); // "hi"  (함수 선언문은 통째로 호이스팅)
function foo() { console.log("hi"); }

bar(); // TypeError: bar is not a function  (표현식은 var 규칙 → undefined 호출)
var bar = function () {};
```

📌 **TDZ(일시적 사각지대)란**
- 스코프 시작 ~ `let`/`const` 선언문이 실행되는 시점까지의 구간.
- 이 구간에서 해당 변수에 접근하면 `ReferenceError`.
- **왜 존재하나?** `const`가 "선언 전 undefined였다가 나중에 값이 생김"을 허용하면 불변 개념이 깨지고, `var`의 "선언 전 undefined" 버그(오타·논리 오류 은폐)를 막기 위해 **의도적으로** 만든 안전장치.

```js
{
  // 여기부터 TDZ 시작 (name은 이미 스코프에 등록됨, 하지만 접근 불가)
  // console.log(name); // ReferenceError
  const name = "Kim"; // 여기서 TDZ 종료, 초기화
  console.log(name);   // "Kim"
}
```

📌 **함정: `typeof`도 TDZ에선 에러**
```js
console.log(typeof undeclared); // "undefined" (아예 선언 안 된 변수 → 안전)
console.log(typeof x); // ReferenceError (TDZ) — x는 선언은 됐지만 초기화 전
let x = 1;
```

📌 **함수 선언 vs 표현식 실무 시사점**: 함수 선언문은 어디서든 호출 가능해 편하지만, 큰 파일에서 "정의 전 사용"이 가독성을 떨어뜨림. 팀에 따라 `const fn = () => {}` 표현식으로 통일해 "선언 전 사용 불가"를 강제하기도 함.

**🔥 예상 꼬리질문**
- Q. 호이스팅은 실제로 코드가 위로 이동하나요? → A. 아니요. 코드는 그대로 있고, **생성 단계에서 식별자를 먼저 스코프에 등록**할 뿐입니다. "끌어올려진 것처럼 보이는" 결과일 뿐.
- Q. `let`도 호이스팅되나요? → A. 됩니다. 스코프에 등록은 됩니다. 다만 `undefined`로 **초기화되지 않아** 접근이 막히는 것(TDZ)이라, "호이스팅 안 된다"가 아니라 "호이스팅되지만 초기화 전 접근 금지"가 정확한 표현.
- Q. 같은 스코프에 `function foo`와 `var foo`가 둘 다 있으면? → A. 함수 선언이 먼저 올라가고, 그 뒤 `var`는 이미 존재하므로 무시(값 할당이 있으면 실행 단계에서 덮어씀). 함수 선언 우선.

<details><summary>📝 한 줄 요약</summary>호이스팅 = 생성 단계의 식별자 사전 등록 결과. var는 undefined 초기화·함수 선언문은 통째로 올라가 선언 전 사용 가능. let/const는 등록되지만 초기화 전 접근 금지(TDZ→ReferenceError)로, var의 버그를 막는 의도적 안전장치.</details>

---

## Q4. `this`는 어떻게 결정되나요? 4대 규칙과 화살표 함수 🔴

**💬 30초 답변**
> 일반 함수의 `this`는 **선언 위치가 아니라 "어떻게 호출됐는지"**로 런타임에 결정됩니다. 규칙은 우선순위 순으로 ① `new` 호출 → 새 인스턴스, ② `call/apply/bind` 명시적 바인딩 → 지정 객체, ③ 메서드 호출 `obj.fn()` → 그 객체, ④ 일반 호출 `fn()` → 전역(strict 모드는 `undefined`)입니다. 화살표 함수는 예외로, 자기 `this`가 없고 **정의된 곳의 상위 this를 렉시컬하게** 그대로 씁니다.

**📖 핵심 개념**

📌 **우선순위 (위가 강함)**

```js
// ① new 바인딩 — 가장 강함
function Person(name) { this.name = name; }
const p = new Person("Kim"); // this = 새 객체 p

// ② 명시적 바인딩 call/apply/bind
function greet() { console.log(this.name); }
const user = { name: "Lee" };
greet.call(user);  // "Lee"
greet.apply(user); // "Lee"
const bound = greet.bind(user);
bound();           // "Lee"

// ③ 메서드(암시적) 바인딩 — "점 왼쪽"이 this
const obj = { name: "Park", show() { console.log(this.name); } };
obj.show(); // "Park"  (obj가 this)

// ④ 기본 바인딩 — 그냥 호출
function plain() { console.log(this); }
plain(); // 전역(window/global) — strict 모드에선 undefined
```

📌 **가장 흔한 함정: this 유실(암시적 바인딩 소실)**
```js
const obj = { name: "Kim", show() { console.log(this.name); } };
const fn = obj.show; // 함수만 떼어냄 → 점(.)이 사라짐
fn(); // undefined (혹은 에러) — 일반 호출이 되어 this가 obj가 아님!

setTimeout(obj.show, 100); // 마찬가지로 this 유실
setTimeout(() => obj.show(), 100); // ✅ 화살표로 감싸 호출 형태 유지
setTimeout(obj.show.bind(obj), 100); // ✅ bind로 고정
```

📌 **화살표 함수의 this (렉시컬 this)**
- 자기 `this`가 없음 → 스코프 체인을 타고 **바깥의 this**를 그대로 사용.
- 그래서 `call/apply/bind`로도 화살표 함수의 this는 못 바꿈.

```js
class Timer {
  seconds = 0;
  start() {
    // 화살표: start()의 this(=인스턴스)를 그대로 유지 → this.seconds OK
    setInterval(() => { this.seconds++; }, 1000);
    // 일반 함수였다면 setInterval 콜백의 this는 전역이라 this.seconds가 깨짐
  }
}
```

📌 **주의: 객체 리터럴의 화살표 메서드**
```js
const counter = {
  count: 0,
  inc: () => { this.count++; }, // ❌ 여기 this는 counter가 아니라 상위(모듈/전역)
};
counter.inc();
console.log(counter.count); // 0 (안 올라감)
```
→ 객체 메서드는 화살표보다 축약 메서드 `inc() {}`가 안전.

📌 **`call` vs `apply` vs `bind`**

| 메서드 | 호출 시점 | 인자 전달 |
|--------|-----------|-----------|
| `call` | 즉시 호출 | 나열: `fn.call(ctx, a, b)` |
| `apply` | 즉시 호출 | 배열: `fn.apply(ctx, [a, b])` |
| `bind` | 나중에 (새 함수 반환) | 나열, 부분 적용 가능 |

**🔥 예상 꼬리질문**
- Q. React 클래스 컴포넌트에서 왜 핸들러를 `bind`했나요? → A. `<button onClick={this.handleClick}>`처럼 넘기면 점(.)이 사라져 this가 유실됩니다. 생성자에서 `this.handleClick = this.handleClick.bind(this)` 하거나, 클래스 필드 화살표 `handleClick = () => {}`로 렉시컬 this를 고정합니다.
- Q. strict 모드에서 기본 바인딩이 왜 `undefined`인가요? → A. 실수로 전역 객체를 오염(`this.x = ...`)시키는 버그를 막기 위해서. 모듈(ESM)은 항상 strict라 실무에선 사실상 undefined.
- Q. `bind`를 두 번 하면? → A. 첫 bind가 이긴다(this 재바인딩 불가). 이후 bind는 this엔 영향 없고 인자 부분 적용만 가능.

<details><summary>📝 한 줄 요약</summary>일반 함수 this는 호출 방식으로 결정(우선순위 new > call/apply/bind > 메서드 obj.fn() > 일반 호출=전역/undefined). 점(.)이 사라지면 this 유실. 화살표 함수는 자기 this 없이 상위의 this를 렉시컬하게 고정한다.</details>

---

## Q5. 프로토타입과 프로토타입 체인이란 무엇인가요? 🔴

**💬 30초 답변**
> 자바스크립트의 모든 객체는 `[[Prototype]]`이라는 숨은 링크로 **다른 객체(프로토타입)를 참조**합니다. 어떤 속성/메서드에 접근할 때 그 객체에 없으면, 이 링크를 타고 **프로토타입을 한 단계씩 거슬러 올라가며** 찾습니다(프로토타입 체인). 최상단은 `Object.prototype`이고 그 위는 `null`입니다. 이 덕분에 메서드를 인스턴스마다 복제하지 않고 프로토타입에 한 번만 두어 **공유**할 수 있습니다.

**📖 핵심 개념**

🎯 **비유**: 상속 재산 찾기. "나(인스턴스)에게 이 물건이 있나?" 없으면 "부모(프로토타입)에게 있나?" 그래도 없으면 "조부모(Object.prototype)에게?" 끝까지 없으면 `undefined`. 스코프 체인이 **변수**를 밖으로 찾아 올라가는 것이라면, 프로토타입 체인은 **속성**을 위로 찾아 올라가는 것 — 서로 다른 체인임에 주의.

📌 **용어 정리 (헷갈림 주의)**

- `[[Prototype]]`: 객체가 가진 **숨은 내부 링크**. 접근은 `Object.getPrototypeOf(obj)` 또는 (비표준이지만 널리 쓰이는) `obj.__proto__`.
- `prototype`: **함수(생성자)**만 가진 속성. `new`로 만든 인스턴스의 `[[Prototype]]`이 가리키게 될 객체.
- 즉 `(new Foo()).__proto__ === Foo.prototype`.

```js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () {
  console.log(`${this.name}가 소리를 냅니다`);
};

const dog = new Animal("멍멍이");
dog.speak(); // "멍멍이가 소리를 냅니다"

// dog 자신엔 speak가 없다. 체인을 타고 Animal.prototype에서 찾음
console.log(dog.hasOwnProperty("speak")); // false (자기 소유 아님)
console.log(dog.hasOwnProperty("name"));  // true  (생성자에서 this.name 할당)
console.log(Object.getPrototypeOf(dog) === Animal.prototype); // true
```

📌 **프로토타입 체인 그림**

```
dog {name:"멍멍이"}
  │ [[Prototype]]
  ▼
Animal.prototype {speak, constructor}
  │ [[Prototype]]
  ▼
Object.prototype {hasOwnProperty, toString, ...}
  │ [[Prototype]]
  ▼
null   ← 체인의 끝
```

📌 **속성 탐색 규칙 (읽기 vs 쓰기)**
- **읽기**: 없으면 체인을 타고 올라가며 찾음.
- **쓰기**: `obj.x = 1`은 체인을 타지 않고 **항상 자기 자신에** 속성을 만든다(프로토타입은 안 바뀜). → 프로토타입의 속성을 "덮어쓴" 것처럼 보이지만 실은 인스턴스에 새로 생긴 것(섀도잉).

```js
Animal.prototype.legs = 4;
const cat = new Animal("야옹이");
console.log(cat.legs); // 4 (프로토타입에서 읽음)
cat.legs = 3;          // 자기 자신에 legs 생성 (프로토타입은 그대로 4)
console.log(cat.legs);              // 3 (인스턴스 소유가 우선)
console.log(Animal.prototype.legs); // 4 (변하지 않음)
```

📌 **왜 중요한가 — 메모리 효율**: 메서드를 생성자 안에서 `this.speak = function(){}`로 만들면 인스턴스 1만 개면 함수도 1만 개 복제됩니다. 프로토타입에 두면 **모든 인스턴스가 하나를 공유** → 메모리 절약. 이것이 프로토타입 기반 언어의 핵심 이점.

**🔥 예상 꼬리질문**
- Q. `__proto__`와 `prototype`의 차이? → A. `prototype`은 **함수(생성자)**의 속성으로 "인스턴스에게 물려줄 객체". `__proto__`(=`[[Prototype]]`)는 **모든 객체**가 가진 "내 부모를 가리키는 링크". `new`가 이 둘을 연결한다: `instance.__proto__ === Constructor.prototype`.
- Q. `hasOwnProperty`는 왜 쓰나요? → A. `for...in`이나 속성 검사에서 **상속받은 것 말고 자기 소유 속성만** 걸러내려고. 체인 오염을 방어. (모던하게는 `Object.hasOwn(obj, key)` 권장)
- Q. 프로토타입 체인이 길면 성능 문제가 있나요? → A. 탐색이 한 단계씩 올라가므로 아주 깊으면 미세한 비용이 있지만, 실무 대부분은 무시 가능. 다만 런타임에 `__proto__`를 바꾸는 건 엔진 최적화를 깨뜨려 피해야 함.

<details><summary>📝 한 줄 요약</summary>모든 객체는 [[Prototype]] 링크로 부모 객체를 가리키고, 없는 속성은 체인을 타고 Object.prototype(→null)까지 올라가며 찾는다. 생성자의 prototype에 메서드를 두면 모든 인스턴스가 공유해 메모리를 아낀다. 쓰기는 체인을 안 타고 항상 자기 자신에 생긴다.</details>

---

## Q6. `new` 연산자는 내부적으로 무슨 일을 하나요? 🟡

**💬 30초 답변**
> `new Foo()`는 네 단계를 자동으로 합니다. ① 빈 객체를 만들고, ② 그 객체의 `[[Prototype]]`을 `Foo.prototype`에 연결하고, ③ 그 객체를 `this`로 바인딩해 `Foo`를 실행하고, ④ 생성자가 객체를 명시적으로 반환하지 않으면 **그 새 객체를 자동 반환**합니다. 이 과정을 알면 프로토타입 체인이 어떻게 연결되는지, 왜 `this`가 새 인스턴스가 되는지가 한 번에 설명됩니다.

**📖 핵심 개념**

```js
function Foo(name) {
  this.name = name;
}

// new Foo("Kim")가 하는 일을 직접 구현하면:
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype); // ①+② 빈 객체 + 프로토타입 연결
  const result = Constructor.apply(obj, args);       // ③ this=obj로 실행
  return typeof result === "object" && result !== null ? result : obj; // ④
}

const a = new Foo("Kim");
const b = myNew(Foo, "Kim");
console.log(a.name, b.name); // "Kim" "Kim"
```

📌 **④ 반환 규칙의 함정**
```js
function Bad() {
  this.x = 1;
  return { y: 2 }; // 객체를 반환하면 그게 인스턴스가 됨!
}
console.log(new Bad()); // { y: 2 }  (this.x=1은 버려짐)

function Ok() {
  this.x = 1;
  return 42; // 원시값 반환은 무시됨
}
console.log(new Ok()); // { x: 1 }
```

📌 **`new.target`**: 함수가 `new`로 호출됐는지 감지. 실수로 `new` 없이 부르는 걸 막을 때 사용.
```js
function User(name) {
  if (!new.target) throw new Error("new로 호출하세요");
  this.name = name;
}
```

**🔥 예상 꼬리질문**
- Q. `new` 없이 생성자를 부르면? → A. 일반 함수 호출이 되어 `this`가 전역(strict면 undefined). `this.name = ...`이 전역을 오염시키거나 에러. `class`는 `new` 없이 호출하면 아예 `TypeError`로 막아줌.
- Q. `Object.create`와 `new`의 차이? → A. `Object.create(proto)`는 지정한 프로토타입을 가진 빈 객체만 생성(생성자 실행 없음). `new`는 그 위에 생성자 로직 실행 + 반환까지 포함.

<details><summary>📝 한 줄 요약</summary>new는 ①빈 객체 생성 ②[[Prototype]]=생성자.prototype 연결 ③this로 바인딩해 생성자 실행 ④객체 미반환 시 새 객체 자동 반환. 생성자가 객체를 return하면 그게 인스턴스가 되는 함정 주의.</details>

---

## Q7. `class`와 `extends`는 프로토타입과 어떤 관계인가요? (상속의 실체) 🔴

**💬 30초 답변**
> ES6 `class`는 **프로토타입 기반 상속을 감싼 문법 설탕(syntactic sugar)**입니다. 내부적으로는 여전히 생성자 함수와 프로토타입 체인으로 동작합니다. 클래스의 메서드는 자동으로 `prototype`에 올라가고, `extends`는 자식의 프로토타입 체인을 부모에 연결합니다. `super()`는 부모 생성자를 호출해 `this`를 초기화하는 역할이라, 자식 생성자에서 `super()` 전에 `this`를 쓰면 에러가 납니다.

**📖 핵심 개념**

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { console.log(`${this.name} 소리`); } // → Animal.prototype.speak
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);       // 부모 생성자 호출 → this.name 세팅 (반드시 this 사용 전에)
    this.breed = breed;
  }
  speak() {            // 오버라이드
    super.speak();     // 부모 메서드 호출
    console.log(`${this.name} 멍멍`);
  }
}

const d = new Dog("바둑이", "진돗개");
d.speak(); // "바둑이 소리" → "바둑이 멍멍"
```

📌 **위 코드의 프로토타입 체인**
```
d {name, breed}
  ▼ [[Prototype]]
Dog.prototype {speak, constructor}
  ▼ [[Prototype]]        ← extends가 연결
Animal.prototype {speak, constructor}
  ▼ [[Prototype]]
Object.prototype
  ▼
null
```

📌 **class가 "그냥 설탕"이 아닌 부분 (차이점)**
- 클래스는 **항상 strict 모드**로 실행.
- **호이스팅되지만 TDZ** 적용 → 선언 전 사용 시 `ReferenceError`(함수 선언과 다름).
- `new` 없이 호출하면 `TypeError`(안전).
- 메서드는 `for...in`에 안 나옴(non-enumerable).

📌 **필드 문법과 this**
```js
class Counter {
  count = 0;                 // 인스턴스 필드 (인스턴스마다 생성)
  static kind = "counter";   // 정적(클래스 자체) 속성
  inc = () => { this.count++; }; // 화살표 필드 → this 고정 (React 핸들러 패턴)
  dec() { this.count--; }        // 프로토타입 메서드 (공유, 단 this 유실 주의)
}
```
- `inc`(화살표 필드)는 인스턴스마다 함수가 생겨 메모리↑지만 this가 안 끊김.
- `dec`(메서드)는 prototype에 공유되지만 떼어내면 this 유실.
→ 트레이드오프를 아는 게 포인트.

**🔥 예상 꼬리질문**
- Q. `super()`를 안 부르면? → A. 자식 생성자가 있는데 `super()`를 호출하지 않고 `this`에 접근하면 `ReferenceError`. 자식은 부모가 `this`를 초기화해줘야 하기 때문. (생성자를 아예 안 쓰면 기본 생성자가 super를 자동 호출)
- Q. 정적 메서드(`static`)는 어디에 붙나요? → A. 프로토타입이 아니라 **클래스(생성자 함수) 자체**에 붙습니다. 인스턴스에선 접근 불가, `ClassName.method()`로만 호출. 유틸/팩토리에 사용.
- Q. 프로토타입 상속과 클래스 상속의 차이? → A. 동작은 같습니다(class는 문법 설탕). 다만 class는 문법이 명확하고, strict·TDZ·new 강제 같은 안전장치가 추가됩니다.
- Q. 다중 상속은 되나요? → A. JS는 단일 프로토타입 체인이라 다중 상속은 없습니다. 필요하면 믹스인(mixin) 패턴(객체 합성)으로 흉내냅니다.

<details><summary>📝 한 줄 요약</summary>class는 프로토타입 상속의 문법 설탕. 메서드는 prototype에 올라가고 extends는 프로토타입 체인을 부모에 연결한다. super()는 부모 생성자로 this를 초기화하므로 super 전 this 접근은 에러. class는 strict·TDZ·new 강제 등 안전장치가 추가된다.</details>

---

## Q8. (통합) 이 개념들이 실무·디버깅에서 어떻게 쓰이나요? 🟡

**💬 30초 답변**
> 실행 컨텍스트·스코프·this·프로토타입은 추상적 이론 같지만, 실제 버그의 원인 대부분이 여기서 나옵니다. `this`가 `undefined`인 콜백, `ReferenceError: before initialization`(TDZ), `for...in`이 상속 속성까지 도는 문제, 반복문 클로저 캡처, 콜 스택 오버플로 재귀 등 — 원리를 알면 스택 트레이스만 보고도 원인을 짚을 수 있습니다.

**📖 핵심 개념 — 실전 디버깅 사전**

📌 **1) `Cannot read properties of undefined (reading 'x')` in 콜백**
→ this 유실. 메서드를 콜백으로 넘길 때 점(.)이 사라짐. `bind` 또는 화살표로 감싸기.

📌 **2) `Cannot access 'x' before initialization`**
→ TDZ. `let`/`const`를 선언 전에 사용. 선언을 위로 올리거나 접근 시점을 늦춤.

📌 **3) 반복문 + 비동기에서 값이 다 마지막 값**
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3 3 3 (var는 함수 스코프 하나 공유)
}
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0 1 2 (let은 반복마다 새 블록 스코프)
}
```
→ `let`은 반복마다 **새 렉시컬 환경**을 만들어 각 클로저가 독립된 `i`를 캡처.

📌 **4) `for...in`이 이상한 키까지 돈다**
→ 프로토타입 체인의 enumerable 속성까지 순회. `Object.keys()`나 `Object.hasOwn(obj, k)`로 자기 소유만.

📌 **5) `Maximum call stack size exceeded`**
→ 종료 조건 없는 재귀. 콜 스택이 넘침. 종료 조건 점검 또는 반복문/트램펄린으로 전환.

📌 **6) 성능: 핫 패스에서 프로토타입 런타임 변경 금지**
→ `obj.__proto__ = ...`, `Object.setPrototypeOf`는 엔진의 히든 클래스 최적화를 깨뜨림. 생성 시점에 형태를 고정.

**🔥 예상 꼬리질문**
- Q. `let`이 반복마다 새 스코프를 만든다는 게 무슨 뜻인가요? → A. `for(let i...)`는 스펙상 각 반복(iteration)마다 `i`를 새 렉시컬 환경에 복사해 바인딩합니다. 그래서 각 콜백이 서로 다른 `i`를 기억(클로저 캡처). `var`는 함수 스코프 하나만 공유해 전부 최종값을 봄.
- Q. 스코프 체인과 프로토타입 체인을 한 문장으로 구분하면? → A. 스코프 체인은 **변수(식별자)**를 렉시컬 환경을 따라 밖으로 찾는 것, 프로토타입 체인은 **객체 속성**을 `[[Prototype]]`을 따라 위로 찾는 것. 방향과 대상이 다른 별개의 메커니즘.

<details><summary>📝 한 줄 요약</summary>this 유실·TDZ·반복문 클로저 캡처(var vs let)·for...in 상속 순회·스택 오버플로는 모두 실행 컨텍스트/스코프/this/프로토타입 원리로 설명·해결된다. 스코프 체인=변수 탐색, 프로토타입 체인=속성 탐색으로 구분해 기억하자.</details>

---

## 🎯 이 문서 핵심 5줄 정리

1. **실행 컨텍스트**는 생성 단계(식별자·this·스코프 사전 세팅)와 실행 단계로 나뉘며, 콜 스택에 쌓인다. 호이스팅·TDZ·스코프가 모두 생성 단계의 산물.
2. **스코프 체인**은 변수를 안→밖으로 찾는 경로이고, JS는 렉시컬(정의 위치) 스코프다. 이 OuterEnv 링크가 클로저의 토대.
3. **호이스팅**은 사전 등록의 결과. var=undefined 초기화, 함수 선언=통째로, let/const=등록만 하고 TDZ로 접근 차단.
4. **this**는 일반 함수는 호출 방식(new>bind/call>메서드>일반)으로, 화살표 함수는 상위 this를 렉시컬하게 결정. 점(.)이 사라지면 유실.
5. **프로토타입 체인**은 속성을 위로 찾는 경로. class/extends는 이를 감싼 문법 설탕이며, new는 객체 생성+프로토타입 연결+this 실행+반환을 자동화한다.
