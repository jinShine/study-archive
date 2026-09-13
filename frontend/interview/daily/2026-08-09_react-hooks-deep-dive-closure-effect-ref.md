# React Hooks 심화 · 훅의 규칙 · 클로저 함정 · useEffect 생명주기 · useRef

> 주제: 신입~주니어 프론트엔드가 면접에서 "useState·useEffect 써봤어요"를 넘어 "훅이 어떤 원리(호출 순서 기반)로 상태를 기억하는지, 왜 최상위에서만 호출해야 하는지, useEffect가 정확히 언제 실행·클린업되는지, 오래된 클로저(stale closure)가 왜 생기고 어떻게 푸는지, useRef를 state와 어떻게 구분해 쓰는지, useLayoutEffect와 무엇이 다른지, 커스텀 훅을 어떻게 설계하는지"를 원리로 설명할 줄 안다를 보여주는 심화 — Rules of Hooks의 내부 원리, useState 배칭·함수형 업데이트·lazy init, useEffect 실행/클린업 타이밍과 의존성 배열, stale closure 함정과 해법, useRef, useLayoutEffect vs useEffect, 커스텀 훅 설계, StrictMode 이중 실행과 React 19 신규 훅(`use`)
> 출처: 일일 심화 자료 (기존 4.react_next.md Q57 "useEffect·의존성 배열", Q60 "커스텀 훅"의 심화 보강편 · 07-16 리렌더링 최적화, 07-30 Fiber 편과 상호 보완)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화
> ※ 본 문서는 React 18/19의 안정(stable) API 기준입니다. 실험적 API는 별도 표기합니다.

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-훅의-규칙rules-of-hooks은-왜-생겼고-내부적으로-어떻게-동작하나요) | 훅의 규칙은 왜 필요한가? (내부 원리) | 🔴 |
| [D2](#d2-usestate로-바꾼-값이-왜-바로-반영되지-않나요-배칭함수형-업데이트lazy-init) | useState는 왜 즉시 반영이 안 되나? | 🔴 |
| [D3](#d3-useeffect는-정확히-언제-실행되고-언제-클린업되나요) | useEffect의 실행·클린업 타이밍 | 🔴 |
| [D4](#d4-오래된-클로저stale-closure-함정은-왜-생기고-어떻게-푸나요) | Stale closure 함정과 해법 | 🔴 |
| [D5](#d5-useref는-언제-쓰고-state와-무엇이-다른가요) | useRef vs state | 🔴 |
| [D6](#d6-uselayouteffect와-useeffect는-무엇이-다른가요) | useLayoutEffect vs useEffect | 🟡 |
| [D7](#d7-커스텀-훅은-언제-왜-만들고-어떻게-설계하나요) | 커스텀 훅 설계 | 🟡 |
| [D8](#d8-strictmode에서-왜-두-번-실행되나요-react-19의-use-훅은) | StrictMode 이중 실행 · React 19 `use` | 🟢 |

---

## D1. 훅의 규칙(Rules of Hooks)은 왜 생겼고, 내부적으로 어떻게 동작하나요? 🔴

**💬 30초 답변**
> 훅은 **호출된 순서(index)로 상태를 기억**합니다. React는 컴포넌트의 훅들을 Fiber 노드에 **연결 리스트로 저장**하고, 렌더링할 때마다 첫 번째 훅·두 번째 훅… 순서대로 매칭합니다. 그래서 두 가지 규칙이 나옵니다. ① **최상위(top level)에서만 호출** — 조건문·반복문·중첩 함수 안에서 호출하면 렌더마다 호출 순서가 달라져 상태가 뒤섞입니다. ② **React 함수(컴포넌트·커스텀 훅) 안에서만 호출**. 즉 규칙은 스타일이 아니라 **내부 자료구조(순서 기반 매칭)를 지키기 위한 필수 조건**입니다.

**📖 핵심 개념**

🎯 **비유**: 훅은 이름표가 없는 **번호표 사물함**입니다. React는 "1번, 2번, 3번…" 순서대로만 물건을 넣고 꺼냅니다. 어느 날 조건 때문에 2번을 건너뛰면, 원래 3번에 있던 물건을 2번에서 꺼내려 해서 엉뚱한 값이 나옵니다.

📌 **왜 이름이 아니라 순서인가**: `useState('a')`처럼 호출해도 React는 "어떤 변수에 담기는지"를 모릅니다. React가 아는 건 오직 **"이번 렌더에서 몇 번째로 호출된 훅인가"**뿐입니다. 그래서 순서가 유일한 식별자입니다.

```jsx
// ❌ 조건부 호출 — 렌더마다 훅 순서가 달라진다
function Bad({ show }) {
  if (show) {
    const [a, setA] = useState(0); // show=true일 때만 1번 훅으로 존재
  }
  const [b, setB] = useState(''); // show에 따라 1번이었다가 2번이 됨 → 상태 뒤섞임
}

// ✅ 항상 최상위에서, 값으로 조건 처리
function Good({ show }) {
  const [a, setA] = useState(0);   // 언제나 1번 훅
  const [b, setB] = useState('');  // 언제나 2번 훅
  if (show) { /* a를 쓰는 로직 */ }
}
```

📌 **내부 구조(개념도)**: 각 Fiber는 `memoizedState`에 훅 노드의 연결 리스트를 갖습니다. `hook1 → hook2 → hook3` 형태이며, 리렌더 시 `next` 포인터를 따라가며 이전 값과 이어붙입니다. 그래서 "훅 개수/순서"가 렌더마다 일정해야 합니다.

**🔥 예상 꼬리질문**
- Q. 반복문 안에서 훅을 쓰고 싶으면? → A. 훅 자체를 반복하지 말고, **배열/객체 하나를 state로 두고** 그 안에서 원소를 관리하거나, 반복되는 단위를 **자식 컴포넌트로 분리**해 각 컴포넌트가 자기 훅을 갖게 합니다.
- Q. 규칙을 어기면 어떻게 알 수 있나요? → A. `eslint-plugin-react-hooks`가 `rules-of-hooks`, `exhaustive-deps`로 정적 검출합니다. 런타임에서는 "Rendered fewer/more hooks than expected" 에러가 납니다.
- Q. early return 뒤에 훅을 두면? → A. 조건부 return 이후의 훅은 호출이 건너뛰어질 수 있어 같은 문제입니다. **모든 훅은 return보다 위**에 둬야 합니다.

<details><summary>📝 한 줄 요약</summary>훅은 호출 순서(index)로 Fiber의 연결 리스트에 매칭된다 → 조건·반복·중첩 안에서 호출하면 순서가 깨져 상태가 섞인다. 그래서 "최상위 + React 함수 안"이 필수.</details>

---

## D2. useState로 바꾼 값이 왜 바로 반영되지 않나요? (배칭·함수형 업데이트·lazy init) 🔴

**💬 30초 답변**
> `setState`는 **비동기적으로 예약**되는 요청이지, 그 자리에서 변수를 바꾸는 게 아닙니다. React는 이벤트 핸들러(및 React 18부터는 `setTimeout`·`Promise`·네이티브 이벤트 포함 대부분)에서 여러 `set` 호출을 **모아서(batching) 한 번에** 리렌더합니다. 그래서 같은 함수 안에서 `set` 직후 state를 읽으면 **이번 렌더에 캡처된 옛 값**이 보입니다. 이전 값에 기반해 갱신할 땐 **함수형 업데이트** `setX(prev => ...)`를 써야 하고, 초기값 계산이 비싸면 **lazy initializer** `useState(() => f())`로 최초 렌더에만 계산합니다.

**📖 핵심 개념**

🎯 **비유**: `setState`는 "다음 사진(렌더)을 이렇게 찍어 주세요"라는 **주문서**입니다. 주문서를 넣었다고 지금 손에 든 사진이 바뀌지 않습니다. React가 주문들을 모아 새 사진을 한 장 찍고, 그 사진에서 새 값이 보입니다.

📌 **배칭(batching)**: 한 이벤트 안에서 `set`을 3번 호출해도 리렌더는 1번입니다. React 18의 **자동 배칭(automatic batching)** 덕분에 비동기 콜백 안에서도 배칭됩니다(React 17까지는 이벤트 핸들러 밖에서는 배칭 안 됨).

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(count + 1); // count=0 캡처 → 1
    setCount(count + 1); // 여전히 0 캡처 → 1  ❌ (최종 1)
    console.log(count);  // 0 — 이번 렌더의 값
  };
  const handleClickOk = () => {
    setCount(c => c + 1); // 0 → 1
    setCount(c => c + 1); // 1 → 2  ✅ (최종 2)
  };
}
```

📌 **왜 이번 렌더 값이 보이나(클로저)**: `count`는 이번 렌더 함수의 **지역 상수**입니다. 렌더마다 새 `count`가 만들어지고 핸들러는 그 값을 클로저로 캡처합니다. 그래서 "state는 스냅샷"이라고 말합니다. (→ D4로 이어짐)

📌 **lazy initializer**: `useState(computeExpensive())`는 매 렌더마다 `computeExpensive()`를 호출(결과는 최초에만 쓰임)합니다. `useState(() => computeExpensive())`는 **최초 렌더 한 번만** 실행합니다.

**🔥 예상 꼬리질문**
- Q. 객체 state를 부분만 바꾸려면? → A. useState는 자동 병합을 하지 않으므로 `setUser(u => ({ ...u, name }))`로 **직접 펼쳐** 새 객체를 만들어야 합니다(불변성 유지).
- Q. `set`으로 이전과 **같은 값**을 넣으면? → A. `Object.is` 비교로 같으면 React가 리렌더를 **건너뛸 수 있습니다**(bail out). 단, 이미 렌더 함수 진입 후라면 한 번은 다시 실행될 수도 있습니다.
- Q. 왜 함수형 업데이트가 더 안전한가요? → A. 캡처된 옛 값이 아니라 **React가 큐에 쌓인 최신 상태를 인자로 전달**하기 때문입니다. 연속 갱신·비동기 상황에서 안전합니다.

<details><summary>📝 한 줄 요약</summary>set은 다음 렌더 예약(비동기·배칭). 같은 렌더에서 읽으면 옛 스냅샷. 이전 값 기반 갱신은 `setX(prev=>...)`, 비싼 초기값은 `useState(()=>...)`.</details>

---

## D3. useEffect는 정확히 언제 실행되고, 언제 클린업되나요? 🔴

**💬 30초 답변**
> `useEffect`의 콜백은 **렌더링 결과가 화면에 그려진(paint) 뒤 비동기적으로** 실행됩니다. 클린업(cleanup) 함수는 두 시점에 호출됩니다. ① **다음 이펙트가 실행되기 직전**(의존성이 바뀌어 재실행될 때, 이전 이펙트를 정리), ② **컴포넌트가 언마운트될 때**. 의존성 배열은 "이 값들이 바뀌면 이펙트를 다시 실행하라"는 목록으로, `[]`이면 마운트 시 1회, 배열 자체를 생략하면 매 렌더마다 실행됩니다. 순서는 **커밋 → 화면 그림 → (이전 클린업) → 이펙트**입니다.

**📖 핵심 개념**

🎯 **비유**: useEffect는 "무대(화면)가 완성된 뒤에 하는 뒷정리·설치 작업"입니다. 장면이 바뀌면 **먼저 이전 세트를 철거(cleanup)**하고 **새 세트를 설치**합니다.

📌 **실행 순서(리렌더 시)**:
1. 컴포넌트 함수 실행(렌더) → 새 가상 DOM
2. React가 실제 DOM에 커밋
3. 브라우저가 화면 페인트
4. 의존성이 바뀐 이펙트에 대해 **이전 이펙트의 cleanup 실행**
5. 새 이펙트 콜백 실행

```jsx
function Timer({ delay }) {
  useEffect(() => {
    const id = setInterval(() => console.log('tick'), delay);
    return () => clearInterval(id); // delay 바뀌면 이전 타이머 정리 후 재설정, 언마운트 시 정리
  }, [delay]); // delay가 바뀔 때마다 정리 → 재실행
}
```

📌 **의존성 배열 3가지 패턴**:
- `useEffect(fn)` — **매 렌더마다** 실행 (보통 피함)
- `useEffect(fn, [])` — **마운트 시 1회**, 언마운트 시 클린업 1회
- `useEffect(fn, [a, b])` — `a` 또는 `b`가 이전과 다르면(`Object.is`) 재실행

📌 **exhaustive-deps**: 이펙트 안에서 쓰는 모든 반응형 값(props·state·그로부터 파생된 함수)은 **의존성에 넣어야** 합니다. 빼면 stale closure(D4)로 옛 값을 보게 됩니다. 린트 경고를 임의로 무시하지 말 것.

📌 **정리 대상**: 타이머, 이벤트 리스너, 구독(subscription), 웹소켓, `fetch`의 `AbortController` 등 — **이펙트가 만든 부수효과는 반드시 되돌려야** 메모리 누수·중복 요청·경쟁 조건을 막습니다.

**🔥 예상 꼬리질문**
- Q. 데이터 패칭에 useEffect를 그대로 써도 되나요? → A. 간단한 경우는 되지만, 경쟁 조건·중복 요청·캐싱 문제로 실무에서는 **TanStack Query 같은 데이터 라이브러리**나 프레임워크의 데이터 로딩을 권장합니다(→ 07-19 편 참고). 직접 쓸 땐 cleanup에서 `AbortController`로 취소하거나 `ignore` 플래그로 늦게 온 응답을 버립니다.
- Q. `[]` 이펙트에서 최신 state를 못 읽는 이유는? → A. 마운트 시점의 클로저에 갇히기 때문입니다. → D4의 해법(함수형 업데이트·ref·이펙트 분리) 사용.
- Q. cleanup이 없는 이펙트는? → A. 구독/타이머가 없다면 없어도 됩니다. 다만 부수효과가 외부 자원을 잡는다면 반드시 필요합니다.

<details><summary>📝 한 줄 요약</summary>이펙트는 페인트 후 실행, 클린업은 "다음 실행 직전 + 언마운트 시". deps는 재실행 트리거 목록이고 exhaustive-deps를 지켜야 stale를 피한다. 만든 부수효과는 cleanup으로 되돌린다.</details>

---

## D4. 오래된 클로저(stale closure) 함정은 왜 생기고, 어떻게 푸나요? 🔴

**💬 30초 답변**
> React 함수 컴포넌트는 렌더마다 **새로 실행**되고, 그 안의 함수(핸들러·이펙트 콜백)는 **그 렌더 시점의 변수 값을 클로저로 캡처**합니다. 이 함수가 나중에(타이머·구독 콜백 등) 실행되면 캡처한 **옛 값**을 그대로 씁니다 — 이게 stale closure입니다. 해법은 ① **함수형 업데이트** `setX(prev => ...)`, ② 최신 값을 **`useRef`에 담아 `.current`로 읽기**, ③ **의존성 배열을 정확히 채워** 이펙트를 최신 값으로 재생성, ④ (실험적) `useEffectEvent`로 "최신 값을 읽되 이펙트를 재실행하지 않는" 로직 분리입니다.

**📖 핵심 개념**

🎯 **비유**: 렌더는 **매번 새로 인화한 사진 한 장**입니다. 사진 속 인물(변수)은 그 순간의 모습으로 고정됩니다. 그 사진을 나중에 봐도 인물은 늙지 않습니다. 최신 모습을 보려면 새 사진(리렌더)이 필요하거나, 실시간 창문(ref)으로 봐야 합니다.

```jsx
// ❌ stale closure: [] 때문에 마운트 때의 count(0)에 갇힘
function Broken() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000);
    // count는 항상 0 → 매초 setCount(0+1) → 화면은 1에서 멈춤
    return () => clearInterval(id);
  }, []);
}

// ✅ 해법1: 함수형 업데이트 — 캡처값에 의존하지 않음
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);
}, []); // deps 비워도 안전

