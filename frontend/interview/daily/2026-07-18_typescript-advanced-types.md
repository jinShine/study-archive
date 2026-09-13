# TypeScript 타입 시스템 심화 (제네릭·유틸리티·조건부/매핑 타입·타입 가드)

> 주제: 신입~주니어가 면접에서 "타입스크립트 좀 아는데?"를 넘어 "타입 시스템을 설계할 줄 안다"를 보여주는 심화 — 제네릭, 유틸리티 타입, 조건부·매핑 타입, 타입 가드, `unknown`/`never`, `satisfies`
> 출처: 일일 심화 자료 (기존 3.js.md Q54 "타입스크립트를 사용하는 이유·interface vs type"의 심화 보강편)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-제네릭generic이란-무엇이고-왜-쓰나요) | 제네릭이란? 왜 쓰나? | 🔴 |
| [D2](#d2-제네릭에-제약조건extends과-기본값을-어떻게-거나요) | 제네릭 제약(extends)·기본값 | 🔴 |
| [D3](#d3-any-unknown-never의-차이를-설명할-수-있나요) | `any` vs `unknown` vs `never` | 🔴 |
| [D4](#d4-타입-가드type-guard와-타입-좁히기narrowing란-무엇인가요) | 타입 가드·좁히기(narrowing) | 🔴 |
| [D5](#d5-유틸리티-타입을-실무에서-어떻게-쓰나요) | 유틸리티 타입 (Partial/Pick/Omit…) | 🔴 |
| [D6](#d6-매핑-타입mapped-type과-keyof를-설명할-수-있나요) | 매핑 타입 · `keyof` | 🟡 |
| [D7](#d7-조건부-타입conditional-type과-infer는-무엇인가요) | 조건부 타입 · `infer` | 🟢 |
| [D8](#d8-satisfies-연산자는-왜-생겼고-언제-쓰나요) | `satisfies` 연산자 | 🟡 |
| [D9](#d9-타입스크립트-타입은-런타임에-남나요-흔한-오해-정리) | 런타임 소거(type erasure)·흔한 오해 | 🟡 |

---

## D1. 제네릭(Generic)이란 무엇이고, 왜 쓰나요? 🔴

**💬 30초 답변**
> 제네릭은 **타입을 값처럼 매개변수로 받는 기능**입니다. 함수·클래스·타입을 정의할 때 구체 타입을 고정하지 않고 `<T>`라는 "타입 변수"로 열어 두면, 사용하는 쪽에서 타입이 결정됩니다. 덕분에 **타입 안전성**과 **재사용성**을 동시에 얻습니다. `any`로 열면 안전성이 사라지고, 타입마다 함수를 복붙하면 재사용성이 사라지는데, 제네릭은 그 둘을 모두 지킵니다.

**📖 핵심 개념**

🎯 **비유**: 제네릭은 **택배 상자**입니다. 상자(함수·자료구조)는 그대로 두고, 안에 뭘 넣느냐(타입)만 그때그때 바뀝니다. 상자를 신발용·책용으로 따로 만들 필요가 없죠.

📌 `any`와 제네릭의 결정적 차이 — **입력과 출력의 타입 연결**

```ts
// ❌ any: 무엇이 들어오든 반환 타입 정보가 사라진다
function identityAny(x: any): any { return x; }
const a = identityAny("hi"); // a: any  → .toFixed() 써도 에러 안 남 (위험)

// ✅ 제네릭: 들어온 타입 T가 그대로 반환 타입으로 이어진다
function identity<T>(x: T): T { return x; }
const b = identity("hi"); // b: string  → b.toFixed()는 컴파일 에러 (안전)
```

📌 **타입 추론(inference)** — 대부분 `<T>`를 명시하지 않아도 된다

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const n = first([1, 2, 3]);      // T = number 로 자동 추론 → n: number | undefined
const s = first(["a", "b"]);     // T = string 로 자동 추론 → s: string | undefined
```

> 💡 면접 포인트: "제네릭은 코드 중복을 줄이려고 쓴다"까지만 말하면 절반입니다. **핵심은 입력·출력·내부 여러 값 사이의 타입 관계를 컴파일러에 알려 주는 것**이라고 답하면 깊이가 드러납니다.

**🔥 예상 꼬리질문**
- Q. `T`, `K`, `V`, `E` 같은 이름은 규칙인가요? → A. 문법이 아니라 **관례**입니다. T=Type, K=Key, V=Value, E=Element. 의미가 뚜렷하면 `TData`처럼 서술형 이름을 써도 됩니다.
- Q. 제네릭을 안 쓰고 유니온으로도 되지 않나요? → A. `string | number`는 "둘 중 하나"만 표현하고 **입력·출력 관계를 못 묶습니다**. 제네릭은 "들어온 그 타입 그대로 나간다"를 표현합니다.
- Q. React에서 제네릭 예시는? → A. `useState<User | null>(null)`, `useRef<HTMLInputElement>(null)`, 그리고 `axios.get<User>()`처럼 응답 타입을 넘기는 경우가 대표적입니다.

<details><summary>📝 한 줄 요약</summary>제네릭 = 타입을 매개변수로 받는 것. `any`와 달리 입력·출력 타입 관계를 유지해 안전성과 재사용성을 동시에 확보한다. 대부분 자동 추론된다.</details>

---

## D2. 제네릭에 제약조건(extends)과 기본값을 어떻게 거나요? 🔴

**💬 30초 답변**
> 제네릭은 기본적으로 "아무 타입"이라 내부에서 프로퍼티 접근이 안 됩니다. `T extends { length: number }`처럼 **`extends`로 제약(constraint)** 을 걸면 "이 조건을 만족하는 타입만 받겠다"가 되어 그 프로퍼티를 안전하게 쓸 수 있습니다. 또 `<T = string>`처럼 **기본값**을 줄 수도 있고, `K extends keyof T`로 **키를 안전하게 참조**하는 패턴이 실무에서 특히 많이 쓰입니다.

**📖 핵심 개념**

🎯 **비유**: 제약조건은 **놀이기구 키 제한선**입니다. "이 선을 넘는 사람만 탑승". 조건을 만족하지 못하는 타입은 애초에 함수에 들어오지 못합니다.

📌 `extends`로 제약 걸기

```ts
// length가 있는 것만 받겠다
function logLength<T extends { length: number }>(x: T): T {
  console.log(x.length); // ✅ 제약 덕분에 안전하게 접근
  return x;
}
logLength("hello");     // ✅ string엔 length 있음
logLength([1, 2, 3]);   // ✅ 배열도 OK
logLength(123);         // ❌ number엔 length 없음 → 컴파일 에러
```

📌 실무 최다 패턴 — `K extends keyof T` (객체에서 안전하게 값 꺼내기)

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Kim", active: true };
const name = getProp(user, "name");   // name: string
const id = getProp(user, "id");        // id: number
getProp(user, "email");                // ❌ "email"은 keyof user가 아님 → 에러
```
> `T[K]`는 **인덱스 접근 타입(indexed access type)** 으로, "T에서 K 키의 값 타입"을 의미합니다. 위 예시에서 반환 타입이 `string`/`number`로 정확히 좁혀지는 게 핵심입니다.

📌 기본값(default type parameter)

```ts
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}
const r1: ApiResponse = { data: "anything", status: 200 };        // T = unknown
const r2: ApiResponse<string[]> = { data: ["a"], status: 200 };   // T = string[]
```

**🔥 예상 꼬리질문**
- Q. `extends`가 상속의 그 extends인가요? → A. 키워드는 같지만 여기선 **"~에 할당 가능한(assignable to)"** 이라는 제약 의미입니다. 조건부 타입에서도 같은 의미로 쓰입니다.
- Q. `keyof T`의 결과 타입은? → A. T의 모든 키를 **문자열 리터럴 유니온**으로 만든 것입니다. 위 user라면 `"id" | "name" | "active"`.
- Q. 제약과 기본값을 같이 쓸 수 있나요? → A. 네. `<T extends object = {}>`처럼 "object여야 하고, 안 주면 `{}`" 형태로 조합합니다.

<details><summary>📝 한 줄 요약</summary>`T extends 조건`으로 받을 타입을 제한하고, `<T = 기본값>`으로 생략 시 기본값을 준다. `K extends keyof T` + `T[K]`는 객체 접근을 타입 안전하게 만드는 실무 핵심 패턴.</details>

---

## D3. `any`, `unknown`, `never`의 차이를 설명할 수 있나요? 🔴

**💬 30초 답변**
> `any`는 **타입 검사를 꺼버리는** 탈출구라 아무 데나 할당·접근 가능하지만 안전성이 사라집니다. `unknown`은 **"타입을 모른다"는 것을 안전하게 표현**하는 타입으로, 무엇이든 담을 순 있지만 **쓰기 전에 반드시 좁혀야(narrowing)** 합니다. `never`는 **절대 발생하지 않는 값**의 타입으로, 예외를 던지는 함수의 반환 타입이나 유니온을 다 소진한 뒤의 "이 분기는 도달 불가"를 표현합니다.

**📖 핵심 개념**

🎯 **비유**: `any`는 **아무나 통과시키는 뚫린 검문소**, `unknown`은 **신분 확인 전엔 통과 못 시키는 정상 검문소**, `never`는 **애초에 아무도 못 지나가는 벽**입니다.

📌 `any` vs `unknown` — 담을 땐 똑같지만, 꺼낼 때 다르다

```ts
let a: any = "hi";
a.toFixed();       // ✅ 컴파일 통과 (하지만 런타임에서 터짐 — 위험)

let u: unknown = "hi";
u.toFixed();       // ❌ 컴파일 에러: "u는 unknown이라 뭘 할지 모른다"
if (typeof u === "number") {
  u.toFixed();     // ✅ 좁힌 뒤엔 안전하게 사용
}
```

📌 `never`가 등장하는 대표 상황

```ts
// 1) 항상 예외를 던지는 함수 → 반환값이 존재할 수 없음
function fail(msg: string): never {
  throw new Error(msg);
}

// 2) 완전성 검사(exhaustiveness check) — switch 빠뜨린 케이스를 컴파일 타임에 잡는다
type Shape = { kind: "circle"; r: number } | { kind: "square"; size: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2;
    case "square": return s.size ** 2;
    default:
      const _exhaustive: never = s; // 새 kind 추가 후 case를 안 만들면 여기서 에러!
      return _exhaustive;
  }
}
```
> 완전성 검사는 실무에서 매우 강력합니다. `Shape`에 `"triangle"`을 추가하면 `area`의 `default`에서 컴파일 에러가 나서, **처리를 빠뜨린 곳을 컴파일러가 자동으로 지목**해 줍니다.

📌 관계 정리

| 타입 | 의미 | 할당 방향 |
|------|------|-----------|
| `any` | 검사 포기 | 아무거나 ↔ any (양방향, 검사 없음) |
| `unknown` | 최상위 타입(top type) | 아무거나 → unknown (담긴 OK, 꺼낼 땐 좁혀야) |
| `never` | 최하위 타입(bottom type) | never → 아무거나 (never는 모든 타입에 할당 가능) |

**🔥 예상 꼬리질문**
- Q. `try/catch`의 error 타입은? → A. 최신 TS에서 catch 변수는 기본 `unknown`입니다. `if (e instanceof Error)`로 좁혀서 써야 안전합니다.
- Q. `never`는 왜 "모든 타입에 할당 가능"인가요? → A. 값이 하나도 없는 공집합이라, "이 값들은 전부 T다"라는 명제가 공허하게 참(vacuously true)이기 때문입니다.
- Q. `any`를 아예 금지할 수 있나요? → A. ESLint `@typescript-eslint/no-explicit-any` 규칙, `tsconfig`의 `noImplicitAny`로 억제합니다. 불가피하면 `unknown` + 좁히기로 대체하는 게 원칙입니다.

<details><summary>📝 한 줄 요약</summary>`any`=검사 포기(위험), `unknown`=안전한 미지 타입(쓰기 전 좁히기 필수), `never`=값이 존재할 수 없는 타입(예외 함수·완전성 검사). "모르면 any 말고 unknown"이 원칙.</details>

---

## D4. 타입 가드(Type Guard)와 타입 좁히기(narrowing)란 무엇인가요? 🔴

**💬 30초 답변**
> 유니온 타입처럼 **여러 후보 타입을 가진 변수를, 특정 코드 블록 안에서 더 구체적인 하나로 좁히는 것**이 narrowing이고, 그걸 유발하는 검사가 타입 가드입니다. `typeof`, `instanceof`, `in`, 리터럴 비교(`===`) 같은 **내장 가드**가 있고, 복잡한 조건은 `x is Type`을 반환하는 **사용자 정의 타입 가드**로 만듭니다. TS 컴파일러는 이 검사 결과를 따라 각 분기에서 타입을 자동으로 좁혀 줍니다.

**📖 핵심 개념**

🎯 **비유**: 유니온 타입은 **"과일 한 개"**(사과일 수도 바나나일 수도)이고, 타입 가드는 **"껍질을 확인하는 행동"** 입니다. 확인하고 나면 그 안에선 "이건 확실히 바나나"로 취급할 수 있죠.

📌 내장 타입 가드

```ts
function format(x: string | number | Date): string {
  if (typeof x === "string") return x.trim();      // 여기서 x: string
  if (typeof x === "number") return x.toFixed(2);  // 여기서 x: number
  return x.toISOString();                          // 남은 것 → x: Date
}
```

📌 `in` 연산자 · 판별 유니온(discriminated union)

```ts
type Admin = { role: "admin"; permissions: string[] };
type User = { role: "user"; lastLogin: Date };

function describe(account: Admin | User) {
  if (account.role === "admin") {
    // role 리터럴로 판별 → account: Admin
    return account.permissions.join(", ");
  }
  return account.lastLogin;  // account: User
}
```
> 공통 리터럴 필드(`role`)로 갈래를 나누는 걸 **판별 유니온**이라 하며, 실무에서 상태·이벤트·API 응답 모델링의 표준 패턴입니다.

📌 사용자 정의 타입 가드 — 반환 타입에 `x is Type`

```ts
interface Cat { meow(): void; }
interface Dog { bark(): void; }

// 반환 타입이 boolean이 아니라 "animal is Cat"
function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined;
}

function speak(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow();  // ✅ Cat으로 좁혀짐
  } else {
    animal.bark();  // ✅ Dog
  }
}
```

> 💡 최신 TS(5.5+)는 `arr.filter(x => x !== null)` 같은 경우 **타입 가드를 자동 추론**하기도 합니다. 다만 복잡한 조건은 명시적 `x is Type`가 여전히 안전합니다.

**🔥 예상 꼬리질문**
- Q. `as`(타입 단언)와 타입 가드의 차이는? → A. `as`는 **검사 없이 컴파일러에게 "믿어"** 라고 하는 것이라 틀리면 런타임에 터집니다. 타입 가드는 **실제 런타임 검사**를 동반해 안전합니다.
- Q. `typeof null`은 뭐가 나오죠? → A. `"object"`입니다. 이 유명한 버그 때문에 null 체크는 `typeof`가 아니라 `x === null` 또는 `x == null`로 합니다.
- Q. 판별 유니온이 왜 좋나요? → A. `default: never` 완전성 검사와 결합하면 케이스 누락을 컴파일 타임에 잡을 수 있어(D3 참고) 상태 처리 버그를 크게 줄입니다.

<details><summary>📝 한 줄 요약</summary>narrowing = 유니온을 분기 안에서 구체 타입으로 좁히기. `typeof`/`instanceof`/`in`/리터럴 비교(내장)와 `x is Type`(사용자 정의) 가드로 수행. `as`와 달리 실제 런타임 검사를 동반해 안전.</details>

---

## D5. 유틸리티 타입을 실무에서 어떻게 쓰나요? 🔴

**💬 30초 답변**
> 유틸리티 타입은 TS가 기본 제공하는 **타입 변형 도구**로, 기존 타입에서 새 타입을 파생시킵니다. `Partial<T>`(모두 선택적), `Required<T>`(모두 필수), `Pick<T, K>`(일부 골라내기), `Omit<T, K>`(일부 제외), `Record<K, V>`(키-값 객체), `Readonly<T>`, `ReturnType<F>` 등이 있죠. 핵심 가치는 **한 원본 타입에서 파생**하므로 원본이 바뀌면 파생 타입도 자동으로 따라와 **중복과 불일치를 없앤다**는 점입니다.

**📖 핵심 개념**

🎯 **비유**: 원본 타입이 **원본 사진**이라면 유틸리티 타입은 **필터**입니다. 흑백(Readonly)·일부 잘라내기(Pick)·모자이크(Partial)를 씌워도 원본이 바뀌면 결과도 같이 바뀝니다.

📌 자주 쓰는 것들 — 한 원본에서 파생

```ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// 수정 폼: 모든 필드가 선택적
type UserPatch = Partial<User>;
// { id?: number; name?: string; ... }

// 목록 카드: 민감정보 빼고 일부만
type UserCard = Pick<User, "id" | "name">;
// { id: number; name: string }

// 응답 DTO: password만 제외
type UserDTO = Omit<User, "password">;
// { id; name; email }

// 권한 맵: 문자열 키 → boolean
type Permissions = Record<"read" | "write" | "delete", boolean>;
// { read: boolean; write: boolean; delete: boolean }
```

📌 함수에서 타입을 뽑아내는 것들 (🟡)

```ts
function createUser(name: string, age: number) {
  return { id: Date.now(), name, age };
}
type NewUser = ReturnType<typeof createUser>; // { id: number; name: string; age: number }
type Args = Parameters<typeof createUser>;    // [name: string, age: number]
```

📌 대표 유틸리티 요약

| 유틸리티 | 하는 일 |
|---------|---------|
| `Partial<T>` | 모든 프로퍼티를 선택적(`?`)으로 |
| `Required<T>` | 모든 프로퍼티를 필수로 |
| `Readonly<T>` | 모든 프로퍼티를 읽기 전용으로 |
| `Pick<T, K>` | T에서 K 키들만 골라 새 타입 |
| `Omit<T, K>` | T에서 K 키들을 뺀 새 타입 |
| `Record<K, V>` | 키 K, 값 V인 객체 타입 |
| `ReturnType<F>` | 함수 F의 반환 타입 |
| `NonNullable<T>` | T에서 `null`·`undefined` 제거 |

> 💡 면접 포인트: "이런 게 있다"보다 **"원본 한 곳만 고치면 파생이 자동으로 따라와 유지보수가 쉬워진다"** 는 이점을 말하면 실무 감각이 드러납니다.

**🔥 예상 꼬리질문**
- Q. `Pick`과 `Omit` 중 뭘 쓰나요? → A. 남길 게 적으면 `Pick`, 뺄 게 적으면 `Omit`. 필드가 자주 추가되는 타입이면 "빼기"인 `Omit`가 새 필드를 자동 포함해 안전할 때가 많습니다.
- Q. 이 유틸리티들은 어떻게 만들어졌나요? → A. 대부분 **매핑 타입 + 조건부 타입**으로 구현돼 있습니다(D6, D7). 예: `Partial<T> = { [K in keyof T]?: T[K] }`.
- Q. `Omit`는 존재하지 않는 키를 넘겨도 에러가 안 나던데? → A. 과거엔 그랬지만, 안전을 위해 `Exclude`/`Pick` 조합의 커스텀 `StrictOmit`를 쓰기도 합니다.

<details><summary>📝 한 줄 요약</summary>유틸리티 타입은 원본에서 파생하는 타입 변형 도구(Partial/Required/Pick/Omit/Record/Readonly/ReturnType…). 원본만 고치면 파생이 자동 반영돼 중복·불일치를 없앤다.</details>

---

## D6. 매핑 타입(Mapped Type)과 `keyof`를 설명할 수 있나요? 🟡

**💬 30초 답변**
> 매핑 타입은 **기존 타입의 모든 키를 순회하며 새 타입을 만드는 문법**으로, `{ [K in keyof T]: ... }` 형태입니다. `keyof T`가 T의 키 유니온을 주고, `in`으로 그 키들을 하나씩 돌면서 값 타입을 변형합니다. 앞서 본 `Partial`, `Readonly` 같은 유틸리티가 바로 이 매핑 타입으로 구현돼 있어, 직접 만들면 프로젝트 전용 타입 변형기를 만들 수 있습니다.

**📖 핵심 개념**

🎯 **비유**: `for...in` 반복문의 **타입 버전**입니다. 값을 도는 대신 **타입의 키를 돌면서** 새 타입을 조립합니다.

📌 기본형과 수정자(modifier)

```ts
// Partial을 직접 구현해 보면 매핑 타입이 보인다
type MyPartial<T> = {
  [K in keyof T]?: T[K];  // 모든 키를 선택적으로
};

// 수정자 추가/제거: + 와 - 사용
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];  // readonly 제거
};
type MyRequired<T> = {
  [K in keyof T]-?: T[K];          // 선택적(?) 제거 → 필수화
};
```

📌 키 재매핑(key remapping, `as`) — TS 4.1+ (🟢)

```ts
// 각 프로퍼티에 대한 getter 이름을 자동 생성
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person { name: string; age: number; }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }
```
> 여기서 `` `get${...}` ``는 **템플릿 리터럴 타입**, `Capitalize<>`는 내장 문자열 유틸리티입니다. 키 자체를 변형할 수 있다는 점이 강력합니다.

**🔥 예상 꼬리질문**
- Q. `keyof T`가 `never`가 되는 경우는? → A. T가 `{}`(빈 객체)이거나 키가 없으면 `keyof`는 `never`입니다.
- Q. 인덱스 시그니처가 있는 타입에 `keyof`를 하면? → A. `{ [k: string]: number }`의 `keyof`는 `string | number`가 됩니다(숫자 키도 문자열로 접근 가능하기 때문).
- Q. 매핑 타입을 언제 직접 만드나요? → A. 폼 상태를 "모든 필드의 에러 메시지 맵"으로 바꾸는 등, 기본 유틸리티로 안 되는 프로젝트 전용 변형이 필요할 때입니다.

<details><summary>📝 한 줄 요약</summary>매핑 타입 `{ [K in keyof T]: ... }`은 타입의 키를 순회하며 새 타입을 조립하는 "타입용 for문". `?`/`readonly`를 `+`/`-`로 붙이고 떼며, `as`로 키 이름까지 재매핑할 수 있다. 유틸리티 타입의 구현 원리.</details>

---

## D7. 조건부 타입(Conditional Type)과 `infer`는 무엇인가요? 🟢

**💬 30초 답변**
> 조건부 타입은 **타입 수준의 삼항 연산자**로, `T extends U ? X : Y` 형태입니다. "T가 U에 할당 가능하면 X, 아니면 Y" 타입이 됩니다. 여기에 `infer` 키워드를 쓰면 **조건이 참일 때 타입의 일부를 변수로 뽑아낼(추출)** 수 있습니다. `ReturnType`, `Awaited` 같은 유틸리티가 이 방식으로 구현돼 있습니다.

**📖 핵심 개념**

🎯 **비유**: 조건부 타입은 타입계의 **`조건 ? A : B`**, `infer`는 **정규식의 캡처 그룹 `()`** 입니다. 패턴에 맞으면 괄호 안의 조각만 쏙 뽑아냅니다.

📌 기본형

```ts
type IsString<T> = T extends string ? true : false;
type A = IsString<"hi">;  // true
type B = IsString<42>;    // false
```

📌 `infer` — 타입 안에서 조각 추출

```ts
// 배열이면 원소 타입을, 아니면 그대로
type ElementType<T> = T extends (infer U)[] ? U : T;
type E1 = ElementType<string[]>;  // string
type E2 = ElementType<number>;    // number

// ReturnType 직접 구현
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type R = MyReturnType<() => number>;  // number

// Promise 벗기기 (Awaited의 단순형)
type Unwrap<T> = T extends Promise<infer V> ? V : T;
type U = Unwrap<Promise<string>>;  // string
```

📌 분산 조건부 타입(distributive) — 유니온이 들어오면 하나씩 분배된다 (🟢)

```ts
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>;
// (string | number)[] 가 아니라  string[] | number[]  로 분산된다!
```
> 유니온에 조건부 타입을 적용하면 **각 멤버에 개별 적용 후 다시 유니온**으로 합칩니다. 이 분산을 막으려면 `[T] extends [any]`처럼 튜플로 감쌉니다.

**🔥 예상 꼬리질문**
- Q. `Exclude`/`Extract`는 어떻게 만들어졌나요? → A. 분산 조건부 타입입니다. `Exclude<T, U> = T extends U ? never : T`.
- Q. `infer`는 어디에 위치할 수 있나요? → A. 함수 반환값, 인자, 배열 원소, Promise 값, 튜플 요소 등 **`extends` 오른쪽 패턴 안 어디든** 놓아 그 조각을 캡처할 수 있습니다.
- Q. 조건부 타입이 실무에서 과하지 않나요? → A. 애플리케이션 코드에선 드물지만, **라이브러리·공용 타입 유틸**을 만들 때 필수입니다. 남용하면 가독성이 급락하니 균형이 중요합니다.

<details><summary>📝 한 줄 요약</summary>조건부 타입 `T extends U ? X : Y`는 타입용 삼항 연산자. `infer`로 조건 참일 때 타입 조각을 캡처(ReturnType·Awaited의 원리). 유니온에 적용하면 멤버별로 분산된다.</details>

---

## D8. `satisfies` 연산자는 왜 생겼고, 언제 쓰나요? 🟡

**💬 30초 답변**
> `satisfies`(TS 4.9+)는 **"이 값이 특정 타입을 만족하는지 검사하되, 값의 구체적(좁은) 타입 추론은 그대로 유지"** 하게 해 주는 연산자입니다. 타입 애너테이션(`: Type`)은 검사는 하지만 값을 넓은 타입으로 고정해 세부 정보를 잃고, 타입 단언(`as Type`)은 검사를 건너뛰어 위험합니다. `satisfies`는 이 둘의 단점을 없애 **검사 + 정확한 추론**을 동시에 얻습니다.

**📖 핵심 개념**

🎯 **비유**: `: Type`은 "합격/불합격만 찍고 원본을 규격 상자에 넣어 버리는 검수", `satisfies`는 **"규격 통과 여부는 확인하되 원본 그대로 돌려주는 검수"** 입니다.

📌 세 방식 비교

```ts
type Config = Record<string, string | number>;

// 1) 애너테이션: 검사는 되지만 값 타입이 넓어짐
const a: Config = { port: 3000, host: "localhost" };
a.port.toFixed();  // ❌ port가 string | number 로 넓어져 number 메서드 못 씀

// 2) satisfies: 검사 + 좁은 추론 유지
const b = { port: 3000, host: "localhost" } satisfies Config;
b.port.toFixed();      // ✅ port는 number로 추론됨
b.host.toUpperCase();  // ✅ host는 string으로 추론됨
b.foo;                 // ❌ 존재하지 않는 키 → 여전히 검사됨
```

📌 실무 예: 색상 팔레트

```ts
const palette = {
  primary: "#0070f3",
  danger: [255, 0, 0],
} satisfies Record<string, string | number[]>;

palette.danger.map(n => n);   // ✅ danger는 number[]로 정확히 추론
palette.primary.toUpperCase(); // ✅ primary는 string
```

**🔥 예상 꼬리질문**
- Q. `as const`와 함께 쓸 수 있나요? → A. 네. `{...} as const satisfies T`로 "리터럴로 고정 + 타입 검사"를 함께 얻는 패턴이 자주 쓰입니다.
- Q. 그럼 애너테이션은 이제 안 쓰나요? → A. 아닙니다. **변수의 공개 타입을 명시적으로 고정**하고 싶을 땐 애너테이션이 맞습니다. `satisfies`는 "검사는 하되 추론은 살리고 싶을 때"입니다.
- Q. `satisfies`가 런타임에 하는 일은? → A. 없습니다. 타입 전용 문법이라 컴파일 시 완전히 사라집니다(D9).

<details><summary>📝 한 줄 요약</summary>`satisfies T`(4.9+)는 값이 T를 만족하는지 검사하면서도 값의 좁은 추론을 유지한다. `: T`(넓어짐)와 `as T`(검사 생략)의 단점을 동시에 해결. `as const satisfies T` 조합이 실무 인기.</details>

---

## D9. 타입스크립트 타입은 런타임에 남나요? (흔한 오해 정리) 🟡

**💬 30초 답변**
> 남지 않습니다. TS 타입은 컴파일(트랜스파일) 시 **완전히 지워집니다(type erasure)**. `interface`, `type`, `:Type` 애너테이션, `as`, `satisfies`, 제네릭 `<T>`는 전부 사라지고 순수 JS만 남습니다. 그래서 **런타임에 타입으로 분기하거나 검증할 수 없고**, 외부 데이터(API 응답 등) 검증은 `zod` 같은 런타임 스키마 라이브러리로 따로 해야 합니다. 이건 면접에서 자주 확인하는 개념입니다.

**📖 핵심 개념**

🎯 **비유**: 타입은 **공사 중 설계도**입니다. 건물(JS)이 완성되면 설계도는 현장에서 치워집니다. 완공된 건물만 봐서는 설계도 내용을 되짚을 수 없죠.

📌 지워지는 것 vs 남는 것

```ts
interface User { id: number; }        // 컴파일 후: 완전히 사라짐
type ID = string | number;            // 사라짐
const x = y as User;                  // as만 사라지고 const x = y; 남음
function f<T>(a: T): T { return a; }  // <T> 사라짐 → function f(a){return a;}

// enum과 class는 예외: 실제 JS 코드(객체·함수)를 생성해 런타임에 남는다
enum Color { Red, Blue }              // 런타임 객체로 남음
class Foo {}                          // 런타임 함수/클래스로 남음
```

📌 그래서 런타임 검증은 별도로

```ts
// ❌ 이렇게 못 함 — User는 런타임에 없다
// if (data instanceof User) ...    // interface는 instanceof 불가

// ✅ zod 같은 스키마로 런타임 검증 + 타입 추론을 함께
import { z } from "zod";
const UserSchema = z.object({ id: z.number(), name: z.string() });
type User = z.infer<typeof UserSchema>;       // 정적 타입 자동 생성
const user = UserSchema.parse(await res.json()); // 런타임 검증(실패 시 throw)
```

> 💡 면접 포인트: "타입은 런타임에 사라진다 → 그래서 API 경계에서 `zod`/`io-ts` 같은 런타임 검증이 필요하다"까지 이으면, 타입 시스템의 **한계와 실무 대응**을 이해한다는 인상을 줍니다.

**🔥 예상 꼬리질문**
- Q. `interface`와 `type` 중 뭘 기본으로? → A. 객체 형태는 **선언 병합(declaration merging)** 과 성능상 `interface`가 팀 컨벤션으로 흔합니다. 유니온·튜플·조건부 등 복합 타입은 `type`이 필요합니다.
- Q. 제네릭도 런타임에 없다면 `new Array<string>()`의 `<string>`은? → A. 타입 힌트일 뿐 런타임엔 사라집니다. Java처럼 타입을 런타임에 실체화(reification)하지 않습니다.
- Q. 타입이 사라지는데 왜 `tsc`가 필요? → A. 최신 환경은 타입 **검사(tsc)** 와 타입 **제거(esbuild/swc/babel)** 를 분리합니다. 번들러가 타입을 지우고, `tsc --noEmit`가 검사만 담당하는 구성이 일반적입니다.

<details><summary>📝 한 줄 요약</summary>TS 타입은 컴파일 시 완전히 소거된다(type erasure). interface·type·제네릭·as·satisfies는 사라지고, enum·class만 런타임 코드로 남는다. 그래서 API 경계 검증은 zod 등 런타임 스키마로 별도 처리해야 한다.</details>

---

### 🎯 오늘의 핵심 한 줄 정리

- **제네릭**은 입력·출력 타입 관계를 유지하는 도구, `extends`로 제약·`K extends keyof T`로 안전한 객체 접근.
- **`any`는 위험, `unknown`은 안전한 미지, `never`는 불가능** — "모르면 unknown".
- **타입 가드(`typeof`/`in`/`x is T`)** 로 유니온을 좁히고, **판별 유니온 + `never` 완전성 검사**로 케이스 누락을 컴파일 타임에 잡는다.
- **유틸리티 타입**은 원본에서 파생(중복 제거), 그 구현 원리가 **매핑 타입 + 조건부 타입 + `infer`**.
- **`satisfies`** 는 검사와 정확한 추론을 동시에, **타입은 런타임에 소거**되므로 경계 검증은 `zod` 등으로.
