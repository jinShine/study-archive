# 브라우저 렌더링 & 성능 심화 (Critical Rendering Path · 리플로우/리페인트 · Core Web Vitals)

> 주제: 브라우저가 HTML/CSS/JS를 받아 픽셀로 그리는 전 과정(Critical Rendering Path)을 이해하고, 리플로우/리페인트/합성의 차이와 성능 비용을 설명하며, Core Web Vitals(LCP·INP·CLS)를 실무 최적화와 연결한다. React 리렌더링(가상 DOM 층)과 달리 이 문서는 **브라우저(실제 DOM·엔진) 층**을 다룬다.
> 출처: 일일 심화 자료 (기존 5.common.md Q87·Q93·Q99 "렌더링 과정·Core Web Vitals"의 심화 통합편 · daily 미다룸 주제)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-브라우저는-html을-받아-화면에-어떻게-그리나요-critical-rendering-path) | 브라우저 렌더링 전체 흐름(CRP) | 🔴 |
| [D2](#d2-dom과-cssom-render-tree는-어떻게-다른가요) | DOM · CSSOM · Render Tree | 🔴 |
| [D3](#d3-리플로우reflow와-리페인트repaint의-차이가-뭔가요) | 리플로우 vs 리페인트 | 🔴 |
| [D4](#d4-레이아웃-스래싱layout-thrashing이-뭔가요) | 레이아웃 스래싱 · 강제 동기 레이아웃 | 🟡 |
| [D5](#d5-css와-js는-렌더링을-막나요-render-blocking) | 렌더 블로킹 · defer/async | 🔴 |
| [D6](#d6-transform과-opacity-애니메이션이-왜-빠른가요-합성-레이어) | 합성(compositing) · GPU 레이어 | 🟡 |
| [D7](#d7-core-web-vitals가-뭔가요-lcp-inp-cls) | Core Web Vitals (LCP·INP·CLS) | 🔴 |
| [D8](#d8-실전-로딩-렌더링-성능-최적화-체크리스트) | 실전 최적화 체크리스트 | 🟡 |

---

## D1. 브라우저는 HTML을 받아 화면에 어떻게 그리나요? (Critical Rendering Path) 🔴

**💬 30초 답변**
> 브라우저는 HTML을 파싱해 **DOM**을, CSS를 파싱해 **CSSOM**을 만들고, 둘을 합쳐 화면에 보일 요소만 담은 **렌더 트리(Render Tree)**를 만듭니다. 이후 각 요소의 위치·크기를 계산하는 **레이아웃(Layout, = Reflow)**, 픽셀 색을 채우는 **페인트(Paint)**, 여러 레이어를 합쳐 최종 화면을 만드는 **합성(Composite)** 단계를 거칩니다. 이 일련의 과정을 **Critical Rendering Path(CRP)** 라고 하고, 이걸 짧게 만드는 게 초기 렌더링 성능 최적화의 핵심입니다.

**📖 핵심 개념**

🎯 **비유**: 집을 짓는 과정과 같습니다. **DOM**은 설계 도면(구조), **CSSOM**은 인테리어 사양서(색·크기), **렌더 트리**는 "실제로 지을 방 목록"(창고=`display:none`은 제외), **레이아웃**은 각 방의 정확한 치수·위치를 재는 것, **페인트**는 벽에 페인트칠, **합성**은 여러 층(레이어)을 쌓아 완성된 건물을 보여주는 것입니다.

📌 **CRP 5단계 (순서 암기 필수)**

```
HTML ──파싱──▶ DOM ┐
                   ├─▶ Render Tree ─▶ Layout(Reflow) ─▶ Paint ─▶ Composite ─▶ 화면
CSS  ──파싱──▶ CSSOM ┘
```

1. **DOM 생성**: HTML 바이트 → 토큰 → 노드 → 트리. HTML 파싱은 스트리밍(받는 대로 진행)이지만 `<script>`를 만나면 멈춘다(D5).
2. **CSSOM 생성**: CSS 바이트 → 트리. CSS는 **렌더 블로킹 리소스** — CSSOM이 완성돼야 렌더 트리를 만들 수 있다.
3. **Render Tree**: DOM + CSSOM 결합. **화면에 그려질 노드만** 포함(뒤 D2).
4. **Layout(Reflow)**: 각 노드의 기하학적 정보(위치·크기)를 뷰포트 기준으로 계산. `%`, `em`, `vw` 등 상대 단위가 실제 픽셀로 확정된다.
5. **Paint → Composite**: 실제 픽셀을 채우고(색·그림자·텍스트), 레이어들을 GPU에서 합성해 화면에 출력.

> 💡 **면접 포인트**: "왜 CSS는 `<head>`에, JS는 `<body>` 끝(또는 `defer`)에 두나요?" → CSS는 CSSOM이 없으면 렌더가 막히니 **최대한 빨리** 받게 위로, JS는 파싱을 막으니(D5) **최대한 나중에** 실행되게 아래로.

**🔥 예상 꼬리질문**
- Q. `visibility:hidden`과 `display:none`은 렌더 트리에서 어떻게 다른가요? → A. `display:none`은 렌더 트리에서 **제외**(공간 차지 X). `visibility:hidden`은 렌더 트리에 **포함**되지만 페인트만 안 됨(공간은 차지). 그래서 후자는 여전히 레이아웃 비용이 있다.
- Q. HTML 파싱과 CSS 파싱은 병렬인가요? → A. 브라우저는 리소스를 병렬로 **다운로드**하지만, 렌더 트리 구성은 DOM과 CSSOM이 **둘 다** 준비돼야 진행된다. 그래서 큰 CSS 하나가 첫 렌더를 늦출 수 있다.

<details><summary>📝 한 줄 요약</summary>DOM+CSSOM→Render Tree→Layout(Reflow)→Paint→Composite. 이 경로(CRP)를 짧게 만드는 게 초기 렌더 성능의 핵심. CSS는 렌더 블로킹.</details>

---

## D2. DOM과 CSSOM, Render Tree는 어떻게 다른가요? 🔴

**💬 30초 답변**
> **DOM**은 HTML 구조를 객체 트리로 표현한 것, **CSSOM**은 CSS 규칙을 트리로 표현한 것입니다. 이 둘을 합쳐 **실제로 화면에 그려질 요소만** 담은 것이 **렌더 트리**입니다. DOM에는 있지만 렌더 트리엔 없는 대표 예가 `<head>`, `<script>`, `display:none` 요소입니다.

**📖 핵심 개념**

📌 **세 트리의 관계**

| 구분 | 담는 것 | 예외/특징 |
|------|---------|-----------|
| **DOM** | 모든 HTML 요소·텍스트 노드 | `<head>`, `<meta>`, `display:none`도 **포함** |
| **CSSOM** | 모든 CSS 규칙(상속·계산된 값 포함) | `*{}` 같은 전역 규칙도 계산 |
| **Render Tree** | 화면에 **보이는** 요소만 | `<head>`·`<script>`·`display:none` **제외**, 하지만 `visibility:hidden`은 포함 |

🎯 **비유**: DOM은 "회사 전체 임직원 명부"(퇴사자·휴직자 포함), 렌더 트리는 "오늘 실제로 출근해 자리에 앉는 사람 명단"입니다. 재택(`display:none`)은 명부엔 있어도 자리 배치(레이아웃)엔 안 들어갑니다.

> 💡 **CSSOM은 왜 렌더 블로킹인가?** CSS는 나중에 오는 규칙이 앞 규칙을 덮어쓸 수 있어(cascade), 브라우저는 **모든 CSS를 다 받기 전엔** 요소의 최종 스타일을 확정할 수 없다. 그래서 CSSOM이 완성될 때까지 렌더링을 미룬다.

**🔥 예상 꼬리질문**
- Q. 가상 DOM(Virtual DOM)과 이 DOM은 같은 건가요? → A. 다릅니다. 여기서 말하는 DOM은 **브라우저가 실제로 관리하는** 문서 객체 모델. 가상 DOM은 React 같은 라이브러리가 메모리에 두는 **JS 객체 복제본**으로, 실제 DOM 조작을 최소화하려는 최적화 도구다.
- Q. `document.body.appendChild()`로 요소를 넣으면 어느 단계가 다시 도나요? → A. DOM 변경 → 렌더 트리 갱신 → 레이아웃(Reflow) → 페인트 → 합성. 기하학적 변화가 없으면 레이아웃을 건너뛰고 페인트만 할 수도 있다(D3).

<details><summary>📝 한 줄 요약</summary>DOM(전체 HTML)+CSSOM(전체 CSS)→Render Tree(보이는 것만). display:none은 렌더 트리 제외, visibility:hidden은 포함.</details>

---

## D3. 리플로우(Reflow)와 리페인트(Repaint)의 차이가 뭔가요? 🔴

**💬 30초 답변**
> **리플로우(= Layout)**는 요소의 **크기·위치 같은 기하학적 정보**가 바뀌어 브라우저가 레이아웃을 다시 계산하는 것이고, **리페인트(Repaint)**는 위치는 그대로인데 **색·배경·그림자 같은 시각적 속성**만 바뀌어 다시 칠하는 것입니다. 리플로우는 페인트를 반드시 동반하지만, 리페인트는 리플로우 없이 일어날 수 있습니다. **리플로우가 훨씬 비쌉니다.**

**📖 핵심 개념**

🎯 **비유**: 방에서 **가구를 옮기면**(리플로우) 다른 가구 위치까지 다 다시 배치하고 청소도 새로 해야 한다. **벽지 색만 바꾸면**(리페인트) 위치는 그대로라 칠만 다시 하면 된다.

📌 **무엇이 무엇을 유발하나**

| 트리거 속성 예시 | 발생 단계 | 비용 |
|------|------|:---:|
| `width`, `height`, `padding`, `margin`, `top/left`, `font-size`, DOM 추가/삭제, `offsetHeight` **읽기** | **Reflow → Paint → Composite** | 💰💰💰 |
| `color`, `background-color`, `visibility`, `box-shadow`, `outline` | **Paint → Composite** (레이아웃 생략) | 💰💰 |
| `transform`, `opacity` (합성 레이어일 때) | **Composite만** | 💰 |

```js
// ❌ 나쁨: 레이아웃(리플로우)을 유발하는 속성 애니메이션
el.style.left = x + 'px';   // top/left는 리플로우 발생 → 매 프레임 레이아웃 재계산

// ✅ 좋음: 합성만으로 처리되는 속성 사용
el.style.transform = `translateX(${x}px)`;  // GPU 합성, 리플로우/리페인트 없음
```

> 💡 **핵심 규칙**: 애니메이션은 가능하면 `transform`과 `opacity`로만. 이 둘은 (합성 레이어로 승격되면) 레이아웃·페인트를 건너뛰고 **합성 단계에서만** 처리돼 60fps를 지키기 쉽다(D6).

📌 **리플로우를 유발하는 대표적 함정 — "읽기"도 리플로우를 부른다**
`offsetTop`, `offsetHeight`, `scrollTop`, `getBoundingClientRect()`, `getComputedStyle()` 등을 읽으면, 브라우저는 최신 값을 주기 위해 **대기 중이던 레이아웃을 강제로 지금 계산**한다(강제 동기 레이아웃 → D4).

**🔥 예상 꼬리질문**
- Q. 리플로우가 리페인트보다 비싼 이유는? → A. 리플로우는 한 요소만 바뀌어도 **부모·자식·형제**의 위치에 연쇄 영향을 줄 수 있어 트리의 상당 부분을 다시 계산한다. 리페인트는 해당 영역만 다시 칠하면 된다.
- Q. `display:none`으로 숨겼다가 여러 번 조작 후 다시 보이면? → A. 숨기는 순간 렌더 트리에서 빠지므로 그 사이 조작은 리플로우를 안 일으킨다. 조작이 많을 때 유용한 최적화 패턴(단, 숨기고/보이는 자체가 각각 1회 리플로우).

<details><summary>📝 한 줄 요약</summary>리플로우=기하(크기·위치) 재계산(비쌈, 페인트 동반), 리페인트=색만 다시 칠(중간). transform/opacity는 합성만(쌈). 레이아웃 속성 읽기도 리플로우 유발.</details>

---

## D4. 레이아웃 스래싱(Layout Thrashing)이 뭔가요? 🟡

**💬 30초 답변**
> 반복문 안에서 **DOM 스타일 쓰기 → 레이아웃 값 읽기**를 번갈아 하면, 브라우저가 매번 최신 값을 주기 위해 **레이아웃을 강제로 즉시 재계산**하게 됩니다. 이게 프레임마다 수십 번 일어나는 게 레이아웃 스래싱(= 강제 동기 레이아웃, Forced Synchronous Layout)이고, 성능이 급격히 나빠집니다. 해결책은 **읽기와 쓰기를 분리(batching)** 하는 것입니다.

**📖 핵심 개념**

🎯 **비유**: 브라우저는 원래 스타일 변경을 **모아뒀다가 한 번에** 레이아웃을 계산하려 한다(게으른 최적화). 그런데 중간에 "지금 높이 얼마야?" 하고 물으면, 정확히 답하려고 하던 일을 멈추고 **당장 전부 계산**해버린다. 쓰고-묻고-쓰고-묻고를 반복하면 이 강제 계산이 매번 터진다.

```js
// ❌ 레이아웃 스래싱: 쓰기 후 바로 읽기가 반복됨
boxes.forEach(box => {
  box.style.width = box.offsetWidth + 10 + 'px'; // 읽기(offsetWidth)+쓰기 → 매 반복 강제 레이아웃
});

// ✅ 배칭: 먼저 전부 읽고(READ), 그다음 전부 쓴다(WRITE)
const widths = boxes.map(box => box.offsetWidth);   // READ phase
boxes.forEach((box, i) => {
  box.style.width = widths[i] + 10 + 'px';          // WRITE phase
});
```

📌 **실무 처방**
- **읽기(measure) 먼저, 쓰기(mutate) 나중에** — read/write 배칭.
- `requestAnimationFrame`으로 DOM 쓰기를 다음 프레임 직전에 몰아서.
- 라이브러리 `FastDOM` 같은 스케줄러가 이 read/write 분리를 자동화.
- 큰 변경은 `DocumentFragment`에 모아 한 번에 삽입.

**🔥 예상 꼬리질문**
- Q. `requestAnimationFrame`이 스래싱 해결에 어떻게 도움이 되나요? → A. rAF 콜백은 다음 리페인트 직전에 모여 실행되므로, 여기서 쓰기를 몰면 브라우저가 한 프레임에 한 번만 레이아웃을 계산한다.
- Q. 어떤 프로퍼티 접근이 강제 레이아웃을 유발하는지 어떻게 아나요? → A. 크기·위치를 반환하는 것들: `offsetWidth/Height/Top/Left`, `clientWidth...`, `scrollTop/Width`, `getBoundingClientRect()`, `getComputedStyle()`, `focus()` 등. Chrome DevTools Performance 패널에서 "Forced reflow" 경고로 확인 가능.

<details><summary>📝 한 줄 요약</summary>쓰기↔읽기 반복이 강제 동기 레이아웃을 유발(스래싱). 해결=읽기 먼저/쓰기 나중 배칭 + requestAnimationFrame.</details>

---

## D5. CSS와 JS는 렌더링을 막나요? (Render Blocking) 🔴

**💬 30초 답변**
> **CSS는 렌더 블로킹**입니다. CSSOM이 완성돼야 렌더 트리를 만들 수 있어, CSS를 다 받기 전엔 화면을 그리지 않습니다. **JS는 파서 블로킹**입니다. 기본 `<script>`는 HTML 파싱을 멈추고 다운로드·실행되며, 심지어 앞선 CSSOM 완성까지 기다립니다(스크립트가 스타일을 읽을 수 있으므로). 그래서 스크립트에는 `defer`나 `async`를 붙여 파싱을 막지 않게 합니다.

**📖 핵심 개념**

📌 **`<script>` 로딩 방식 3가지 (면접 단골 비교)**

| 방식 | 다운로드 | 실행 시점 | HTML 파싱 | 실행 순서 |
|------|:---:|------|:---:|:---:|
| 기본 `<script>` | 파싱 멈추고 즉시 | 다운로드 직후 즉시 | **막음** | 문서 순서 |
| `async` | 파싱과 **병렬** | **다운로드되는 대로** 즉시(파싱 잠깐 멈춤) | 실행 순간만 막음 | **먼저 받는 것부터**(순서 보장 X) |
| `defer` | 파싱과 **병렬** | **HTML 파싱 완전히 끝난 후**, DOMContentLoaded 직전 | **안 막음** | **문서 순서 보장** |

```html
<!-- 파서 블로킹: 여기서 파싱이 멈춘다 -->
<script src="app.js"></script>

<!-- 병렬 다운로드 + 파싱 끝난 뒤 순서대로 실행 (권장 기본값) -->
<script src="app.js" defer></script>

<!-- 병렬 다운로드 + 받는 즉시 실행. 서로 독립적인 분석/광고 스크립트에 적합 -->
<script src="analytics.js" async></script>
```

🎯 **비유**: 기본 스크립트는 "이 서류 처리될 때까지 줄 서서 대기". `async`는 "먼저 온 택배부터 바로 개봉"(순서 뒤죽박죽 가능). `defer`는 "모든 택배를 받아두고, 업무 끝나면 접수 순서대로 개봉".

> 💡 **실무 기본값**: DOM에 의존하는 앱 스크립트는 `defer`(순서 보장 + 파싱 안 막음). 서로·DOM과 독립적인 애널리틱스는 `async`. `<head>`에 넣어도 `defer`면 안전하다.

📌 **렌더 블로킹 CSS 줄이기**
- **Critical CSS**: 첫 화면에 필요한 최소 CSS만 인라인(`<style>`)으로 넣고, 나머지는 나중에 로드.
- 조건부 CSS는 `media` 속성으로: `<link rel="stylesheet" href="print.css" media="print">` → 인쇄 시에만 블로킹.
- 사용하지 않는 CSS 제거(PurgeCSS 등)로 CSSOM 구성 시간 단축.

**🔥 예상 꼬리질문**
- Q. `async`와 `defer`를 둘 다 쓰면? → A. `defer`는 무시되고 `async`처럼 동작한다(모던 브라우저). 보통 하나만 쓴다.
- Q. `defer` 스크립트와 `DOMContentLoaded` 순서는? → A. 모든 `defer` 스크립트가 문서 순서대로 실행된 **직후** DOMContentLoaded가 발생한다. 그래서 defer 스크립트 안에서 DOM은 이미 완성돼 있다.
- Q. 인라인 `<script>`에도 async/defer가 먹나요? → A. 아니오. `src`가 있는 외부 스크립트에만 적용된다.

<details><summary>📝 한 줄 요약</summary>CSS=렌더 블로킹(CSSOM 완성까지 렌더 대기), JS 기본=파서 블로킹. defer=파싱 후 순서대로(권장), async=받는 즉시 순서 무관.</details>

---

## D6. `transform`과 `opacity` 애니메이션이 왜 빠른가요? (합성 레이어) 🟡

**💬 30초 답변**
> 브라우저는 페이지를 여러 개의 **레이어(layer)** 로 나눠 GPU에서 겹쳐 그릴(합성, composite) 수 있습니다. `transform`과 `opacity`는 요소가 **자기 레이어**를 가지면 **레이아웃·페인트를 건너뛰고 합성 단계에서만** 처리돼 GPU가 매우 빠르게 처리합니다. 반면 `left`/`top`/`width` 애니메이션은 매 프레임 리플로우+리페인트를 유발해 프레임 드랍이 생깁니다.

**📖 핵심 개념**

📌 **왜 빠른가**: 레이아웃·페인트는 CPU가 하는 비싼 작업이고, 합성은 이미 그려진 레이어 비트맵을 GPU가 이동·투명도 조절·확대만 하면 된다. 그래서 `transform`/`opacity`는 메인 스레드를 거의 안 쓰고 60fps를 지킨다.

```css
/* ✅ 합성만으로 처리 → 부드러움 */
.card { transition: transform 0.3s, opacity 0.3s; }
.card:hover { transform: translateY(-8px) scale(1.02); opacity: 0.9; }

/* ❌ 매 프레임 리플로우 → 버벅임 */
.card:hover { top: -8px; width: 102%; }
```

📌 **레이어 승격(compositing layer promotion)**
요소를 별도 레이어로 올리는 힌트:
- `will-change: transform;` (변할 것을 미리 알림 — 가장 명시적)
- `transform: translateZ(0)` / `translate3d(0,0,0)` (구식 "GPU 해킹")
- `opacity`, `position: fixed`, `<video>`, `<canvas>` 등도 레이어를 만든다.

> ⚠️ **과용 금지**: 레이어마다 GPU 메모리를 쓴다. `will-change`를 모든 요소에 남발하면 오히려 메모리 폭증·성능 저하. **실제 애니메이션 직전에만** 켜고, 끝나면 제거하는 게 정석.

🎯 **비유**: 애니메이션을 종이(레이어) 위에 그려 **투명 필름처럼 겹쳐** 놓았다고 보면 된다. 카드가 움직일 때 전체 배경을 다시 그리지 않고, 그 필름 한 장만 슥 옮기면 된다.

**🔥 예상 꼬리질문**
- Q. `will-change`를 항상 켜두면 되지 않나요? → A. 안 된다. 브라우저는 `will-change` 요소마다 레이어·메모리를 미리 잡아두므로 남발하면 메모리 낭비와 역효과. 짧은 상호작용 직전 토글 권장.
- Q. `transform`은 정말 리페인트가 전혀 없나요? → A. 요소가 이미 합성 레이어라면 합성만으로 처리된다. 다만 레이어 승격 자체나 내부 콘텐츠 변화가 있으면 페인트가 필요할 수 있다.

<details><summary>📝 한 줄 요약</summary>transform/opacity는 합성 레이어에서 GPU가 처리 → 리플로우/리페인트 생략, 60fps. left/top/width 애니메이션은 리플로우 유발. will-change는 아껴 쓰기.</details>

---

## D7. Core Web Vitals가 뭔가요? (LCP · INP · CLS) 🔴

**💬 30초 답변**
> Core Web Vitals는 구글이 정한 **사용자 체감 성능 3대 지표**로, 로딩(**LCP**), 반응성(**INP**), 시각적 안정성(**CLS**)을 측정합니다. 2024년부터 반응성 지표가 기존 **FID에서 INP로 교체**됐습니다. 검색 랭킹에도 영향을 주는, 실무·면접 모두 중요한 지표입니다.

**📖 핵심 개념**

📌 **3대 지표와 "좋음(Good)" 기준**

| 지표 | 무엇을 재나 | Good | Needs Improvement | Poor |
|------|-------------|:---:|:---:|:---:|
| **LCP** (Largest Contentful Paint) | 가장 큰 콘텐츠가 그려지는 시점 = 로딩 체감 속도 | ≤ 2.5s | 2.5–4s | > 4s |
| **INP** (Interaction to Next Paint) | 상호작용(클릭/입력) 후 화면 반영까지 지연 = 반응성 | ≤ 200ms | 200–500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | 예기치 않은 레이아웃 이동 누적량 = 시각적 안정성 | ≤ 0.1 | 0.1–0.25 | > 0.25 |

> 💡 **2024 변경 필수 암기**: 예전 반응성 지표 **FID(First Input Delay)** 는 "첫 입력의 **지연 시작**만" 측정해 한계가 있었다. **INP**는 페이지 생애 **모든 상호작용**의 응답 지연을 보고 그중 대표값을 취해, 실제 반응성을 훨씬 잘 반영한다. 2024년 3월 INP가 정식 Core Web Vital로 FID를 대체했다.

📌 **지표별 원인과 개선책**

**LCP 개선** (보통 LCP 요소는 히어로 이미지나 큰 텍스트 블록)
- 이미지 최적화: 최신 포맷(WebP/AVIF), 적절한 크기, `fetchpriority="high"`, 프리로드.
- 렌더 블로킹 리소스 줄이기(D5), 서버 응답(TTFB) 단축, CDN.
- 폰트 로딩 최적화(`font-display: swap`).

**INP 개선** (긴 JS 작업이 메인 스레드를 붙잡는 게 주범)
- **긴 작업 쪼개기**: `setTimeout`/`scheduler.yield()`로 메인 스레드 양보.
- 무거운 계산은 **Web Worker**로 오프로드.
- 불필요한 리렌더링 줄이기(React라면 memo/디바운스 — daily 07-16 참고).

**CLS 개선** (콘텐츠가 나중에 로드되며 아래 요소를 밀어내는 게 주범)
- 이미지·비디오·iframe에 **`width`/`height` 명시** 또는 `aspect-ratio`로 공간 예약.
- 폰트 스왑 시 레이아웃 튐 최소화(`size-adjust`, 폰트 프리로드).
- 광고·임베드·동적 배너에 **미리 자리 확보**, 기존 콘텐츠 위에 삽입 금지.

📌 **측정 방법 (Lab vs Field)**
- **Lab(실험실) 데이터**: Lighthouse, DevTools — 재현 가능하지만 실제 사용자와 다를 수 있음. (Lab에선 INP 대신 TBT를 대리 지표로 봄)
- **Field(실사용) 데이터**: `web-vitals` JS 라이브러리, Chrome UX Report(CrUX), PageSpeed Insights — 실제 사용자 기준. **Core Web Vitals 판정은 Field 기준**이며, 보통 **75 백분위수**로 "Good" 여부를 판단한다.

**🔥 예상 꼬리질문**
- Q. FID와 INP의 핵심 차이는? → A. FID는 첫 상호작용의 **입력 지연(처리 시작 전 대기)** 만, INP는 **모든 상호작용**의 **입력 지연+처리+다음 페인트까지 전체**를 본다. INP가 더 엄격하고 대표성이 높다.
- Q. CLS는 어떻게 계산되나요? → A. 각 레이아웃 이동의 **영향 비율(impact fraction) × 이동 거리(distance fraction)** 를 곱해 누적. 사용자 입력 500ms 이내에 발생한 이동은 "예상된 것"으로 보고 제외한다.
- Q. TTFB, FCP는 Core Web Vitals인가요? → A. 아니오. 보조 지표다. FCP(First Contentful Paint)는 첫 콘텐츠, TTFB(Time To First Byte)는 서버 첫 바이트 응답 — LCP를 진단하는 선행 지표로 쓴다.

<details><summary>📝 한 줄 요약</summary>LCP(로딩 ≤2.5s)·INP(반응성 ≤200ms, 2024년 FID 대체)·CLS(안정성 ≤0.1). Field 데이터 75백분위 기준. INP는 이미지/렌더블로킹, INP는 긴 JS 쪼개기, CLS는 공간 예약으로 개선.</details>

---

## D8. 실전 로딩·렌더링 성능 최적화 체크리스트 🟡

**💬 30초 답변**
> 크게 세 갈래로 답합니다. **① 네트워크/로딩** — 리소스 줄이고·빨리 받기, **② CRP 최적화** — 렌더 블로킹 제거, **③ 런타임** — 리플로우/스래싱 억제와 합성 애니메이션. 지표로는 LCP·INP·CLS를 잡습니다.

**📖 핵심 개념**

📌 **① 네트워크 · 로딩**
- 코드 스플리팅 + 지연 로딩(`import()`, `React.lazy`), 트리 셰이킹으로 번들 축소.
- 이미지: WebP/AVIF, 반응형 `srcset`, 뷰포트 밖 이미지 `loading="lazy"`.
- 압축(gzip/Brotli), HTTP/2·3 멀티플렉싱, CDN, 캐싱 헤더(`Cache-Control`, 불변 자산 해시 파일명).
- 핵심 리소스 `preload`/`preconnect`, 폰트 `font-display: swap`.

📌 **② Critical Rendering Path**
- CSS는 `<head>`에서 빨리, Critical CSS 인라인, 미사용 CSS 제거.
- JS는 `defer`(앱)·`async`(독립 스크립트)로 파서 블로킹 제거(D5).
- 초기 번들에서 무거운 서드파티 스크립트 분리·지연.

📌 **③ 런타임 렌더링**
- 애니메이션은 `transform`/`opacity`만(D3·D6), `left/top/width` 금지.
- 레이아웃 값 읽기/쓰기 배칭으로 스래싱 방지(D4), `requestAnimationFrame` 활용.
- 긴 JS 작업 쪼개기·Web Worker로 INP 개선.
- 이미지·임베드에 크기 예약으로 CLS 방지.
- 리스트가 크면 **가상화(react-window 등)** 로 DOM 노드 수 억제.

> 💡 **면접 답변 팁**: "성능 최적화 어떻게 하나요?"에는 **막연히 나열하지 말고** "먼저 Lighthouse/DevTools로 **측정**해서 병목(LCP인지 INP인지 CLS인지)을 찾고, 지표별로 원인을 좁혀 처방한다"는 **측정 → 진단 → 개선** 프로세스로 답하면 훨씬 인상적이다.

**🔥 예상 꼬리질문**
- Q. 이미지 하나로 LCP가 나쁩니다. 뭐부터? → A. 그 이미지가 LCP 요소인지 확인 → 포맷/사이즈 최적화 → `fetchpriority="high"`·preload로 우선 로드 → 렌더 블로킹 CSS/JS 정리 → TTFB(서버/CDN) 확인.
- Q. 번들이 큰데 초기 로딩만 빠르게 하려면? → A. 라우트 기반 코드 스플리팅으로 첫 화면에 필요한 것만 로드하고 나머지는 `import()` 지연 로딩. (daily 빌드·번들링 편에서 확장 예정)

<details><summary>📝 한 줄 요약</summary>측정(Lighthouse/DevTools)→진단(LCP/INP/CLS 중 병목)→개선. 로딩(번들·이미지·캐싱)+CRP(렌더블로킹 제거)+런타임(합성 애니메이션·스래싱 방지).</details>

---

## 🎯 핵심 한 장 요약

- **CRP**: DOM+CSSOM→RenderTree→**Layout(Reflow)**→**Paint**→**Composite**. 이 경로를 짧게 = 초기 렌더 최적화.
- **비용 순서**: Reflow(기하 변화, 최고 비용) > Repaint(색 변화) > Composite(transform/opacity, 최저). 애니메이션은 `transform`/`opacity`로.
- **렌더 블로킹**: CSS는 렌더 블로킹, JS 기본은 파서 블로킹 → `defer`(권장)·`async`.
- **스래싱**: 읽기/쓰기 반복 = 강제 동기 레이아웃. 읽기 먼저·쓰기 나중 배칭.
- **Core Web Vitals**: LCP(≤2.5s)·**INP**(≤200ms, 2024 FID 대체)·CLS(≤0.1), Field 75백분위 기준.

> 관련 일일 자료: `2026-07-16 React 리렌더링`(가상 DOM 층 — 이 문서는 실제 브라우저 층), `2026-07-17 웹 접근성`.
> 참고: 최신 Core Web Vitals 기준·도구 세부는 구글 web.dev 공식 문서에서 재확인 권장(임계값은 안정적으로 유지되어 왔음).
