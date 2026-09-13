# 웹 접근성(a11y)과 ARIA 심화

> 주제: 웹 접근성이란 무엇이며 프론트엔드 개발자가 실무·면접에서 시맨틱 HTML·ARIA·키보드·스크린리더를 어떻게 다뤄야 하는가
> 출처: 일일 심화 자료 (기존 1.html.md Q5 "웹 표준과 웹 접근성"의 심화 보강편)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-웹-접근성이란-무엇이고-왜-프론트엔드가-챙겨야-하나요) | 웹 접근성이란? 왜 챙기나? | 🔴 |
| [D2](#d2-시맨틱-html이-접근성의-90를-해결한다는-말은-무슨-뜻인가요) | 시맨틱 HTML이 90%다 | 🔴 |
| [D3](#d3-aria란-무엇이고-언제-써야-하나요) | ARIA란? 언제 쓰나? | 🔴 |
| [D4](#d4-키보드-접근성은-어떻게-보장하나요) | 키보드 접근성 | 🔴 |
| [D5](#d5-스크린리더는-화면을-어떻게-읽나요-접근성-트리와-대체-텍스트) | 스크린리더 · 접근성 트리 | 🔴 |
| [D6](#d6-폼-접근성은-어떻게-구현하나요) | 폼 접근성 | 🟡 |
| [D7](#d7-색-대비모션터치-타깃의-기준은-무엇인가요-wcag-수치) | 색 대비·모션·터치 타깃 | 🟡 |
| [D8](#d8-reactspa에서-접근성을-어떻게-챙기고-테스트하나요) | React/SPA 접근성 · 테스트 | 🟢 |

---

## D1. 웹 접근성이란 무엇이고, 왜 프론트엔드가 챙겨야 하나요? 🔴

**💬 30초 답변**
> 웹 접근성(a11y)은 **장애 여부·기기·환경에 상관없이 모든 사용자가 웹을 동등하게 이용할 수 있게** 만드는 것입니다. 국제 표준인 **WCAG**가 기준이며, 핵심은 **인식(Perceivable)·운용(Operable)·이해(Understandable)·견고(Robust)** 4원칙(POUR)입니다. 시각·청각·지체·인지 장애 사용자뿐 아니라 키보드만 쓰는 사람, 저사양 기기, SEO에도 이득이라 프론트엔드가 직접 챙겨야 합니다.

**📖 핵심 개념**

🎯 **비유**: 건물의 **경사로(휠체어 램프)** 와 같습니다. 계단만 있으면 일부는 아예 못 들어옵니다. 접근성은 "특별한 소수를 위한 배려"가 아니라, 누구나 마주칠 수 있는 상황(팔 부상, 밝은 햇빛, 소음 환경)을 위한 **보편적 설계(Universal Design)** 입니다.

📌 **WCAG(Web Content Accessibility Guidelines)**
- W3C가 만든 국제 표준. 현재 **WCAG 2.2**가 최신 권고안(2023년 10월 W3C Recommendation)이며, 다음 세대인 **WCAG 3.0**은 아직 초안(Working Draft) 단계입니다.
- 준수 레벨은 **A(최소) → AA(권장·법적 기준) → AAA(최고)**. 실무·공공기관 기준은 보통 **AA**입니다.
- 한국은 「지능정보화 기본법」과 **KWCAG(한국형 웹 콘텐츠 접근성 지침)** 로 공공·일정 규모 웹사이트에 접근성 준수를 법적으로 요구합니다.

📌 **POUR 4원칙**

| 원칙 | 의미 | 예시 |
|------|------|------|
| **Perceivable** (인식) | 콘텐츠를 인지할 수 있어야 | 이미지 `alt`, 자막, 충분한 색 대비 |
| **Operable** (운용) | 조작할 수 있어야 | 키보드만으로 모든 기능 사용 |
| **Understandable** (이해) | 이해할 수 있어야 | 명확한 라벨, 일관된 내비게이션 |
| **Robust** (견고) | 보조기술과 호환돼야 | 유효한 마크업, 올바른 ARIA |

> 💡 면접에서 "접근성 = 장애인용"이라고만 답하면 얕습니다. **일시적/상황적 제약(one-armed, sunlight, noisy)** 과 **SEO·유지보수 이점**까지 엮으면 깊이가 드러납니다.

**🔥 예상 꼬리질문**
- Q. 접근성을 지키면 개발자에게 무슨 이득? → A. 시맨틱 마크업은 검색엔진 크롤러도 잘 이해해 **SEO에 유리**하고, 구조가 명확해 **유지보수성**도 올라갑니다.
- Q. WCAG의 준수 레벨 중 실무 목표는? → A. 일반적으로 **AA**. AAA는 모든 콘텐츠에 적용하기 현실적으로 어렵습니다.
- Q. a11y라는 표기는 뭔가요? → A. accessibility의 a와 y 사이 글자 11개를 줄인 **숫자 약어(numeronym)** 입니다. (i18n=internationalization과 같은 방식)

<details><summary>📝 한 줄 요약</summary>모두가 동등하게 쓰게 만드는 것 = 접근성. WCAG(2.2, 목표 AA)의 POUR(인식·운용·이해·견고) 4원칙이 기준. 장애인뿐 아니라 상황적 제약·SEO에도 이득.</details>

---

## D2. 시맨틱 HTML이 "접근성의 90%를 해결한다"는 말은 무슨 뜻인가요? 🔴

**💬 30초 답변**
> 브라우저는 시맨틱 태그(`<button>`, `<nav>`, `<h1>`, `<label>` 등)에 **역할(role)·상태·키보드 조작·포커스**를 기본으로 내장해 스크린리더에 전달합니다. 그래서 올바른 태그만 써도 접근성 대부분이 공짜로 해결됩니다. 반대로 `<div>`에 `onClick`을 붙여 버튼처럼 쓰면 그 모든 것을 직접 다시 구현해야 하죠. **"ARIA를 쓰기 전에 네이티브 요소부터 써라"** 가 제1원칙입니다.

**📖 핵심 개념**

🎯 **비유**: 시맨틱 태그는 **이미 배선·수도가 다 들어온 집**이고, `<div>`는 **빈 콘크리트 박스**입니다. `<div>`로 버튼을 만들면 전기·수도(포커스·키보드·역할)를 전부 직접 깔아야 합니다.

📌 `<button>` vs `<div onClick>` — 무엇이 공짜로 딸려오나

```html
<!-- ✅ 좋음: 이 한 줄에 전부 내장 -->
<button type="button" onclick="save()">저장</button>
<!--
  - 접근성 트리에 role="button"으로 노출
  - Tab으로 포커스 가능 (tabindex 불필요)
  - Enter / Space 로 클릭 발동
  - disabled 시 조작·포커스 자동 차단
-->

<!-- ❌ 나쁨: 겉모습만 버튼, 나머지는 전부 수동 -->
<div class="btn" onclick="save()">저장</div>
<!--
  - 스크린리더는 그냥 "텍스트"로 읽음 (버튼인지 모름)
  - 키보드 Tab 포커스 불가
  - Enter/Space 동작 없음
-->

<!-- 굳이 div로 만든다면 이 모든 걸 손으로 -->
<div class="btn" role="button" tabindex="0"
     onclick="save()"
     onkeydown="if(e.key==='Enter'||e.key===' ')save()">저장</div>
```

📌 **랜드마크(landmark) 태그**: `<header> <nav> <main> <aside> <footer>` 는 스크린리더 사용자가 **영역 단위로 건너뛰며 탐색**하게 해줍니다. 페이지당 `<main>`은 하나, `<h1>`도 원칙적으로 하나이며 heading은 레벨을 건너뛰지 않게(h1→h2→h3) 씁니다.

📌 **"Skip to content" 링크**: 페이지 최상단에 본문 바로가기 링크를 두면 키보드 사용자가 반복되는 내비게이션을 건너뛸 수 있습니다.

```html
<a href="#main" class="skip-link">본문 바로가기</a>
<!-- 평소엔 화면 밖에 숨기고, 포커스되면 나타나게 CSS 처리 -->
<main id="main"> ... </main>
```

> 💡 실무 팁: `<a>`(이동)와 `<button>`(동작)을 구분하세요. **다른 곳으로 이동 = 링크**, **같은 페이지에서 무언가 실행 = 버튼**. 링크에 `role="button"`을 남발하는 건 안티패턴입니다.

**🔥 예상 꼬리질문**
- Q. `<button>` 대신 `<div>`를 써야만 하는 상황이 온다면? → A. 최소한 `role="button"`, `tabindex="0"`, `keydown`(Enter/Space) 핸들러, `aria-disabled`를 직접 구현해야 합니다. 사실상 재발명이라 지양합니다.
- Q. heading 레벨을 건너뛰면(h1→h4) 왜 문제인가? → A. 스크린리더 사용자는 heading 목록으로 문서 구조를 파악하는데, 레벨이 뛰면 계층 구조가 깨져 문맥을 잃습니다.

<details><summary>📝 한 줄 요약</summary>시맨틱 태그엔 role·포커스·키보드·상태가 내장 → 올바른 태그만 써도 접근성 대부분 해결. div+onClick은 전부 수동 재구현. "네이티브 우선".</details>

---

## D3. ARIA란 무엇이고, 언제 써야 하나요? 🔴

**💬 30초 답변**
> ARIA(Accessible Rich Internet Applications)는 HTML만으로 표현 못 하는 **역할(role)·상태(state)·속성(property)** 을 보조기술에 알려주는 속성 집합입니다. 단, **ARIA는 시각적 동작을 바꾸지 않고 오직 접근성 트리에만 정보를 더할 뿐**입니다. 그래서 "**No ARIA is better than bad ARIA(잘못된 ARIA보단 없는 게 낫다)**"가 대원칙이고, 네이티브 HTML로 안 될 때(커스텀 탭·모달·트리 등)만 최소한으로 씁니다.

**📖 핵심 개념**

🎯 **비유**: ARIA는 **상품에 붙이는 라벨 스티커**입니다. 스티커를 "사과"라고 붙여도 내용물이 바나나면(실제 동작이 없으면) 사용자만 헷갈립니다. 라벨(ARIA)과 실제 동작(JS)은 반드시 일치해야 합니다.

📌 **ARIA 3종류**
- **Role(역할)**: 요소가 무엇인지. `role="dialog"`, `role="tablist"`, `role="alert"`
- **State(상태)**: 변하는 상태. `aria-expanded="true"`, `aria-checked`, `aria-selected`, `aria-disabled`
- **Property(속성)**: 잘 안 변하는 속성. `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`

📌 **ARIA 사용 5가지 규칙(공식 Authoring Practices)** — 면접 단골
1. **네이티브 HTML 요소로 가능하면 ARIA 대신 그걸 써라.** (`<button>` > `role="button"`)
2. 네이티브 요소의 시맨틱을 **바꾸지 마라.** (`<h1 role="button">` ❌)
3. 모든 인터랙티브 ARIA 위젯은 **키보드로 조작 가능해야** 한다.
4. 포커스 가능한 요소에 `role="presentation"`이나 `aria-hidden="true"`를 **쓰지 마라.** (포커스는 되는데 스크린리더엔 안 보이는 유령 요소가 됨)
5. 모든 인터랙티브 요소는 **접근 가능한 이름(accessible name)** 을 가져야 한다.

```html
<!-- 커스텀 아코디언: 상태를 ARIA로 노출 -->
<button aria-expanded="false" aria-controls="panel1">
  자주 묻는 질문
</button>
<div id="panel1" hidden>내용...</div>
<!-- 클릭 시 JS로 aria-expanded 값을 true/false 토글 + hidden 제거 -->

<!-- 아이콘만 있는 버튼: 접근 가능한 이름 부여 -->
<button aria-label="메뉴 닫기">
  <svg aria-hidden="true">...</svg>  <!-- 장식 아이콘은 숨김 -->
</button>
```

📌 `aria-label` vs `aria-labelledby` vs `aria-describedby`
- `aria-label="..."`: **직접 문자열**로 이름 지정 (보이는 텍스트가 없을 때)
- `aria-labelledby="id"`: **다른 요소의 텍스트**를 이름으로 참조 (여러 id 공백 구분 가능)
- `aria-describedby="id"`: 이름이 아니라 **부가 설명**(도움말·에러 메시지)을 연결

> 💡 흔한 실수: `role="button"`만 붙이고 키보드 핸들러를 안 만드는 것. 규칙 3 위반입니다. ARIA는 "말"만 바꿀 뿐 "동작"은 안 만들어 줍니다.

**🔥 예상 꼬리질문**
- Q. `aria-hidden="true"`는 무엇을 하나요? → A. 해당 요소(와 하위)를 접근성 트리에서 제거해 스크린리더가 무시하게 합니다. 장식용 아이콘·중복 텍스트에 쓰되, **포커스 가능한 요소엔 절대 쓰면 안 됩니다.**
- Q. `role="presentation"`(=`none`)은? → A. 요소의 시맨틱을 제거해 그냥 텍스트/컨테이너처럼 취급하게 합니다. 레이아웃용 표 등에 사용.
- Q. `display:none`과 `aria-hidden`, `visibility:hidden`의 차이? → A. `display:none`/`visibility:hidden`은 스크린리더에서도 사라지지만, `aria-hidden`은 **시각적으론 보이되 스크린리더에서만 숨김**입니다.

<details><summary>📝 한 줄 요약</summary>ARIA=role/state/property로 접근성 트리에 정보만 추가(시각·동작 X). 네이티브 우선, 잘못 쓸 바엔 안 쓰기, ARIA 위젯은 반드시 키보드 지원. label/labelledby/describedby 구분.</details>

---

## D4. 키보드 접근성은 어떻게 보장하나요? 🔴

**💬 30초 답변**
> 마우스 없이 **Tab / Shift+Tab / Enter / Space / 방향키 / Esc** 만으로 모든 기능을 쓸 수 있어야 합니다. 핵심은 세 가지 — ① 포커스 순서가 논리적일 것, ② 지금 어디에 포커스됐는지 **눈에 보일 것(focus visible)**, ③ 모달 같은 곳에선 **포커스가 갇히고(focus trap) Esc로 탈출**될 것. `outline:none`으로 포커스 링을 지우는 건 대표적인 접근성 파괴 행위입니다.

**📖 핵심 개념**

📌 **`tabindex` 값의 의미**

| 값 | 의미 |
|----|------|
| `tabindex="0"` | 자연스러운 순서로 **포커스 가능하게** 만듦 (커스텀 위젯에 사용) |
| `tabindex="-1"` | Tab으론 안 가지만 **JS `.focus()`로는 포커스 가능** (모달·에러로 프로그램적 이동) |
| `tabindex="1"` 이상 | 🚫 **안티패턴.** 자연 순서를 무시하고 강제 우선 → 순서 꼬임. 쓰지 말 것 |

📌 **포커스 표시(:focus-visible)**: 마우스 클릭 땐 링을 숨기고 **키보드 이동 때만** 링을 보이려면 `:focus-visible`을 씁니다.

```css
/* ❌ 절대 금지: 키보드 사용자가 위치를 완전히 잃음 */
button:focus { outline: none; }

/* ✅ 키보드로 이동했을 때만 또렷한 포커스 링 */
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

📌 **포커스 트랩(focus trap)**: 모달이 열리면 포커스를 모달 안에 가두고, 닫히면 **원래 트리거 버튼으로 되돌려** 줘야 합니다.

```js
function openModal(modal, trigger) {
  const focusables = modal.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusables[0], last = focusables[focusables.length - 1];
  first.focus();                       // ① 열리면 첫 요소로 포커스 이동

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal(modal, trigger);   // ③ Esc로 닫기
    if (e.key !== 'Tab') return;
    // ② Tab이 모달을 벗어나지 않게 순환
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
function closeModal(modal, trigger) {
  modal.hidden = true;
  trigger.focus();                     // ④ 닫히면 원래 버튼으로 복귀
}
```

> 💡 실무에선 이 로직을 직접 짜기보다 접근성이 검증된 헤드리스 라이브러리(Radix UI, React Aria, Headless UI 등)를 쓰는 편이 안전합니다. 다만 원리를 설명할 수 있어야 면접에서 통합니다.

**🔥 예상 꼬리질문**
- Q. `outline:none`을 왜 지우면 안 되나? → A. 키보드 사용자는 포커스 링이 유일한 위치 단서입니다. 지우려면 반드시 대체 스타일(`:focus-visible`)을 줘야 합니다.
- Q. 모달이 열렸는데 뒤 배경으로 Tab이 새면? → A. 포커스 트랩 미구현입니다. 배경 요소엔 `inert` 속성이나 `aria-hidden`을 적용해 상호작용을 막습니다.
- Q. `tabindex="5"` 같은 양수는 왜 나쁜가? → A. DOM 순서를 무시하고 양수 tabindex끼리 먼저 순회해 예측 불가능한 포커스 순서를 만듭니다.

<details><summary>📝 한 줄 요약</summary>Tab/Enter/Space/Esc만으로 전 기능 사용. tabindex는 0(포커스 가능)·-1(JS 포커스만)만 쓰고 양수 금지. :focus-visible로 포커스 표시 유지, 모달엔 포커스 트랩+Esc+복귀.</details>

---

## D5. 스크린리더는 화면을 어떻게 읽나요? (접근성 트리와 대체 텍스트) 🔴

**💬 30초 답변**
> 스크린리더는 화면 픽셀이 아니라, 브라우저가 DOM에서 만든 **접근성 트리(accessibility tree)** 를 읽습니다. 각 요소의 **이름(name)·역할(role)·상태(state)·값(value)** 을 음성으로 전달하죠. 그래서 이미지엔 `alt`, 아이콘 버튼엔 `aria-label`처럼 **텍스트로 된 대체 정보**가 반드시 있어야 하고, 장식용 요소는 `alt=""`로 비워 무시하게 만듭니다.

**📖 핵심 개념**

🎯 **비유**: 접근성 트리는 화면을 **오디오 가이드용 대본으로 요약한 것**입니다. 대본에 안 적힌(=텍스트 없는 아이콘, 빈 alt 누락) 정보는 사용자에게 전달되지 않습니다.

📌 렌더링 파이프라인 옆에 접근성 트리가 함께 만들어집니다.
```
DOM ──▶ Render Tree (시각적 픽셀)
    └──▶ Accessibility Tree (보조기술용: name/role/state/value)
```

📌 **이미지 `alt` 작성 규칙**
```html
<!-- 정보 전달 이미지: 내용을 설명 -->
<img src="chart.png" alt="2026년 분기별 매출: 1분기 대비 3분기 40% 증가">

<!-- 장식용 이미지: 빈 alt로 스크린리더가 건너뛰게 -->
<img src="divider.png" alt="">

<!-- alt 자체를 생략하면 ❌ → 스크린리더가 파일명("chart.png")을 읽어버림 -->

<!-- 링크/버튼 안의 이미지: 이미지가 곧 링크 목적이므로 alt에 행선지 -->
<a href="/home"><img src="logo.png" alt="홈으로"></a>
```

📌 **접근 가능한 이름(accessible name) 계산 우선순위** (대략)
`aria-labelledby` → `aria-label` → 요소의 콘텐츠(텍스트)/`alt` → `title` 순으로 결정됩니다. 즉 `aria-label`은 눈에 보이는 텍스트를 덮어쓰므로 신중히 씁니다.

📌 **라이브 리전(live region)**: 페이지 일부가 동적으로 바뀔 때(검색 결과 수, 토스트 알림) 스크린리더에 자동 통지하려면 `aria-live`를 씁니다.
```html
<!-- polite: 하던 말 끝나면 알림 (대부분의 상태 변경) -->
<div aria-live="polite">검색 결과 12건</div>
<!-- assertive: 즉시 끊고 알림 (긴급 에러) — 남발 금지 -->
<div role="alert">저장에 실패했습니다.</div>
```

> 💡 시각적으로 숨기되 스크린리더엔 읽히게 하려면 `display:none`이 아니라 **`.sr-only`(visually-hidden) 패턴**을 씁니다. `display:none`은 접근성 트리에서도 사라지기 때문입니다.

```css
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
```

**🔥 예상 꼬리질문**
- Q. 장식용 이미지에 `alt`를 아예 빼면 안 되나? → A. 안 됩니다. `alt` 속성이 없으면 스크린리더가 **파일명·URL을 읽습니다.** 장식이면 `alt=""`(빈 문자열)로 명시적으로 비웁니다.
- Q. `aria-live="assertive"`를 왜 아껴 써야 하나? → A. 사용자가 하던 낭독을 강제로 끊기 때문입니다. 긴급 에러 외엔 `polite`가 원칙입니다.
- Q. 대표적 스크린리더는? → A. 데스크톱 NVDA·JAWS(Windows), VoiceOver(macOS/iOS), 안드로이드 TalkBack.

<details><summary>📝 한 줄 요약</summary>스크린리더는 접근성 트리의 name/role/state/value를 읽음. 정보 이미지=설명 alt, 장식=alt="", 아이콘 버튼=aria-label. 동적 변경은 aria-live, 시각적 숨김은 sr-only(display:none 아님).</details>

---

## D6. 폼 접근성은 어떻게 구현하나요? 🟡

**💬 30초 답변**
> 폼의 핵심은 **모든 입력에 연결된 `<label>`**, **키보드로 조작 가능한 컨트롤**, 그리고 **접근 가능한 에러 처리**입니다. `<label for>`와 `<input id>`를 연결하면 라벨 클릭으로 입력 포커스가 되고 스크린리더가 "이 입력의 이름"을 읽습니다. 에러는 색만으로 표시하지 말고 텍스트 + `aria-invalid` + `aria-describedby`로 알려야 합니다.

**📖 핵심 개념**

```html
<!-- ✅ 라벨 연결 + 에러를 텍스트·ARIA로 -->
<label for="email">이메일</label>
<input
  id="email"
  type="email"
  required
  aria-invalid="true"
  aria-describedby="email-error"
>
<p id="email-error" role="alert">올바른 이메일 형식이 아닙니다.</p>
```

📌 **라벨 연결 3가지 방법**
- 명시적: `<label for="id">` + `<input id="id">` (가장 권장)
- 암묵적: `<label>이메일 <input type="email"></label>` (감싸기)
- 최후수단: `aria-label` / `aria-labelledby` (보이는 라벨을 둘 수 없을 때만)

📌 **placeholder는 라벨이 아니다** — 입력하면 사라지고, 색 대비가 낮으며, 스크린리더가 라벨로 취급하지 않습니다. placeholder는 예시일 뿐 라벨을 대체하면 안 됩니다.

📌 **필드셋으로 그룹화**: 라디오·체크박스 묶음은 `<fieldset>` + `<legend>`로 그룹 이름을 부여합니다.
```html
<fieldset>
  <legend>결제 수단</legend>
  <label><input type="radio" name="pay" value="card"> 카드</label>
  <label><input type="radio" name="pay" value="bank"> 계좌이체</label>
</fieldset>
```

📌 **에러 처리 원칙**
- 색상만으로 오류를 표시하지 말 것(색맹 사용자). 텍스트·아이콘 병행.
- `aria-invalid="true"`로 상태 노출, `aria-describedby`로 에러 메시지 연결.
- 제출 실패 시 **첫 번째 오류 필드로 포커스를 이동**시키면 UX가 크게 좋아집니다.

> 💡 실무 팁: 필수 표시(*)만으로 required를 나타내면 스크린리더가 모릅니다. `required`(또는 `aria-required`) 속성을 함께 넣으세요.

**🔥 예상 꼬리질문**
- Q. placeholder만으로 라벨을 대신하면 왜 안 되나? → A. 입력 시 사라져 맥락을 잃고, 대비가 낮으며, 보조기술이 라벨로 인식하지 않습니다.
- Q. 에러 메시지를 스크린리더가 즉시 읽게 하려면? → A. 메시지 요소에 `role="alert"`(또는 `aria-live="assertive"`)를 부여합니다.

<details><summary>📝 한 줄 요약</summary>모든 입력에 연결된 label(for/id), placeholder는 라벨 아님. 그룹은 fieldset+legend. 에러는 색만 X → 텍스트+aria-invalid+aria-describedby, 제출 실패 시 첫 오류로 포커스.</details>

---

## D7. 색 대비·모션·터치 타깃의 기준은 무엇인가요? (WCAG 수치) 🟡

**💬 30초 답변**
> WCAG AA 기준으로, 일반 텍스트는 배경과 **4.5:1**, 큰 텍스트(18pt/24px 또는 볼드 14pt/18.66px 이상)는 **3:1**의 명암비가 필요합니다. UI 컴포넌트·아이콘 경계도 **3:1**입니다. 또 애니메이션은 `prefers-reduced-motion`을 존중하고, WCAG 2.2에선 터치 타깃 최소 크기(**24×24 CSS px**) 기준도 추가됐습니다.

**📖 핵심 개념**

📌 **색 대비(Contrast) — AA 기준 암기 포인트**

| 대상 | 최소 명암비 |
|------|:---:|
| 일반 텍스트 | **4.5 : 1** |
| 큰 텍스트(24px+ 또는 볼드 18.66px+) | **3 : 1** |
| UI 컴포넌트·그래픽 경계(버튼 테두리, 아이콘) | **3 : 1** |
| (참고) AAA 일반 텍스트 | 7 : 1 |

📌 **색에만 의존하지 말 것(Use of Color)**: "빨간 항목이 오류"처럼 색만으로 정보를 전달하면 색각 이상 사용자가 놓칩니다. 아이콘·텍스트·밑줄 등을 함께 씁니다. (링크는 색 + 밑줄)

📌 **모션 존중** — 전정기관 장애 사용자는 큰 움직임에 어지럼증을 느낄 수 있습니다.
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

📌 **터치 타깃 크기** — 손가락·운동 장애 사용자를 위해 충분히 커야 합니다.
- WCAG 2.2 신설 기준 **2.5.8 Target Size (Minimum, AA)**: 최소 **24×24 CSS px**.
- 더 엄격한 2.5.5(AAA)와 애플/구글 가이드는 **44×44 / 48×48**를 권장. 실무에선 **최소 44px 정도**를 목표로 잡는 편이 안전합니다.

> 💡 대비는 감으로 판단하지 말고 도구로 측정하세요: 브라우저 DevTools의 대비 검사, WebAIM Contrast Checker, Figma 플러그인 등.

**🔥 예상 꼬리질문**
- Q. 큰 텍스트 기준이 왜 3:1로 완화되나? → A. 글자가 크고 굵으면 획이 두꺼워 낮은 대비에서도 판독이 쉽기 때문입니다.
- Q. `prefers-reduced-motion`은 어디서 오는 값인가? → A. OS의 "동작 줄이기" 접근성 설정을 미디어 쿼리로 감지한 것입니다.
- Q. 아이콘 버튼이 시각적으로 20px인데 접근성 기준을 맞추려면? → A. 여백(padding)이나 투명한 히트 영역을 늘려 실제 클릭 가능 영역을 24~44px로 키웁니다.

<details><summary>📝 한 줄 요약</summary>AA 대비: 본문 4.5:1, 큰 글씨·UI경계 3:1. 색만으로 정보 전달 금지. prefers-reduced-motion 존중. WCAG 2.2 터치 타깃 최소 24×24px(실무 44px 권장).</details>

---

## D8. React/SPA에서 접근성을 어떻게 챙기고 테스트하나요? 🟢

**💬 30초 답변**
> SPA는 페이지 이동 시 **실제 새로고침이 없어** 스크린리더가 "화면이 바뀐 걸" 모르는 게 가장 큰 함정입니다. 그래서 라우팅 후 **포커스를 새 페이지의 제목으로 옮기거나 라이브 리전으로 알려야** 합니다. 또 조건부 렌더링으로 나타나는 모달·토스트의 포커스 관리, `htmlFor`/`aria-*` 표기(JSX에선 camelCase)에 유의하고, eslint-plugin-jsx-a11y·axe·Lighthouse로 자동 점검합니다.

**📖 핵심 개념**

📌 **JSX 표기 차이**: React에선 `for` → **`htmlFor`**, `class` → `className`. 단 `aria-*`와 `role`은 **그대로** 씁니다.
```jsx
<label htmlFor="name">이름</label>
<input id="name" aria-describedby="name-hint" />
```

📌 **라우트 변경 시 포커스 관리** — 가장 자주 놓치는 부분
```jsx
function Page({ title }) {
  const h1Ref = useRef(null);
  useEffect(() => {
    document.title = title;         // 탭 제목 갱신
    h1Ref.current?.focus();         // 라우트 진입 시 제목으로 포커스 이동
  }, [title]);
  return <h1 tabIndex={-1} ref={h1Ref}>{title}</h1>;
}
// 또는 aria-live 영역에 "○○ 페이지로 이동" 안내 문구를 갱신
```

📌 **SPA 접근성 체크리스트**
- 라우팅 후 포커스/제목 처리(위) — SPA 최대 함정
- 모달: 포커스 트랩 + Esc + 트리거 복귀(D4), `role="dialog"` `aria-modal="true"` `aria-labelledby`
- 무한 스크롤/비동기 로딩: 로딩 상태를 `aria-live`나 `aria-busy`로 통지
- 동적 목록: 안정적인 `key`(인덱스 남용 금지 — 기존 4장 Q64 참고)
- 아이콘 버튼에 `aria-label`, 장식 SVG에 `aria-hidden="true"`

📌 **테스트 도구(자동 + 수동)**
- **정적/린트**: `eslint-plugin-jsx-a11y` — 코드 작성 단계에서 누락 경고
- **런타임 자동 검사**: `axe-core` / `@axe-core/react`, Lighthouse, Chrome DevTools의 접근성 패널
- **테스트 코드**: Testing Library의 **역할 기반 쿼리**(`getByRole('button', { name: '저장' })`)를 쓰면 접근성 이름이 없으면 테스트가 깨져 자연스럽게 강제됩니다. `jest-axe`로 위반 자동 검출.
- **수동**: 마우스 뽑고 **키보드만으로 사용**해 보기, 실제 **스크린리더(VoiceOver/NVDA)** 로 들어 보기, 200% 확대 확인. 자동 도구는 문제의 **30~40%만** 잡아내므로 수동 점검이 필수입니다.

> 💡 면접 임팩트: "자동 도구(axe/Lighthouse)는 색 대비·속성 누락 같은 기계적 문제만 잡고, **키보드 조작 흐름이나 라벨의 의미 적절성은 사람이 직접 확인해야 한다**"고 말하면 실무 경험이 드러납니다.

**🔥 예상 꼬리질문**
- Q. SPA에서 라우트가 바뀌었는데 스크린리더가 조용한 이유는? → A. 실제 페이지 로드가 없어 DOM만 교체되기 때문입니다. 포커스 이동이나 `aria-live` 안내를 직접 넣어야 합니다.
- Q. Testing Library가 접근성을 강제한다는 게 무슨 뜻? → A. `getByRole`/`getByLabelText`는 접근 가능한 이름·역할이 있어야 요소를 찾습니다. 이름이 없으면 테스트가 실패해 자연히 접근성을 챙기게 됩니다.
- Q. `aria-modal="true"`의 역할은? → A. 모달 뒤 콘텐츠를 보조기술이 무시하게 해, 배경으로 새는 낭독을 막습니다(포커스 트랩과 함께 사용).

<details><summary>📝 한 줄 요약</summary>SPA 최대 함정=라우트 변경 시 포커스/제목 미처리 → useEffect로 포커스 이동+aria-live. JSX는 htmlFor/className(aria-*는 그대로). eslint-jsx-a11y·axe·Lighthouse+역할 기반 쿼리로 자동화, 키보드·스크린리더 수동 점검 필수.</details>

---

## 🎯 이 문서 핵심 5줄 요약

1. **네이티브 시맨틱 HTML이 접근성의 90%** — `<button>`·`<label>`·랜드마크만 제대로 써도 role·포커스·키보드가 공짜.
2. **ARIA는 정보만 추가할 뿐 동작은 안 만든다** — 네이티브 우선, 잘못 쓸 바엔 안 쓰고, ARIA 위젯은 반드시 키보드 지원.
3. **키보드만으로 전 기능 사용** — tabindex 0/-1만, `:focus-visible` 유지, 모달엔 포커스 트랩+Esc+복귀.
4. **스크린리더는 접근성 트리를 읽는다** — 정보 이미지 alt, 장식 alt="", 아이콘 aria-label, 동적 변경 aria-live.
5. **WCAG AA 수치**(본문 대비 4.5:1, 큰글씨·UI 3:1, 터치 24px+) + **자동(axe/Lighthouse)·수동(키보드·스크린리더) 병행 테스트**.