// ✅ 해법2: ref로 최신 값 보관
const countRef = useRef(count);
countRef.current = count; // 매 렌더마다 최신화
useEffect(() => {
  const id = setInterval(() => console.log(countRef.current), 1000);
  return () => clearInterval(id);
}, []);
```

📌 **어디서 자주 터지나**: `setInterval`/`setTimeout` 콜백, 전역 이벤트 리스너(`addEventListener`), 웹소켓 `onmessage`, 외부 구독처럼 **오래 살아있는 콜백**에서. 이들은 등록 시점의 클로저를 계속 들고 있습니다.

📌 **exhaustive-deps와의 관계**: 린트가 "count를 deps에 넣어라"라고 하면 두 선택지가 있습니다. (a) deps에 넣어 값이 바뀔 때마다 이펙트를 **정직하게 재생성**(타이머 재설정), (b) 재생성이 곤란하면 함수형 업데이트나 ref로 **의존성을 제거**. 무작정 주석으로 린트를 끄는 건 버그의 씨앗입니다.

📌 **`useEffectEvent`(실험적)**: "이펙트 안에서 최신 props/state는 읽되, 그 값 때문에 이펙트가 재실행되진 않게" 하고 싶을 때 쓰는 API입니다. 예: 채팅방 연결 이펙트는 `roomId`에만 반응하고, 알림에 쓰는 `theme`는 최신 값을 읽되 재연결을 유발하지 않도록. **아직 실험적(canary)** 이므로 프로덕션에선 위 안정 해법을 우선합니다.

**🔥 예상 꼬리질문**
- Q. 왜 클래스 컴포넌트에는 이 문제가 덜했나요? → A. 클래스는 `this.state`라는 **가변 참조**로 항상 최신을 읽었기 때문입니다. 함수형은 값이 렌더별로 고정(불변 스냅샷)이라 클로저 함정이 드러납니다.
- Q. ref 해법의 단점은? → A. ref 변경은 **리렌더를 트리거하지 않으므로**, 그 값으로 화면을 그려야 한다면 부적절합니다. "표시용 = state, 최신값 읽기용 = ref"로 구분하세요(→ D5).
- Q. 함수형 업데이트로 항상 해결되나요? → A. "이전 state로부터 다음 state"를 계산할 때만입니다. 이펙트가 여러 값을 조합해 부수효과를 낸다면 deps 정리나 ref/`useEffectEvent`가 필요합니다.

<details><summary>📝 한 줄 요약</summary>렌더마다 함수가 그 시점 변수를 캡처 → 오래 사는 콜백이 옛 값을 씀(stale). 해법: 함수형 업데이트, ref로 최신값 읽기, deps 정확히 채우기, (실험적) useEffectEvent.</details>

---

## D5. useRef는 언제 쓰고, state와 무엇이 다른가요? 🔴

**💬 30초 답변**
> `useRef`는 렌더 간에 **유지되는 가변 컨테이너**(`{ current }`)를 돌려줍니다. 두 가지 용도가 있습니다. ① **DOM 노드 접근**(`<input ref={inputRef}>` 후 `inputRef.current.focus()`), ② **리렌더를 유발하지 않고 값 보존**(타이머 id, 이전 값, 최신 state 캐시 등). state와의 결정적 차이는 **`.current`를 바꿔도 리렌더가 일어나지 않는다**는 것과, 값이 **즉시(동기적으로)** 반영된다는 점입니다. "화면에 그려야 하는 값이면 state, 그렇지 않은 부수적 값이면 ref"가 기준입니다.

**📖 핵심 개념**

🎯 **비유**: state는 **게시판에 붙이는 공지**(바꾸면 모두가 다시 봄 = 리렌더)이고, ref는 **주머니 속 메모지**(내가 언제든 꺼내 고쳐 쓰지만 남에게 알림은 안 감)입니다.

```jsx
function TextInput() {
  const inputRef = useRef(null);         // ① DOM 참조
  const renderCount = useRef(0);         // ② 리렌더 없이 값 보존
  renderCount.current++;                 // 렌더 횟수 세기(화면엔 영향 없음)
  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>포커스</button>
    </>
  );
}
```

📌 **state vs ref 비교표**

| 구분 | useState | useRef |
|---|---|---|
| 변경 시 리렌더 | O | X |
| 값 반영 시점 | 다음 렌더(비동기·배칭) | 즉시(동기) |
| 렌더에 사용 | 화면에 그림 | 그리면 안 됨(렌더 중 읽기/쓰기 지양) |
| 대표 용도 | UI 상태 | DOM 참조, 타이머 id, 최신값 캐시 |

📌 **렌더 중 ref를 읽거나 쓰지 말 것**: `ref.current`를 렌더링 로직(반환 JSX 계산)에서 읽고 쓰면 순수성이 깨져 예측 불가한 결과가 납니다. **이벤트 핸들러나 이펙트 안에서** 다루세요(위 `renderCount++`처럼 순수 부수효과가 없는 카운팅은 예외적으로 허용되지만 화면 값으로는 쓰지 않습니다).

📌 **React 19의 ref 개선**: React 19부터 함수 컴포넌트가 `ref`를 **일반 prop처럼** 받을 수 있어 `forwardRef` 없이도 자식에 ref를 넘길 수 있습니다(기존 `forwardRef`도 계속 동작). 또한 ref 콜백이 **cleanup 함수를 반환**할 수 있게 됐습니다.

**🔥 예상 꼬리질문**
- Q. `useRef(0)`과 `useState(0)` 중 "이전 값 기억"엔 뭘 쓰나요? → A. 화면에 안 보이는 이전 값 추적이면 ref(+이펙트에서 갱신)가 적합합니다. 예: `usePrevious` 커스텀 훅.
- Q. ref로 상태를 관리하면 안 되나요? → A. 화면이 그 값에 따라 바뀌어야 하는데 ref로만 두면 **갱신해도 화면이 안 바뀝니다**. 표시용은 반드시 state.
- Q. `createRef`와 `useRef` 차이는? → A. `createRef`는 렌더마다 새 객체를 만들어 함수 컴포넌트에선 값이 유지되지 않습니다. 함수형에선 `useRef`를 씁니다.

<details><summary>📝 한 줄 요약</summary>useRef = 렌더 간 유지되는 가변 `{current}`. 바꿔도 리렌더 없음·즉시 반영. DOM 참조와 "그리지 않는 값" 보존용. 화면에 그릴 값은 state.</details>

---

## D6. useLayoutEffect와 useEffect는 무엇이 다른가요? 🟡

**💬 30초 답변**
> 실행 **타이밍**이 다릅니다. `useEffect`는 브라우저가 화면을 **그린(paint) 뒤 비동기**로 실행되고, `useLayoutEffect`는 DOM 변경 직후 **화면을 그리기 전에 동기적으로** 실행됩니다. 그래서 "레이아웃을 측정해서 그 값으로 DOM을 다시 조정해야 하는데, 중간 상태가 사용자에게 깜빡여 보이면 안 되는 경우"에 `useLayoutEffect`를 씁니다(예: 툴팁 위치 계산). 대부분은 `useEffect`가 정답이고, `useLayoutEffect`는 **메인 스레드를 막아** 성능에 영향을 줄 수 있어 필요할 때만 씁니다.

**📖 핵심 개념**

🎯 **비유**: `useLayoutEffect`는 "손님에게 사진을 보여주기 **직전에** 액자 위치를 바로잡는 것"(깜빡임 없음, 대신 보여주는 게 잠깐 지연). `useEffect`는 "일단 보여준 **뒤에** 정리하는 것"(빠르지만 조정이 눈에 띌 수 있음).

```jsx
function Tooltip({ targetRef }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useLayoutEffect(() => {
    const rect = targetRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom, left: rect.left }); // 페인트 전에 위치 확정 → 깜빡임 없음
  }, [targetRef]);
  return <div style={{ position: 'absolute', ...pos }}>툴팁</div>;
}
```

📌 **선택 기준**: 화면 측정(`getBoundingClientRect`, 스크롤 위치 등) 후 **즉시 보정이 필요**하고 그 중간 상태가 보이면 안 될 때만 `useLayoutEffect`. 그 외 데이터 패칭·구독·로깅 등은 `useEffect`.

📌 **SSR 주의**: `useLayoutEffect`는 **서버에서 실행되지 않아** SSR/Next.js에서 "useLayoutEffect does nothing on the server" 경고가 날 수 있습니다. 서버·클라이언트 모두 안전하게 하려면 `useEffect`를 쓰거나, 라이브러리들이 쓰는 `useIsomorphicLayoutEffect`(클라이언트에선 layout, 서버에선 effect) 패턴을 씁니다.

**🔥 예상 꼬리질문**
- Q. 둘 다 클린업 규칙은 같나요? → A. 네. cleanup 시점 규칙(다음 실행 직전·언마운트)은 동일하고 타이밍만 다릅니다.
- Q. useLayoutEffect가 성능에 나쁜 이유는? → A. 페인트 전에 동기 실행되므로 그 안이 무거우면 **첫 화면 표시가 지연**됩니다. 무거운 작업은 useEffect로.

<details><summary>📝 한 줄 요약</summary>useLayoutEffect=페인트 전 동기(측정·보정, 깜빡임 방지), useEffect=페인트 후 비동기(대부분의 경우). SSR에선 layout 버전 주의.</details>

---

## D7. 커스텀 훅은 언제·왜 만들고, 어떻게 설계하나요? 🟡

**💬 30초 답변**
> 커스텀 훅은 **훅을 사용하는 로직을 재사용 가능한 함수로 추출**한 것입니다. 이름이 `use`로 시작하고 내부에서 다른 훅을 호출할 수 있다는 점만 지키면 됩니다. 목적은 **UI가 아니라 "상태를 다루는 로직(stateful logic)"을 공유**하는 것 — 폼 처리, 데이터 구독, 미디어 쿼리, 디바운스 등. 중요한 원리: 두 컴포넌트가 같은 커스텀 훅을 써도 **state는 공유되지 않고 각자 독립**입니다(로직만 공유). 반환값은 상황에 맞게 배열(`useState`처럼 이름 자유) 또는 객체(멤버가 많을 때)로 설계합니다.

**📖 핵심 개념**

🎯 **비유**: 커스텀 훅은 **요리 레시피**입니다. 레시피(로직)는 공유되지만, 각 집에서 만든 요리(state)는 서로 다른 접시에 담깁니다.

```jsx
// 디바운스 커스텀 훅
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // 값이 또 바뀌면 이전 타이머 취소
  }, [value, delay]);
  return debounced;
}

