# React 리렌더링과 렌더링 최적화 심화

> 주제: React가 언제·왜 다시 렌더링되는가, 그리고 `memo`/`useMemo`/`useCallback`을 실전에서 어떻게(그리고 언제 쓰지 말아야) 쓰는가
> 출처: 일일 심화 자료 (기존 4.react_next.md Q59 "성능 최적화"의 심화 보강편)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-리액트-컴포넌트는-언제-리렌더링되나요) | 컴포넌트는 언제 리렌더링되나요? | 🔴 |
| [D2](#d2-부모가-리렌더링되면-자식은-항상-리렌더링되나요) | 부모 리렌더 → 자식도 항상? | 🔴 |
| [D3](#d3-reactmemo는-무엇을-해결하나요) | `React.memo`는 무엇을 해결하나요? | 🔴 |
| [D4](#d4-usememo와-usecallback의-차이와-실제-쓰임새는) | `useMemo` vs `useCallback` | 🔴 |
| [D5](#d5-참조-동일성referential-equality이-왜-핵심인가요) | 참조 동일성이 왜 핵심인가? | 🔴 |
| [D6](#d6-왜-모든-곳에-memo를-붙이면-안-되나요) | 왜 다 붙이면 안 되나? | 🟡 |
| [D7](#d7-메모이제이션-없이-구조로-해결하는-법) | 구조로 해결하기 | 🟡 |
| [D8](#d8-react-19의-react-compiler는-이-이야기를-어떻게-바꾸나요) | React Compiler | 🟢 |

---

## D1. 리액트 컴포넌트는 언제 리렌더링되나요? 🔴

**💬 30초 답변**
> 리액트 컴포넌트가 다시 렌더링되는 경우는 크게 세 가지입니다. ① 자신의 **state가 바뀔 때**, ② **부모가 리렌더링될 때**, ③ 구독 중인 **Context 값이 바뀔 때**입니다. 여기서 "렌더링"은 화면을 다시 그리는 게 아니라 **컴포넌트 함수를 다시 호출해서 새 가상 DOM을 만드는 것**을 의미합니다. 실제 DOM 반영은 그다음 재조정(reconciliation) 단계에서 달라진 부분만 일어납니다.

**📖 핵심 개념**

🎯 **비유**: 렌더링은 "설계도를 다시 그리는 것", 커밋(DOM 반영)은 "실제로 벽을 뜯어 고치는 것"입니다. 설계도를 다시 그렸다고 해서 항상 벽을 부수지는 않습니다. 리액트는 새 설계도와 이전 설계도를 비교(diff)해서 **바뀐 부분만** 실제 공사(DOM 조작)를 합니다.

📌 **렌더링의 두 단계**
- **Render Phase(렌더 단계)**: 컴포넌트 함수 실행 → 새 가상 DOM(엘리먼트 트리) 생성. 부수효과(side effect)가 없어야 하는 순수 단계.
- **Commit Phase(커밋 단계)**: 이전 트리와 diff한 결과를 실제 DOM에 반영. 이때 `useLayoutEffect` → 브라우저 페인트 → `useEffect` 순으로 실행.

📌 **오해 주의**: `props`가 바뀌는 것 자체가 리렌더의 "원인"은 아닙니다. props를 바꾸려면 결국 **부모가 리렌더링**되어야 하므로, 근본 트리거는 state 변경(또는 Context, 강제 업데이트)입니다.

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  console.log("Counter 렌더링"); // setCount 호출 시마다 찍힘
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

> 💡 같은 값으로 `setState`를 호출하면(`Object.is` 기준 동일) 리액트는 **렌더링을 건너뜁니다**. 단, 이미 렌더 단계에 진입한 뒤 판단하는 경우도 있어 "1회는 호출될 수 있음"을 기억하세요.

**🔥 예상 꼬리질문**
- Q. state를 바꿨는데 화면이 안 바뀌면? → A. 배열/객체를 **직접 변이(mutation)** 했을 가능성. `arr.push()` 후 같은 참조를 setState하면 `Object.is`가 true라 리렌더가 스킵됩니다. 새 배열/객체로 교체해야 합니다.
- Q. 렌더링이 곧 DOM 조작인가요? → A. 아닙니다. 렌더는 함수 호출이고, DOM 반영은 diff 후 달라진 부분만 커밋 단계에서 일어납니다.

<details><summary>📝 한 줄 요약</summary>리렌더 트리거는 state·부모 렌더·Context 변경. 렌더(함수 재호출) ≠ DOM 반영(diff 후 변경분만 커밋).</details>

---

## D2. 부모가 리렌더링되면 자식은 항상 리렌더링되나요? 🔴

**💬 30초 답변**
> 기본적으로 **네, 부모가 리렌더링되면 그 아래 모든 자식이 리렌더링됩니다.** props가 바뀌지 않았더라도요. 리액트는 "props가 안 바뀌었으니 자식을 건너뛰자"를 자동으로 판단하지 않습니다. 이 기본 동작을 막고 싶을 때 `React.memo`로 자식을 감싸 props가 실제로 바뀔 때만 리렌더링하도록 만듭니다.

**📖 핵심 개념**

🎯 **비유**: 부모가 "회의 다시 하자"고 하면 팀원 전원이 회의실에 모입니다(리렌더). 실제로 안건이 바뀐 사람만 오게 하려면 별도의 규칙(`React.memo`)이 필요합니다.

📌 흔한 오해: "props 안 바꿨으니 자식은 안 그려지겠지" → **틀림**. 부모 렌더 = 자식 함수도 호출됨.

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <Child />  {/* count와 무관하지만 매 클릭마다 리렌더됨 */}
    </div>
  );
}
function Child() {
  console.log("Child 렌더링"); // 버튼 누를 때마다 찍힘
  return <p>나는 자식</p>;
}
```

> 💡 **children으로 넘기면 리렌더를 피할 수 있다**: `<Parent><Child /></Parent>` 구조에서 `<Child />`가 Parent 바깥(더 위)에서 생성되면, Parent의 state가 바뀌어도 Child 엘리먼트 참조는 그대로라 리렌더되지 않습니다. (D7에서 상세히)

**🔥 예상 꼬리질문**
- Q. 그럼 리렌더가 많으면 무조건 성능 문제인가요? → A. 아닙니다. 대부분의 리렌더는 매우 빠릅니다(수백 μs). 리스트가 크거나, 렌더 중 무거운 계산이 있거나, 렌더 횟수가 폭증할 때만 문제가 됩니다. **측정 먼저.**
- Q. 자식 리렌더를 막는 방법은? → A. `React.memo`(props 비교), 상태를 더 아래로 내리기(colocation), children/컴포지션 활용.

<details><summary>📝 한 줄 요약</summary>부모 렌더 시 자식은 기본적으로 전부 재호출. 막으려면 `React.memo` 또는 구조(컴포지션)로 해결.</details>

---

## D3. `React.memo`는 무엇을 해결하나요? 🔴

**💬 30초 답변**
> `React.memo`는 컴포넌트를 감싸서, **props가 이전과 얕게(shallow) 같으면 리렌더링을 건너뛰게** 하는 고차 컴포넌트(HOC)입니다. 부모가 리렌더링돼도 자식의 props가 그대로면 자식 함수 호출 자체를 스킵합니다. 단, props에 함수·객체·배열이 매번 새로 만들어져 전달되면 얕은 비교에서 매번 "다르다"고 판정되어 memo가 무력화되므로, 보통 `useCallback`/`useMemo`와 함께 씁니다.

**📖 핵심 개념**

📌 얕은 비교(shallow compare): 각 prop을 `Object.is`로 1단계만 비교. 원시값은 값 비교, 객체/함수는 **참조** 비교.

```jsx
const Child = React.memo(function Child({ label }) {
  console.log("Child 렌더링");
  return <p>{label}</p>;
});

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <Child label="고정 문자열" /> {/* label이 안 바뀌므로 리렌더 스킵 */}
    </>
  );
}
```

> 💡 비교 로직을 직접 주고 싶으면 두 번째 인자로 `areEqual(prevProps, nextProps)`를 전달합니다. `true`를 반환하면 "같음 → 스킵".

**🔥 예상 꼬리질문**
- Q. memo를 붙였는데도 자식이 계속 리렌더돼요. → A. 객체/함수 prop을 부모가 매 렌더마다 새로 만들어 넘기고 있을 확률이 높습니다(참조가 매번 달라짐). `useMemo`/`useCallback`으로 참조를 고정하세요.
- Q. `PureComponent`와 관계는? → A. 클래스형의 `PureComponent`가 하는 얕은 props/state 비교를 함수형에서 하는 게 `React.memo`입니다.

<details><summary>📝 한 줄 요약</summary>`React.memo`는 props 얕은 비교로 리렌더 스킵. 객체·함수 prop은 참조 고정(useMemo/useCallback)을 병행해야 효과.</details>

---

## D4. `useMemo`와 `useCallback`의 차이와 실제 쓰임새는? 🔴

**💬 30초 답변**
> 둘 다 "의존성 배열이 바뀔 때만 다시 계산"하는 메모이제이션 훅입니다. **`useMemo`는 계산한 값(결과)을 캐싱**하고, **`useCallback`은 함수 자체(참조)를 캐싱**합니다. `useCallback(fn, deps)`는 `useMemo(() => fn, deps)`와 사실상 동일합니다. 쓰는 목적은 둘 다 ① `React.memo` 자식에 안정적인 참조를 넘기거나, ② `useEffect` 의존성으로 쓰이는 값의 참조를 안정화하거나, ③ 렌더마다 반복되는 무거운 계산을 피하기 위해서입니다.

**📖 핵심 개념**

```jsx
// 값 캐싱: 정렬/필터 같은 무거운 계산
const sorted = useMemo(() => items.slice().sort(compareFn), [items]);

// 함수 캐싱: memo된 자식에 넘길 콜백의 참조 고정
const handleClick = useCallback((id) => {
  setSelected(id);
}, []); // deps 비어있으면 최초 참조 계속 유지
```

📌 언제 실제로 필요한가:
- `React.memo`로 감싼 자식에 **함수/객체 prop**을 넘길 때 → `useCallback`/`useMemo`로 참조 고정해야 memo가 작동.
- **비용이 큰 계산**(수천 건 정렬·필터, 파생 데이터 가공)을 매 렌더마다 반복하고 싶지 않을 때 → `useMemo`.
- `useEffect`/커스텀 훅의 **의존성 배열**에 들어가는 객체·함수를 안정화해 불필요한 effect 재실행을 막을 때.

> 💡 **함정**: `useCallback`/`useMemo` 자체도 공짜가 아닙니다. 의존성 배열 비교 + 캐시 저장 비용이 있습니다. 값이 가볍고 자식이 memo도 아니라면 **오히려 손해**입니다.

**🔥 예상 꼬리질문**
- Q. `useMemo`로 컴포넌트를 감싸도 되나요? → A. 가능하지만 권장 X. 컴포넌트 메모이제이션은 `React.memo`가 정석입니다.
- Q. deps에 객체를 넣으면? → A. 매 렌더마다 참조가 달라지면 캐시가 매번 무효화되어 메모이제이션이 무의미해집니다. 원시값으로 쪼개거나 상위에서 참조를 고정하세요.
- Q. 의존성을 일부러 비워도 되나요? → A. 클로저가 오래된 값(stale closure)을 잡을 수 있어 위험. `setState`의 함수형 업데이트(`setX(prev => ...)`)로 의존성을 줄이는 게 안전합니다.

<details><summary>📝 한 줄 요약</summary>`useMemo`=값 캐싱, `useCallback`=함수 참조 캐싱. 목적은 memo 자식에 안정 참조 제공·무거운 계산 회피·effect 의존성 안정화.</details>

---

## D5. 참조 동일성(referential equality)이 왜 핵심인가요? 🔴

**💬 30초 답변**
> 리액트의 최적화(`React.memo`, 훅 deps 비교)는 대부분 **참조 비교(`Object.is`)** 위에서 동작하기 때문입니다. 자바스크립트에서 `{} === {}`는 `false`, `[] === []`도 `false`, 매번 새로 선언한 함수도 서로 다른 참조입니다. 그래서 렌더마다 새로 만든 객체·배열·함수를 prop이나 deps로 넘기면, 값이 논리적으로 같아도 리액트는 "바뀌었다"고 판단해 최적화가 전부 무너집니다.

**📖 핵심 개념**

🎯 **비유**: 참조 비교는 "같은 **집 주소**인지"만 봅니다. 내부 가구가 똑같아도 주소(참조)가 다르면 다른 집으로 취급합니다.

```jsx
// ❌ 매 렌더마다 새 객체/함수 → memo 무력화
<Child style={{ color: "red" }} onClick={() => doSomething()} />

// ✅ 참조 고정
const style = useMemo(() => ({ color: "red" }), []);
const onClick = useCallback(() => doSomething(), []);
<Child style={style} onClick={onClick} />
```

📌 이 원리를 알면 자연히 이해되는 것들:
- state의 배열/객체는 **불변성**을 지켜 새 참조로 교체해야 리렌더가 일어난다(D1).
- 반대로 최적화 대상 prop은 **참조를 안정**시켜야 리렌더가 안 일어난다.
- 즉 "언제는 새 참조가 필요하고, 언제는 고정이 필요한지"를 구분하는 게 핵심 감각입니다.

**🔥 예상 꼬리질문**
- Q. `Object.is`와 `===`의 차이는? → A. 대부분 같지만 `Object.is(NaN, NaN)`은 `true`, `Object.is(+0, -0)`은 `false`라는 점이 다릅니다. 리액트는 `Object.is`를 사용합니다.
- Q. 깊은 비교를 쓰면 안 되나요? → A. 매 렌더마다 깊은 비교하면 그 비용이 리렌더 비용보다 클 수 있어 기본은 얕은 비교입니다.

<details><summary>📝 한 줄 요약</summary>리액트 최적화는 참조(`Object.is`) 비교 기반. 새 객체·함수는 매번 다른 참조 → 필요할 때만 참조를 고정하는 감각이 핵심.</details>

---

## D6. 왜 모든 곳에 `memo`를 붙이면 안 되나요? 🟡

**💬 30초 답변**
> 메모이제이션은 공짜가 아니기 때문입니다. `React.memo`는 매 렌더마다 props를 비교하고, `useMemo`/`useCallback`은 의존성 비교와 캐시 저장·조회 비용이 듭니다. 대부분의 리렌더는 원래 매우 빨라서, 오히려 비교 비용이 더 큰 경우가 많습니다. 또 코드가 복잡해지고 의존성 배열 관리 실수(stale closure, 버그)를 유발합니다. 그래서 "일단 다 붙인다"가 아니라 **프로파일러로 실제 병목을 측정한 뒤** 필요한 곳에만 적용하는 게 원칙입니다.

**📖 핵심 개념**

📌 최적화 판단 순서:
1. React DevTools **Profiler**로 무엇이 얼마나 자주/오래 렌더되는지 측정.
2. 병목이 확인되면 원인 분류: 렌더 횟수가 많은가 / 렌더 1회가 무거운가.
3. 구조로 먼저 해결(D7) → 그래도 안 되면 `memo`/`useMemo`/`useCallback` 투입.
4. 다시 측정해 효과 확인.

> 💡 "성급한 최적화는 만악의 근원"(Donald Knuth). 읽기 쉬운 코드 > 미시 최적화. 실제 사용자 체감 지표(INP 등)를 기준으로 판단하세요.

**🔥 예상 꼬리질문**
- Q. 그럼 언제 확실히 필요한가요? → A. (1) 큰 리스트의 아이템 컴포넌트, (2) 무거운 파생 계산, (3) memo 자식에 넘기는 콜백/객체, (4) 리렌더가 눈에 띄게 폭증하는 경우.
- Q. 측정 없이 붙이면 안 되나요? → A. 습관적 남용은 코드 복잡도만 올리고 이득이 없을 때가 많습니다. 측정이 기준입니다.

<details><summary>📝 한 줄 요약</summary>메모이제이션도 비용·복잡도가 있음. 프로파일러로 병목 측정 후, 구조 개선을 먼저 시도하고 필요한 곳에만 적용.</details>

---

## D7. 메모이제이션 없이 구조로 해결하는 법 🟡

**💬 30초 답변**
> 리렌더 문제의 상당수는 훅을 추가하지 않고 **컴포넌트 구조**만 바꿔 해결할 수 있습니다. 대표적으로 ① **상태를 쓰는 곳 가까이로 내리기**(state colocation), ② **children/컴포지션으로 비싼 자식을 부모 렌더에서 분리**하기입니다. 이 방법은 의존성 관리 실수도 없고 코드도 더 깔끔합니다.

**📖 핵심 개념**

📌 **① 상태 내리기**: 자주 바뀌는 state를 상위에 두면 그 아래 전부가 리렌더됩니다. state를 실제로 필요한 작은 컴포넌트로 내리면 영향 범위가 좁아집니다.

```jsx
// ❌ input 상태가 App에 있어 무거운 List까지 매 타이핑마다 리렌더
function App() {
  const [text, setText] = useState("");
  return (<><input value={text} onChange={e => setText(e.target.value)} /><HeavyList /></>);
}

// ✅ 입력 상태를 전용 컴포넌트로 격리 → HeavyList는 영향 없음
function SearchBox() {
  const [text, setText] = useState("");
  return <input value={text} onChange={e => setText(e.target.value)} />;
}
function App() { return (<><SearchBox /><HeavyList /></>); }
```

📌 **② children으로 끌어올리기(lift content up)**: 부모가 state를 가지되 비싼 부분을 `children`으로 받으면, 그 children 엘리먼트는 부모 렌더 시 재생성되지 않아 리렌더를 건너뜁니다.

```jsx
function Wrapper({ children }) {
  const [count, setCount] = useState(0);
  return (<div onClick={() => setCount(c => c + 1)}>{count}{children}</div>);
}
// <Wrapper><HeavyList /></Wrapper> → HeavyList는 count 변경에도 리렌더 X
```

**🔥 예상 꼬리질문**
- Q. 구조 개선과 memo 중 뭘 먼저? → A. 구조가 먼저입니다. 훅 없이 해결되면 유지보수가 훨씬 쉽습니다.
- Q. 전역 상태(Context)에서 리렌더가 넓게 퍼지면? → A. Context를 값 단위로 쪼개거나(분리), 상태관리 라이브러리(zustand 등)의 selector로 구독 범위를 좁힙니다.

<details><summary>📝 한 줄 요약</summary>상태 내리기(colocation)와 children 컴포지션으로 훅 없이 리렌더 범위를 좁히는 것이 1순위 해법.</details>

---

## D8. React 19의 React Compiler는 이 이야기를 어떻게 바꾸나요? 🟢

**💬 30초 답변**
> React Compiler(옛 이름 React Forget)는 빌드 타임에 코드를 분석해 **필요한 메모이제이션을 자동으로 삽입**해 주는 컴파일러입니다. 지금까지 개발자가 손으로 붙이던 `useMemo`/`useCallback`/`React.memo`를 상당 부분 컴파일러가 대신 처리하는 것을 목표로 합니다. 다만 컴파일러가 안전하게 최적화하려면 컴포넌트가 **리액트 규칙(순수성, 불변성, 훅 규칙)**을 지켜야 하므로, 앞서 배운 원리(참조 동일성·불변성·순수 렌더)는 여전히 중요합니다.

**📖 핵심 개념**

📌 핵심 아이디어: "왜 우리가 수동으로 메모를 붙여야 하지? 컴파일러가 뭐가 언제 바뀌는지 알 수 있잖아" → 자동 메모이제이션.
📌 전제 조건: 렌더는 순수해야 하고, props/state를 변이하지 않아야 하며, 훅 규칙(조건문 안에서 훅 호출 금지 등)을 지켜야 함. `eslint-plugin-react-hooks`가 이를 강제.
📌 실무 태도: 컴파일러가 도입돼도 "리렌더가 왜 일어나는지"를 이해하는 것은 디버깅·설계에 필수. 자동화는 수동 최적화를 줄여줄 뿐, 원리 이해를 대체하지 않음.

> 💡 면접에서: "React Compiler가 나오면 useMemo/useCallback 몰라도 되나요?"라는 질문에는 → "수동 작업은 줄지만, 컴파일러가 최적화할 수 있도록 순수성·불변성을 지키는 것이 오히려 더 중요해진다"고 답하면 좋습니다.

**🔥 예상 꼬리질문**
- Q. 지금 당장 실무에 써도 되나요? → A. 점진적으로 도입 가능하지만 프로젝트/버전에 따라 안정성·호환성을 확인해야 합니다. 최신 상태는 공식 문서를 확인하세요.
- Q. 컴파일러가 있으면 `React.memo`는 사라지나요? → A. 필요성이 크게 줄어드는 방향이지만, 원리와 예외 케이스 이해는 여전히 요구됩니다.

<details><summary>📝 한 줄 요약</summary>React Compiler는 메모이제이션을 자동화하지만, 그 전제인 순수성·불변성·훅 규칙 이해는 오히려 더 중요해진다.</details>

---

## ✅ 오늘의 핵심 정리

- 리렌더 트리거는 **state 변경·부모 렌더·Context 변경**. 렌더(함수 재호출)와 DOM 반영(diff 후 커밋)은 다르다.
- 부모가 렌더되면 자식은 기본적으로 **전부** 재호출된다. 막으려면 `React.memo` 또는 구조 개선.
- 리액트 최적화는 **참조 동일성(`Object.is`)** 위에서 돈다 → 객체·함수 참조를 상황에 맞게 "고정" 또는 "교체"하는 감각이 핵심.
- `useMemo`=값, `useCallback`=함수 참조 캐싱. **측정(Profiler) 후 필요한 곳에만** 적용.
- 훅보다 **구조(상태 내리기·children 컴포지션)**를 먼저. React Compiler는 이를 자동화하지만 원리 이해는 여전히 필수.
