# React Fiber 아키텍처 · 재조정 알고리즘 · 동시성 렌더링 심화

> 주제: 신입~주니어 프론트엔드가 면접에서 "가상 DOM으로 빠르게 바뀐 부분만 그려요"를 넘어 "React가 트리를 어떤 자료구조(Fiber)로 표현하고, diff를 어떤 규칙(재조정 알고리즘)으로 하며, 렌더링을 어떻게 중단·재개(동시성)하는지"를 내부 동작 수준으로 설명할 줄 안다를 보여주는 심화 — Fiber 노드의 정체, 재조정(reconciliation) 휴리스틱, `key`가 왜 중요한지, Render/Commit 2단계, 동시성(time slicing·우선순위·`useTransition`/`useDeferredValue`), Fiber 이전(Stack Reconciler)과 무엇이 달라졌는가
> 출처: 일일 심화 자료 (기존 4.react_next.md Q55 "가상 DOM·재조정", Q61 "동시성 기능"의 심화 보강편)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-가상-domvirtual-dom이-정확히-무엇이고-왜-빠르다고-하나요) | 가상 DOM이 정확히 무엇인가요? | 🔴 |
| [D2](#d2-fiber는-무엇이고-왜-도입됐나요) | Fiber는 무엇이고 왜 도입됐나요? | 🔴 |
| [D3](#d3-재조정reconciliation-알고리즘은-어떤-규칙으로-diff하나요) | 재조정 알고리즘의 규칙은? | 🔴 |
| [D4](#d4-key가-왜-그렇게-중요한가요-index를-key로-쓰면-왜-안-되나요) | `key`가 왜 중요한가요? | 🔴 |
| [D5](#d5-render-단계와-commit-단계는-무엇이-다른가요) | Render vs Commit 단계 | 🔴 |
| [D6](#d6-동시성concurrency-렌더링이란-무엇이며-무엇을-해결하나요) | 동시성 렌더링이란? | 🟡 |
| [D7](#d7-usetransition과-usedeferredvalue는-무엇을-어떻게-다르게-해결하나요) | `useTransition` vs `useDeferredValue` | 🟡 |
| [D8](#d8-double-buffering과-current--workinprogress-트리는-무엇인가요) | Double buffering · WIP 트리 | 🟢 |

---

## D1. 가상 DOM(Virtual DOM)이 정확히 무엇이고, 왜 "빠르다"고 하나요? 🔴

**💬 30초 답변**
> 가상 DOM은 실제 DOM을 흉내 낸 **가벼운 자바스크립트 객체 트리**입니다. 상태가 바뀌면 React는 새 가상 DOM 트리를 만들고, 이전 트리와 비교(diff)해서 **실제로 달라진 부분만** 실제 DOM에 반영합니다. 핵심은 "가상 DOM이 실제 DOM보다 빠르다"가 아니라, **비싼 DOM 조작을 최소화하고 한 번에 모아서(batch) 처리**한다는 점, 그리고 개발자가 "어떻게 바꿀지(명령형)"가 아니라 "어떤 모습이어야 하는지(선언형)"만 쓰면 된다는 점입니다.

**📖 핵심 개념**

🎯 **비유**: 방 배치를 바꿀 때, 가구를 하나씩 옮겨보며 시행착오하지 않고 **종이 위 평면도에 먼저 새 배치를 그려** 지금 배치와 비교한 뒤, "소파만 창가로" 같은 최소 변경 목록을 뽑아 실제로 한 번에 옮기는 것과 같습니다. 종이(가상 DOM)에 그리는 건 싸고, 실제 가구 옮기기(DOM 조작)는 비쌉니다.

📌 **왜 실제 DOM 조작이 비싼가**: DOM 변경은 브라우저의 스타일 계산·레이아웃(리플로우)·페인트를 유발할 수 있습니다. 특히 레이아웃을 읽고 쓰기를 번갈아 하면 강제 동기 레이아웃이 반복돼 느려집니다. 가상 DOM은 변경을 모아 실제 조작 횟수 자체를 줄입니다.

📌 **오해 정정**: "가상 DOM은 항상 빠르다"는 틀립니다. diff 자체도 CPU 비용이며, 잘 짠 순수 명령형 코드가 더 빠를 수도 있습니다. 가상 DOM의 진짜 가치는 **성능의 하한선을 보장하면서 선언형 프로그래밍을 가능하게** 하는 것입니다.

```jsx
// 선언형: "이 state일 때 UI는 이래야 한다"만 기술
// 어떤 DOM 노드를 어떻게 바꿀지는 React가 diff로 결정
function List({ items }) {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
}
```

**🔥 예상 꼬리질문**
- Q. 가상 DOM 트리는 무엇으로 이뤄지나요? → A. `React.createElement`가 반환하는 **엘리먼트 객체**(`type`, `props`, `key` 등을 가진 순수 객체)입니다. JSX는 이 호출로 컴파일됩니다.
- Q. 가상 DOM과 Fiber는 같은 건가요? → A. 아닙니다. 엘리먼트(가상 DOM)는 "이번 렌더의 결과 스냅샷"이고, Fiber는 그것을 처리하기 위해 React가 내부적으로 유지하는 **작업 단위 + 상태를 담은 노드**입니다. (D2 참고)
- Q. 가상 DOM이 없는 프레임워크는? → A. Svelte는 컴파일 타임에 DOM 조작 코드를 생성해 런타임 가상 DOM diff가 없고, Solid는 세밀한 반응성(fine-grained reactivity)으로 컴포넌트 재실행 없이 필요한 노드만 갱신합니다.

<details><summary>📝 한 줄 요약</summary>가상 DOM = 실제 DOM을 본뜬 JS 객체 트리. 이전/새 트리를 diff해 변경분만 실제 DOM에 반영 → 선언형 + DOM 조작 최소화가 본질(무조건 빠른 게 아님).</details>

---

## D2. Fiber는 무엇이고, 왜 도입됐나요? 🔴

**💬 30초 답변**
> Fiber는 React 16부터 도입된 **재조정 엔진의 재구현**이자, 그 엔진이 다루는 **작업 단위(unit of work)를 표현하는 노드**입니다. 각 컴포넌트/DOM 노드마다 Fiber 노드가 하나씩 대응되고, 이 노드들은 자식·형제·부모를 가리키는 **연결 리스트 형태의 트리**로 이어집니다. 기존(Stack Reconciler)은 재귀 호출로 트리를 한 번에 끝까지 처리해서 **중간에 멈출 수 없었는데**, Fiber는 작업을 잘게 쪼개 **중단·재개·우선순위 부여·폐기**가 가능해졌습니다. 이게 동시성 기능의 토대입니다.

**📖 핵심 개념**

🎯 **비유**: 예전 방식은 "책 한 권을 처음부터 끝까지 한 번에 읽어야 하는 것"이라 중간에 급한 전화가 와도 못 받았습니다. Fiber는 "책을 페이지 단위로 나눠 읽는 것"이라, 한 페이지 읽고 급한 일이 생기면 책갈피(작업 진행 상태)를 꽂고 잠깐 처리한 뒤 이어 읽을 수 있습니다.

📌 **Stack Reconciler의 문제**: 재귀 기반이라 콜 스택이 곧 진행 상태였습니다. 트리가 크면 렌더링이 수십 ms 동안 메인 스레드를 점유해 **입력·애니메이션이 버벅였습니다**(자바스크립트는 싱글 스레드라 렌더 중 다른 일을 못 함).

📌 **Fiber 노드가 담는 것**: 대략 다음을 가집니다.
- `type`, `key`: 어떤 컴포넌트/엘리먼트인지
- `stateNode`: 실제 DOM 노드 또는 컴포넌트 인스턴스
- `child`, `sibling`, `return`: 트리를 연결 리스트로 잇는 포인터(자식/형제/부모)
- `pendingProps`, `memoizedProps`, `memoizedState`: 이번/지난 props와 state(훅 정보 포함)
- `flags`(구 effectTag): 이 노드에 할 DOM 작업(삽입·갱신·삭제 등)
- `alternate`: 반대편 트리(current ↔ workInProgress)의 짝 (D8 참고)

📌 **왜 연결 리스트인가**: 재귀 대신 포인터를 따라가며 **반복(loop)으로** 순회할 수 있어, 한 노드 처리 후 "시간이 없으면 여기서 멈추고 나중에 이어서" 하기가 쉽습니다. 진행 상태가 콜 스택이 아니라 자료구조에 있기 때문입니다.

```
// 개념적 Fiber 트리 순회 (재귀 아님, 포인터 기반 반복)
function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 0) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork); // 다음 Fiber 반환
  }
  if (nextUnitOfWork) requestIdleCallback(workLoop); // 남았으면 다음 프레임에 이어서
}
```

> 💡 위 코드는 개념 설명용 의사코드입니다. 실제 React는 `requestIdleCallback` 대신 자체 스케줄러(Scheduler 패키지, `MessageChannel` 기반)로 더 정교하게 시간을 배분합니다.

**🔥 예상 꼬리질문**
- Q. Fiber가 도입됐다고 해서 자동으로 앱이 빨라지나요? → A. 아닙니다. Fiber는 "중단 가능한 렌더링"이라는 **능력**을 열었을 뿐이고, 그 능력을 쓰는 동시성 기능(`useTransition` 등)을 실제로 사용해야 체감 반응성이 좋아집니다.
- Q. 훅의 state는 어디에 저장되나요? → A. 함수 컴포넌트에 대응되는 Fiber 노드의 `memoizedState`에 **훅들이 순서대로 연결 리스트**로 저장됩니다. 훅을 조건문 안에서 쓰면 안 되는 이유가 이 "순서 의존" 때문입니다.
- Q. Fiber라는 이름의 유래? → A. OS의 경량 실행 단위인 "파이버(협력적 멀티태스킹 단위)"에서 따온 것으로, 스스로 양보(yield)하며 협력적으로 스케줄링된다는 의미를 담습니다.

<details><summary>📝 한 줄 요약</summary>Fiber = 컴포넌트마다 대응되는 작업 단위 노드(연결 리스트 트리). 재귀 대신 반복으로 순회 가능 → 렌더링을 중단·재개·우선순위화할 수 있게 만든 동시성의 토대.</details>

---

## D3. 재조정(Reconciliation) 알고리즘은 어떤 규칙으로 diff하나요? 🔴

**💬 30초 답변**
> 두 트리를 완벽히 비교하는 일반 알고리즘은 O(n³)이라 너무 비쌉니다. React는 두 가지 **휴리스틱(경험적 규칙)**으로 이를 O(n)에 가깝게 줄입니다. ① **타입이 다르면 그 하위 트리를 통째로 버리고 새로 만든다**(diff하지 않음). ② **같은 레벨의 리스트는 `key`로 대응**시켜, 이동·추가·삭제를 최소 조작으로 판단한다. 즉 "같은 위치, 같은 타입이면 재사용하고 props만 갱신, 다르면 파괴 후 재생성"이 핵심 규칙입니다.

**📖 핵심 개념**

🎯 **비유**: 두 개의 조직도를 비교할 때, 부서장(노드 타입)이 바뀌면 그 부서 전체를 새로 짜고, 부서장이 그대로면 팀원 명단(자식들)만 이름표(`key`)로 맞춰 누가 들어오고 나갔는지 확인하는 것과 같습니다.

📌 **규칙 1 — 타입이 다르면 서브트리 폐기**
```jsx
// <div> → <span> 로 타입이 바뀌면
<div><Counter /></div>   // 이전
<span><Counter /></span> // 이후
// React는 div 하위를 전부 언마운트하고 span을 새로 마운트.
// 안의 <Counter />도 state를 잃고 새로 생성됨!
```
타입이 같으면(둘 다 `div`) DOM 노드를 재사용하고 바뀐 속성만 갱신합니다.

📌 **규칙 2 — 같은 레벨은 `key`로 대응**: 리스트에서 `key`가 같으면 "같은 항목이 위치만 이동/유지된 것"으로 보고 재사용, `key`가 사라지면 삭제, 새 `key`면 삽입으로 판단합니다. `key`가 없으면 React는 **배열 인덱스 순서**로 짝을 맞춥니다(그래서 인덱스 key가 위험, D4).

📌 **컴포넌트 정체성(identity)**: "같은 위치의 같은 타입"이면 React는 그걸 **같은 컴포넌트가 유지된 것**으로 보고 state를 보존합니다. 위치나 타입이 바뀌면 다른 컴포넌트로 간주해 state를 리셋합니다. 조건부 렌더링에서 예기치 않게 state가 초기화되는 버그의 원인이 대개 이것입니다.

```jsx
// 안티패턴: 삼항으로 같은 컴포넌트를 다른 위치에 두면 정체성이 흔들릴 수 있음
{isEditing ? <Input /> : <div><Input /></div>}
// Input의 위치(부모)가 달라 언마운트/재마운트 → 입력값 소실 위험
```

**🔥 예상 꼬리질문**
- Q. 왜 완전한 트리 비교를 안 하나요? → A. 최적 트리 diff는 O(n³)이라 노드 1000개면 10억 연산. 화면 갱신마다 그건 불가능해서 휴리스틱으로 O(n)에 맞췄습니다.
- Q. 타입이 같으면 자식은 안 보나요? → A. 봅니다. 현재 노드는 재사용하되 자식들로 내려가 같은 규칙을 재귀적으로(실제로는 Fiber 순회로) 반복 적용합니다.
- Q. React 19에서 이 알고리즘이 바뀌었나요? → A. 근본 휴리스틱은 유지됩니다. 다만 React Compiler 같은 상위 최적화가 **불필요한 렌더 자체를 줄여** diff 횟수를 감소시키는 방향으로 발전합니다.

<details><summary>📝 한 줄 요약</summary>재조정 = 두 휴리스틱으로 O(n) 근사: (1) 타입 다르면 서브트리 폐기·재생성, (2) 같은 레벨은 `key`로 대응. "같은 위치·같은 타입"이면 state 보존, 아니면 리셋.</details>

---

## D4. `key`가 왜 그렇게 중요한가요? 인덱스를 key로 쓰면 왜 안 되나요? 🔴

**💬 30초 답변**
> `key`는 리스트에서 **각 항목의 고유한 신원(identity)**을 React에 알려주는 값입니다. React는 `key`로 "이 항목이 이전에도 있던 그 항목인지"를 판단해 재사용·이동·삭제를 결정합니다. 배열 인덱스를 `key`로 쓰면, 항목이 추가·삭제·정렬되어 순서가 바뀔 때 **인덱스가 다른 항목을 가리키게 되어** React가 엉뚱한 DOM/state를 재사용합니다. 그 결과 입력값이 뒤섞이거나 잘못된 항목이 갱신되는 버그가 생깁니다.

**📖 핵심 개념**

🎯 **비유**: 사물함에 이름표(고유 key) 대신 "1번, 2번" 순번(인덱스)만 붙여두면, 앞사람이 빠졌을 때 모두가 한 칸씩 당겨져 2번 사물함의 짐이 원래 3번 주인 것으로 오인됩니다.

📌 **인덱스 key가 실제로 깨지는 상황**: 리스트 **맨 앞 삽입/삭제**, **정렬**, **필터링**처럼 순서가 바뀌는 경우. 항목마다 **로컬 state(입력값, 체크 여부)나 비제어 DOM 상태**가 있을 때 특히 치명적입니다.

```jsx
// 안티패턴: 인덱스 key + 각 행에 입력 상태가 있을 때
{todos.map((todo, i) => <TodoItem key={i} todo={todo} />)}
// 맨 앞 항목 삭제 시: key=0이 여전히 살아있어 첫 행 DOM을 재사용 →
// 두 번째 할 일이 첫 행의 입력 state를 물려받아 값이 어긋남

// 올바른 방법: 안정적이고 고유한 id 사용
{todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}
```

📌 **key가 안전한 예외**: 리스트가 **정적이고**(순서·개수 불변), 항목에 로컬 state가 없다면 인덱스 key도 문제없습니다. 하지만 습관적으로 안정적 id를 쓰는 편이 안전합니다.

📌 **key로 강제 리마운트**: 반대로 `key`를 의도적으로 바꾸면 React가 "다른 항목"으로 보고 **컴포넌트를 언마운트→재마운트**해 state를 초기화합니다. 사용자가 바뀔 때 폼을 리셋하는 등에 유용합니다.
```jsx
<UserProfileForm key={userId} user={user} /> // userId 바뀌면 폼 state 완전 초기화
```

📌 **key는 전역 고유일 필요 없음**: **형제(같은 부모, 같은 레벨) 안에서만** 고유하면 됩니다.

**🔥 예상 꼬리질문**
- Q. `Math.random()`을 key로 쓰면? → A. 매 렌더마다 key가 바뀌어 모든 항목을 매번 파괴·재생성합니다. 성능도, state 보존도 최악. 절대 금지.
- Q. key를 컴포넌트 안에서 props로 읽을 수 있나요? → A. 없습니다. `key`는 React 예약어로 자식 props에 전달되지 않습니다. 값이 필요하면 별도 prop(`id={...}`)으로 넘겨야 합니다.
- Q. key가 없으면 경고만 뜨고 동작은 하지 않나요? → A. 동작은 하지만 인덱스 기반으로 대응해 위 버그 위험을 안습니다. 경고는 그 위험을 알리는 것입니다.

<details><summary>📝 한 줄 요약</summary>`key`는 리스트 항목의 고유 신원. 인덱스 key는 순서 변경(삽입·삭제·정렬) 시 다른 항목을 가리켜 state/DOM이 어긋남 → 안정적 id를 써라. key를 바꾸면 강제 리마운트(리셋)에 활용 가능.</details>

---

## D5. Render 단계와 Commit 단계는 무엇이 다른가요? 🔴

**💬 30초 답변**
> React가 화면을 갱신하는 과정은 두 단계로 나뉩니다. **Render 단계**는 컴포넌트 함수를 실행해 새 Fiber 트리를 만들고 어디가 바뀌었는지 계산하는 단계로, **부수효과가 없어야 하고 중단·재시작·폐기가 가능**합니다(동시성의 핵심). **Commit 단계**는 계산된 변경을 **실제 DOM에 한 번에 반영**하는 단계로, **동기적이고 중단 불가능**합니다. `useLayoutEffect`는 커밋 직후(페인트 전) 동기 실행, `useEffect`는 페인트 후 비동기 실행됩니다.

**📖 핵심 개념**

🎯 **비유**: Render는 "편집자가 원고를 교정하며 빨간 펜으로 고칠 곳을 표시하는 단계"(몇 번을 다시 해도, 도중에 멈춰도 안전), Commit은 "확정된 교정본을 인쇄기에 넘겨 실제로 찍는 단계"(한 번에, 되돌릴 수 없이).

📌 **Render 단계가 순수해야 하는 이유**: 동시성 모드에서 React는 이 단계를 **여러 번 실행하거나 도중에 버릴 수 있습니다.** 여기서 DOM을 직접 만지거나 구독을 걸면, 실행이 취소됐을 때 부작용이 남아 버그가 됩니다. 그래서 side effect는 반드시 커밋 단계(및 effect 훅)로 미룹니다.
- StrictMode가 개발 중 컴포넌트를 **일부러 두 번 렌더**하는 이유도, 이 순수성 위반을 조기에 드러내기 위함입니다.

📌 **Commit 단계 세부**: (1) `getSnapshotBeforeUpdate` → (2) DOM 변이(삽입/갱신/삭제) → (3) `useLayoutEffect` 실행(DOM 읽기·동기 측정에 사용) → **브라우저 페인트** → (4) `useEffect` 실행. `useLayoutEffect`에서 무거운 작업을 하면 페인트가 밀려 버벅이므로, 화면 반영 후 해도 되는 일은 `useEffect`로 미룹니다.

```jsx
// useLayoutEffect: 페인트 전 동기 → 레이아웃 측정/보정에 적합(깜빡임 방지)
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setTooltipTop(height); // 페인트 전에 위치 확정 → 깜빡임 없음
}, []);

// useEffect: 페인트 후 비동기 → 데이터 패칭/구독 등 부수효과에 적합
useEffect(() => {
  const id = subscribe(...);
  return () => unsubscribe(id); // 클린업으로 누수 방지
}, []);
```

📌 **Render는 중단 가능, Commit은 불가능**: 동시성에서 급한 업데이트(예: 입력)가 들어오면 진행 중이던 Render를 버리고 다시 시작할 수 있습니다. 하지만 Commit은 "화면이 반쯤 바뀐 상태"를 사용자에게 보이면 안 되므로 통짜로 동기 실행합니다(tearing 방지).

**🔥 예상 꼬리질문**
- Q. `console.log`나 `setState`를 렌더 도중 호출해도 되나요? → A. 로그는 무해하지만, 렌더 중 `setState`(무한 루프 위험)나 DOM 조작·구독은 금지입니다. 그런 일은 이벤트 핸들러나 effect에서 하세요.
- Q. `useEffect`와 `useLayoutEffect` 중 기본 선택은? → A. 기본은 `useEffect`. 화면 깜빡임 없이 DOM을 측정·보정해야 할 때만 `useLayoutEffect`.
- Q. 배칭(batching)은 어느 단계와 관련? → A. 여러 `setState`를 모아 한 번의 Render/Commit로 처리하는 것으로, React 18부터 프로미스·타이머·네이티브 이벤트 안에서도 자동 배칭됩니다(자동 배칭).

<details><summary>📝 한 줄 요약</summary>Render 단계 = 순수·중단 가능(새 트리 계산), Commit 단계 = 동기·중단 불가(실제 DOM 반영). 부수효과는 커밋/effect로 미뤄라. `useLayoutEffect`=페인트 전 동기, `useEffect`=페인트 후 비동기.</details>

---

## D6. 동시성(Concurrency) 렌더링이란 무엇이며, 무엇을 해결하나요? 🟡

**💬 30초 답변**
> 동시성 렌더링은 React 18에서 열린 기능으로, **렌더링을 잘게 쪼개 우선순위에 따라 중단·재개**할 수 있게 한 것입니다. 자바스크립트는 싱글 스레드라 진짜 병렬은 아니고, "급한 일(사용자 입력)이 오면 덜 급한 렌더링(무거운 리스트 갱신)을 잠깐 미뤘다가 이어서 하는" **협력적 스케줄링**입니다. 덕분에 무거운 업데이트가 진행 중이어도 입력·클릭 같은 상호작용이 끊기지 않습니다. `useTransition`, `useDeferredValue`, `Suspense` 스트리밍 등이 이 위에서 동작합니다.

**📖 핵심 개념**

🎯 **비유**: 요리사(메인 스레드)가 큰 요리(무거운 렌더)를 하다가도, 손님이 물 한 잔을 급히 요청하면(사용자 입력=긴급) 요리를 잠깐 멈추고 물을 따라준 뒤 다시 이어 요리합니다. 손님은 기다림 없이 응대받습니다.

📌 **왜 필요한가**: Fiber 이전엔 렌더가 시작되면 끝날 때까지 메인 스레드를 붙잡아, 큰 리스트를 렌더하는 동안 타이핑이 몇 백 ms 멈추는 "잰크(jank)"가 생겼습니다. 동시성은 렌더를 **시간 분할(time slicing)**해 프레임 사이사이 양보하고, **급한 업데이트를 먼저** 처리합니다.

📌 **업데이트 우선순위**: React는 업데이트에 우선순위(레인, lane)를 매깁니다. 대략 (긴급) 사용자 입력/클릭 > 기본 업데이트 > (비긴급) transition 업데이트 순. 낮은 우선순위 렌더는 높은 우선순위가 끼어들면 버려지고 최신 state로 다시 시작됩니다.

📌 **"동시성 모드"는 이제 없다**: React 18은 별도 모드 스위치가 아니라, `createRoot`로 앱을 마운트하면 동시성 기능을 **선택적으로(opt-in) 쓸 수 있는 기반**을 켭니다. `useTransition` 등을 실제로 써야 효과가 납니다.

```jsx
// React 18 진입점 — 동시성 기능의 토대를 활성화
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("root")).render(<App />);
// (구) ReactDOM.render 는 레거시 — 동시성 기능 미지원
```

📌 **Tearing(찢어짐) 방지**: 동시성에서 렌더가 중단·재개되는 동안 외부 스토어 값이 바뀌면 화면 일부가 옛 값, 일부가 새 값으로 불일치할 수 있습니다. 이를 막으려고 외부 스토어 구독은 `useSyncExternalStore`를 쓰도록 표준화됐습니다(Zustand·Redux 등이 내부적으로 사용).

**🔥 예상 꼬리질문**
- Q. 동시성은 멀티스레드인가요? → A. 아닙니다. 싱글 스레드에서 작업을 쪼개 양보·재개하는 **협력적 스케줄링**입니다.
- Q. 그냥 켜면 앱이 빨라지나요? → A. 총 계산량이 주는 건 아닙니다. **체감 반응성**(입력 지연 감소)이 좋아지는 것이며, 무거운 업데이트를 transition으로 표시해야 효과가 납니다.
- Q. `startTransition`과 debounce/throttle의 차이? → A. debounce는 "호출 자체를 지연", transition은 "렌더의 우선순위를 낮춰 급한 일에 양보". transition은 최신 값으로 중단·재시작되며 결과가 버려질 수 있어 더 반응적입니다.

<details><summary>📝 한 줄 요약</summary>동시성 = 싱글 스레드에서 렌더를 쪼개 우선순위대로 중단·재개하는 협력적 스케줄링. 무거운 렌더 중에도 입력이 안 끊김. `createRoot`가 토대, `useTransition`/`useDeferredValue`/`Suspense`가 실사용. tearing은 `useSyncExternalStore`로 방지.</details>

---

## D7. `useTransition`과 `useDeferredValue`는 무엇을, 어떻게 다르게 해결하나요? 🟡

**💬 30초 답변**
> 둘 다 "급한 업데이트를 먼저, 무거운 업데이트를 나중에" 처리해 UI 반응성을 지키는 동시성 훅입니다. 차이는 **무엇을 감싸느냐**입니다. `useTransition`은 **상태 업데이트(setState) 자체**를 비긴급으로 표시하고 진행 여부(`isPending`)를 알려줍니다. `useDeferredValue`는 **값**을 감싸, 그 값의 "느린 버전"을 만들어 급한 렌더 뒤로 미룹니다. state 변경 시점을 내가 제어하면 `useTransition`, 남이 내려주는 값(props)만 있을 땐 `useDeferredValue`를 씁니다.

**📖 핵심 개념**

🎯 **비유**: `useTransition`은 "이 요청은 급하지 않으니 뒤로 돌려주세요"라고 **주문 자체에 표시**하는 것, `useDeferredValue`는 이미 들어온 주문의 **처리 결과를 조금 늦춰 받아** 급한 손님부터 응대하는 것입니다.

📌 **`useTransition`** — 상태 업데이트를 감쌀 때
```jsx
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState("");
const [results, setResults] = useState([]);

function onChange(e) {
  setQuery(e.target.value);              // 긴급: 입력창은 즉시 반응
  startTransition(() => {
    setResults(search(e.target.value));  // 비긴급: 무거운 결과 렌더는 뒤로
  });
}
// isPending 으로 "검색 중..." 표시 가능
```
입력값(`query`)은 즉시 갱신되어 타이핑이 끊기지 않고, 무거운 `results` 렌더는 뒤로 밀립니다.

📌 **`useDeferredValue`** — 값을 감쌀 때(특히 값을 props로만 받을 때)
```jsx
function SearchResults({ query }) {       // query는 부모가 내려주는 값
  const deferredQuery = useDeferredValue(query);
  // query는 즉시 최신, deferredQuery는 한 박자 늦게 따라옴
  const list = useMemo(() => search(deferredQuery), [deferredQuery]);
  const stale = query !== deferredQuery;  // 이전 결과가 낡았는지 표시 가능
  return <div style={{ opacity: stale ? 0.5 : 1 }}>{/* 결과 */}</div>;
}
```

📌 **선택 기준**
- 업데이트를 일으키는 `setState`에 **접근할 수 있으면** → `useTransition`(진행 표시 `isPending`도 얻음).
- 값만 받고 그 값을 만드는 곳을 제어 못 하면 → `useDeferredValue`.
- 둘 다 무거운 자식 렌더는 `React.memo`/`useMemo`로 감싸야 실제로 스킵되어 효과가 큽니다.

📌 **주의**: transition 업데이트는 **최신 값으로 중단·재시작**되므로, 중간 결과가 렌더되지 않고 버려질 수 있습니다. 이게 debounce와 달리 "항상 최신"이면서도 반응적인 이유입니다. 다만 네트워크 요청 자체를 줄이려면 여전히 debounce가 필요할 수 있습니다(둘은 상호 보완).

**🔥 예상 꼬리질문**
- Q. `isPending`은 어떻게 활용하나요? → A. 스피너나 흐림 효과로 "결과 갱신 중"임을 알려 사용자 혼란을 줄입니다.
- Q. 입력이 여전히 버벅이면? → A. transition으로 감싼 자식이 `memo`되지 않아 매번 다시 렌더될 수 있습니다. 무거운 부분을 메모이제이션했는지 확인하세요.
- Q. 서버 컴포넌트/데이터 패칭과의 관계? → A. `Suspense`와 함께 쓰면 새 데이터를 기다리는 동안 이전 화면을 유지(급작스런 로딩 스피너 방지)할 수 있습니다.

<details><summary>📝 한 줄 요약</summary>둘 다 "급한 것 먼저"로 반응성 유지. `useTransition`=상태 업데이트(setState)를 비긴급 표시+`isPending`, `useDeferredValue`=값의 지연 버전 생성(값만 받을 때). 무거운 자식은 `memo`로 감싸야 효과. transition은 최신 값으로 재시작(≠debounce).</details>

---

## D8. Double Buffering과 current / workInProgress 트리는 무엇인가요? 🟢

**💬 30초 답변**
> React는 Fiber 트리를 **두 벌** 유지합니다. 지금 화면에 반영된 **current 트리**와, 다음 화면을 계산하기 위한 **workInProgress(WIP) 트리**입니다. Render 단계에서는 WIP 트리를 만들며 작업하고, Commit이 끝나면 **포인터를 휙 바꿔 WIP를 새 current로 승격**합니다. 이렇게 "완성되기 전 트리는 화면에 안 보이는" 방식이 그래픽의 **더블 버퍼링**과 같아서, 반쯤 그려진 화면(tearing)을 막고 중단된 작업을 버리기도 쉽습니다. 두 트리의 대응 노드는 `alternate` 포인터로 연결됩니다.

**📖 핵심 개념**

🎯 **비유**: 게임 그래픽의 더블 버퍼링과 같습니다. 화면에 보이는 앞 버퍼(current)는 그대로 두고, 뒤 버퍼(WIP)에 다음 장면을 다 그린 뒤 **한 번에 앞뒤를 교체**합니다. 그리다 만 화면을 사용자가 보는 일이 없습니다.

📌 **동작 흐름**
1. 업데이트 발생 → current를 바탕으로 WIP 트리 생성(가능한 노드는 `alternate`로 **재사용**해 메모리·비용 절감).
2. Render 단계: WIP를 순회하며 diff·`flags` 표시(중단·재시작 가능).
3. Commit 단계: `flags`를 따라 실제 DOM 변경을 동기 반영.
4. 완료 후 `root.current = workInProgress`로 포인터 교체 → WIP가 새 current가 되고, 옛 current는 다음 업데이트의 WIP로 재활용.

📌 **왜 두 벌인가**: ① 완성 전 트리를 화면에서 격리(tearing 방지), ② Render가 중단·폐기돼도 current(현재 화면)는 안전, ③ 매번 새로 만들지 않고 `alternate`로 노드를 재사용해 가비지·할당을 줄임.

```
루트
 ├─ current ─────▶ [화면에 보이는 Fiber 트리]
 └─ workInProgress ▶ [다음 화면을 위해 만드는 트리]
      각 노드끼리 alternate 포인터로 상호 연결
   커밋 완료 → current 포인터를 WIP로 스왑
```

📌 **`flags`(effect) 수집**: Render 중 각 Fiber에 "삽입/갱신/삭제" 같은 작업 표시를 달아두고, Commit 때 이를 순회하며 최소한의 DOM 조작만 실행합니다. 이게 "바뀐 부분만 반영"의 실제 구현입니다.

**🔥 예상 꼬리질문**
- Q. 트리를 두 개 유지하면 메모리 낭비 아닌가요? → A. 노드를 `alternate`로 재사용하므로 전량 복제가 아니며, 얻는 안정성(tearing 방지·중단 안전성)이 비용을 상쇄합니다.
- Q. 이 내용을 실무에서 알아야 하나요? → A. 세부 구현을 외울 필요는 없지만, "왜 Render가 중단돼도 안전한가", "왜 커밋은 통짜인가"를 설명할 때 근거가 되므로 🟢 심화로 알아두면 깊이가 드러납니다.
- Q. 이런 내부는 어디서 확인하나요? → A. React 소스(`react-reconciler`)와 공식 문서/RFC, 그리고 "Build your own React"류 학습 자료가 개념을 잡기 좋습니다.

<details><summary>📝 한 줄 요약</summary>React는 current(화면 반영) + workInProgress(계산 중) 두 Fiber 트리를 유지(더블 버퍼링). WIP를 다 만든 뒤 포인터를 스왑해 승격 → tearing 방지·중단 안전. 대응 노드는 `alternate`로 연결·재사용.</details>

---

### 🎯 이 문서 핵심 5줄 정리
1. **가상 DOM**은 실제 DOM을 본뜬 JS 객체 트리, **Fiber**는 그것을 처리하는 작업 단위 노드(연결 리스트 트리)로 렌더링을 중단·재개 가능하게 만든 토대다.
2. **재조정**은 두 휴리스틱(타입 다르면 서브트리 폐기 / 같은 레벨은 `key`로 대응)으로 O(n) 근사하며, "같은 위치·같은 타입"이면 state를 보존한다.
3. **`key`**는 리스트 항목의 신원 — 인덱스 key는 순서 변경 시 state/DOM이 어긋나므로 안정적 id를 쓰고, key 교체는 강제 리마운트에 활용한다.
4. **Render 단계**(순수·중단 가능)와 **Commit 단계**(동기·중단 불가)를 구분하고, 부수효과는 커밋/effect로 미룬다.
5. **동시성**은 싱글 스레드에서 렌더를 쪼개 우선순위대로 처리하는 협력적 스케줄링 — `useTransition`(setState)·`useDeferredValue`(값)로 반응성을 지키고, 내부는 double buffering(current/WIP)으로 안전하게 굴러간다.