// 사용
function Search() {
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 500); // 타이핑 멈춘 뒤 500ms에만 갱신
  useEffect(() => { /* debouncedQ로 검색 요청 */ }, [debouncedQ]);
  return <input value={q} onChange={e => setQ(e.target.value)} />;
}
```

📌 **설계 원칙**:
- **`use` 접두사 필수**: 린트가 훅 규칙을 검사하고, 다른 훅을 호출할 수 있음을 나타냅니다.
- **한 가지 관심사**: 훅은 하나의 명확한 일을 하도록. 너무 많은 걸 반환하면 재사용성이 떨어집니다.
- **반환 형태**: 값이 2~3개면 배열(`const [a, b] = useX()`), 그 이상이거나 선택적으로 골라 쓰면 객체(`const { data, isLoading } = useX()`).
- **콜백/함수 반환 시 안정성**: 반환하는 함수는 필요하면 `useCallback`으로 감싸 참조 안정성을 확보(소비 측 이펙트 deps에 넣을 때).

📌 **커스텀 훅 ≠ 상태 공유 수단**: 여러 컴포넌트가 **같은 상태 인스턴스**를 봐야 한다면 커스텀 훅이 아니라 Context나 전역 상태 라이브러리가 필요합니다(→ 07-19 편). 커스텀 훅은 "로직 복제 제거"이지 "상태 단일화"가 아닙니다.

**🔥 예상 꼬리질문**
- Q. 언제 추출해야 하나요? → A. 같은 훅 조합 로직이 **2곳 이상 중복**되거나, 컴포넌트 본문이 부수효과 설정으로 길어져 **읽기 어려울 때**. 성급한 추출은 오히려 추상화 비용만 늘립니다.
- Q. 커스텀 훅 안에서 조건부로 다른 훅을 호출해도 되나요? → A. 안 됩니다. 훅 규칙(D1)은 커스텀 훅 내부에도 그대로 적용됩니다.
- Q. 커스텀 훅과 일반 유틸 함수의 차이는? → A. 커스텀 훅은 **내부에서 훅을 호출**(상태·라이프사이클과 엮임)합니다. 훅을 안 쓰는 순수 계산이면 일반 함수로 두는 게 맞습니다.

<details><summary>📝 한 줄 요약</summary>커스텀 훅 = 훅 로직 재사용용 `use...` 함수. 로직만 공유되고 state는 인스턴스별 독립. 상태 공유가 목적이면 Context/전역 상태를 쓴다.</details>

---

## D8. StrictMode에서 왜 두 번 실행되나요? React 19의 `use` 훅은? 🟢

**💬 30초 답변**
> `<StrictMode>`는 **개발 모드에서만** 컴포넌트 함수와 이펙트를 **의도적으로 두 번 실행**(마운트 시 setup→cleanup→setup)합니다. 목적은 **순수하지 않은 렌더링과 정리(cleanup)를 빼먹은 이펙트를 조기에 드러내기** 위함입니다. 프로덕션에서는 한 번만 실행되니 걱정하지 않아도 됩니다. React 19의 `use`는 **Promise나 Context를 읽는** 새 API로, 기존 훅과 달리 **조건문·반복문 안에서도 호출 가능**하고 Suspense와 연동됩니다.

**📖 핵심 개념**

📌 **StrictMode 이중 실행이 잡아내는 것**: cleanup을 안 한 이펙트는 두 번째 setup에서 **구독/타이머가 중복**돼 버그가 눈에 띕니다. 즉 "두 번 실행해도 멀쩡한가?"로 이펙트의 **멱등성·정리 완결성**을 테스트하는 장치입니다. 해결책은 이펙트를 없애는 게 아니라 **cleanup을 제대로 작성**하는 것입니다(D3).

```jsx
// StrictMode에서 두 번 실행돼도 안전: cleanup이 구독을 정리
useEffect(() => {
  const sub = source.subscribe();
  return () => sub.unsubscribe(); // ✅ 두 번째 setup 전에 정리됨
}, []);
```

📌 **React 19 `use` (안정)**: Promise를 넘기면 값을 **읽고**, 아직 대기 중이면 가장 가까운 `<Suspense>`가 폴백을 보여줍니다. Context도 `use(MyContext)`로 읽을 수 있고, **조건부 호출이 허용**됩니다(기존 훅 규칙의 예외). 단, 렌더 중 만든 Promise를 그대로 `use`하면 매 렌더 새 Promise가 생기므로, Promise는 상위(서버 컴포넌트 등 캐시되는 곳)에서 만들어 내려주는 패턴을 권장합니다.

📌 **함께 등장한 React 19 훅들(참고)**: 폼 액션 상태용 `useActionState`, 낙관적 UI용 `useOptimistic`, 폼 제출 상태용 `useFormStatus`(react-dom). 서버 액션과 함께 폼 UX를 단순화합니다.

📌 **`useEffectEvent`**: D4에서 언급한 대로 **아직 실험적(canary)**. 이펙트에서 "최신 값 읽기 + 재실행 안 함"이 필요할 때 후보지만, 안정화 전까지는 안정 해법을 우선하세요.

**🔥 예상 꼬리질문**
- Q. StrictMode를 끄면 되나요? → A. 끄면 문제를 못 볼 뿐 버그는 남습니다. **cleanup을 올바르게** 짜는 게 정답입니다.
- Q. `use`가 기존 훅 규칙을 깬다는데 안전한가요? → A. `use`는 규칙의 예외로 **설계된** API라 조건부 호출이 허용됩니다. 나머지 훅(useState 등)은 여전히 규칙을 지켜야 합니다.
- Q. 서버 컴포넌트에서도 훅을 쓰나요? → A. `useState`·`useEffect` 같은 클라이언트 훅은 서버 컴포넌트에서 못 씁니다. 서버 컴포넌트는 상태가 없고, `use`로 데이터를 읽는 정도가 어울립니다(→ 07-25 Next 편 참고).

<details><summary>📝 한 줄 요약</summary>StrictMode는 개발 중 이중 실행으로 순수성·cleanup 누락을 드러낸다(운영은 1회). React 19 `use`는 Promise/Context를 읽고 조건부 호출 허용·Suspense 연동. useEffectEvent는 아직 실험적.</details>

---

## 🎯 한 장 요약 (면접 직전 훑기)

- **훅 규칙**: 호출 **순서(index)**로 상태를 기억 → 최상위·React 함수 안에서만 호출. 조건/반복/early-return 아래 금지.
- **useState**: `set`은 다음 렌더 예약(비동기·배칭). 같은 렌더에선 옛 스냅샷. 이전 값 기반 → `setX(p=>...)`, 비싼 초기값 → `useState(()=>...)`.
- **useEffect**: 페인트 **후** 실행, cleanup은 "다음 실행 직전 + 언마운트". `[]`=1회, 생략=매 렌더. **exhaustive-deps** 준수. 만든 부수효과는 cleanup으로 되돌리기.
- **stale closure**: 렌더별 캡처 때문에 오래 사는 콜백이 옛 값 사용 → 함수형 업데이트 / ref로 최신값 / deps 정확히 / (실험적) useEffectEvent.
- **useRef**: 리렌더 없이 유지되는 가변 `{current}`. DOM 참조·타이머·최신값 캐시. 화면 값은 state.
- **useLayoutEffect**: 페인트 전 동기(측정·깜빡임 방지). 대부분은 useEffect. SSR 주의.
- **커스텀 훅**: `use...`로 로직 재사용. state는 인스턴스별 독립(공유 아님).
- **StrictMode**: 개발 중 이중 실행으로 버그 조기 발견. **React 19 `use`**: Promise/Context 읽기 + 조건부 호출 허용.
