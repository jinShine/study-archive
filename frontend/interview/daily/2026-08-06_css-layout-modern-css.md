# CSS 레이아웃과 모던 CSS 심화 · 화면을 "감으로"가 아니라 "원리로" 짠다

> 주제: 신입~주니어 프론트엔드가 면접에서 "Flexbox·Grid로 화면 짜봤어요"를 넘어 "요소가 왜 그 위치에 그려지는지(정상 흐름·position·containing block), z-index가 왜 안 먹는지(쌓임 맥락), Flex/Grid의 각 속성이 내부적으로 무엇을 계산하는지, 캐스케이드·특정성·상속을 근거로 스타일 충돌을 진단하고, 2023년 이후 표준이 된 모던 CSS(:has()·컨테이너 쿼리·논리 속성·subgrid)를 실무에 쓸 줄 안다"를 보여주는 심화 — 정상 흐름과 BFC, position과 containing block, stacking context, Flexbox 심화, Grid 심화, 단위(rem·clamp·dvh), 캐스케이드·특정성·@layer, 모던 CSS
> 출처: 일일 심화 자료 (기존 2.css.md Q19 "선택자 우선순위", Q22 "박스 모델", Q25 "z-index", Q28 "중앙 정렬", Q31 "Flexbox vs Grid"를 레이아웃 엔진 동작 원리 관점에서 대폭 확장한 편. 07-20 "브라우저 렌더링 성능"이 "픽셀을 언제 그리나(비용)"였다면, 이 편은 "요소를 어디에·어떤 크기로 배치하나(레이아웃 규칙)"를 다룬다. daily 폴더 최초의 CSS 전용 심화)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [C1](#c1-정상-흐름normal-flow과-bfc블록-서식-문맥란-무엇인가요) | 정상 흐름·display·BFC | 🔴 |
| [C2](#c2-position의-5가지-값과-containing-block기준-상자은-무엇인가요) | position·containing block | 🔴 |
| [C3](#c3-z-index를-분명히-줬는데-안-먹습니다-왜-그런가요) | z-index·쌓임 맥락 | 🔴 |
| [C4](#c4-flexbox를-속성-단위가-아니라-축axis-개념으로-설명해-보세요) | Flexbox 심화 | 🔴 |
| [C5](#c5-grid에서-auto-fill과-auto-fit의-차이는-무엇인가요) | Grid 심화·subgrid | 🔴 |
| [C6](#c6-px-em-rem-vw-와-clamp를-언제-어떻게-쓰나요) | 단위·clamp·dvh | 🟡 |
| [C7](#c7-특정성specificity과-캐스케이드는-어떻게-계산되고-layer는-왜-쓰나요) | 캐스케이드·특정성·@layer | 🔴 |
| [C8](#c8-2023년-이후-표준이-된-모던-css를-실무에-어떻게-쓰나요) | :has()·컨테이너 쿼리·논리 속성 | 🟡 |
| [C9](#c9-반응형-레이아웃을-설계할-때-흔히-빠지는-함정과-원칙은) | 반응형 설계·흔한 함정 | 🔴 |

---

## C1. 정상 흐름(normal flow)과 BFC(블록 서식 문맥)란 무엇인가요? 🔴

**💬 30초 답변**
> 브라우저는 기본적으로 요소를 **정상 흐름(normal flow)**에 따라 배치합니다. 블록 요소는 위→아래로 쌓이며 가로를 꽉 채우고, 인라인 요소는 좌→우로 텍스트처럼 흐릅니다. 이 흐름의 단위가 **BFC(Block Formatting Context, 블록 서식 문맥)**인데, BFC는 "내부 레이아웃이 바깥과 격리되는 독립 영역"입니다. `overflow: hidden`이나 `display: flow-root`로 새 BFC를 만들면 **float 해제·마진 상쇄(margin collapsing) 방지** 같은 고전적 문제를 깔끔히 해결할 수 있습니다. 즉 레이아웃을 이해한다는 건 "이 요소가 어떤 흐름/문맥 안에 있는가"를 읽는 것입니다.

**📖 핵심 개념**

🎯 **비유**: 정상 흐름은 "글자가 공책에 적히는 규칙"입니다. 블록 요소는 **문단**(항상 새 줄, 폭을 꽉 채움), 인라인 요소는 **단어**(같은 줄에 이어 쓰다가 넘치면 줄바꿈)입니다. BFC는 그 문단들을 담는 **독립된 상자(칸막이 친 방)**라서, 방 안에서 무슨 일이 벌어져도(float, 마진) 옆방에 새어 나가지 않습니다.

📌 **display의 두 축(inner/outer)**: 최신 명세에서 `display`는 두 가지를 동시에 지정합니다 — **바깥(outer)**: 이 요소가 흐름에서 어떻게 취급되나(`block`/`inline`), **안쪽(inner)**: 자식들을 어떤 엔진으로 배치하나(`flow`/`flex`/`grid`). 그래서 `display: flex`는 사실 `display: block flex`의 축약이고, "자기 자신은 블록처럼, 자식은 플렉스로"라는 뜻입니다.

📌 **마진 상쇄(margin collapsing)**: 정상 흐름의 수직 방향에서 **인접한 블록의 위/아래 마진은 더해지지 않고 큰 값 하나로 합쳐집니다.** 부모-첫자식 사이에서도 일어나 "왜 부모 밖으로 마진이 새어나오지?" 하는 혼란을 줍니다. BFC를 만들거나(`display: flow-root`), 사이에 패딩/보더를 두거나, Flex/Grid 컨테이너로 바꾸면 상쇄가 사라집니다.

📌 **BFC를 만드는 대표 트리거**: `overflow: hidden/auto`(단, 잘림 부작용), **`display: flow-root`(부작용 없는 정석)**, `display: flex/grid`, `position: absolute/fixed`, `float`가 걸린 요소. Flex/Grid 아이템은 그 자체로 새 서식 문맥이라 내부 마진 상쇄가 일어나지 않습니다.

```css
/* 고전 문제: float 자식 때문에 부모 높이가 0으로 붕괴 */
.parent { /* height가 자식을 감싸지 못함 */ }
.child { float: left; }

/* 해결: 부모에 새 BFC 생성 (clearfix 핵 대신 표준 방법) */
.parent { display: flow-root; } /* float를 안전하게 감쌈, 부작용 없음 */

/* 마진 상쇄 예시 */
.a { margin-bottom: 30px; }
.b { margin-top: 20px; }
/* .a와 .b 사이 간격은 50px이 아니라 max(30,20) = 30px */
```

**🔥 예상 꼬리질문**
- Q. `overflow: hidden`으로 float를 감싸도 되는데 왜 `flow-root`를 권하나요? → A. `overflow: hidden`은 BFC를 만드는 **부작용**으로 clear가 될 뿐, 본래 역할은 "넘치는 내용 자르기"입니다. 그림자·툴팁·드롭다운이 잘리는 사고가 생깁니다. `display: flow-root`는 "새 BFC를 만든다"가 유일한 목적이라 의도가 명확하고 부작용이 없습니다.
- Q. 마진 상쇄는 가로에서도 일어나나요? → A. 아니요. **수직(블록 방향) 마진에서만** 일어납니다. 인라인/수평 마진과 Flex·Grid 아이템 사이에서는 발생하지 않습니다.
- Q. `display: none`과 `visibility: hidden`은 흐름에 어떤 차이를 만드나요? → A. `none`은 요소를 흐름에서 **완전히 제거**해 자리도 사라지지만(리플로우 발생), `hidden`은 **자리는 유지**한 채 보이지만 않게 합니다.

<details><summary>📝 한 줄 요약</summary>
요소는 정상 흐름(블록=문단, 인라인=단어)에 따라 배치되고, BFC는 float·마진 상쇄가 바깥으로 새지 않게 격리하는 독립 영역이며, 부작용 없이 만드는 정석은 `display: flow-root`다.
</details>

---

## C2. position의 5가지 값과 containing block(기준 상자)은 무엇인가요? 🔴

**💬 30초 답변**
> `position`은 요소를 정상 흐름에서 어떻게 떼어내고 무엇을 기준으로 배치하는지를 정합니다. `static`(기본, 흐름 그대로), `relative`(자기 원래 자리를 기준으로 살짝 이동하되 흐름의 자리는 유지), `absolute`(흐름에서 빠져나와 **가장 가까운 position 지정 조상**을 기준으로 배치), `fixed`(뷰포트 기준 고정), `sticky`(스크롤 임계점 전엔 relative처럼, 넘으면 fixed처럼). 핵심은 `absolute`/`fixed`의 기준이 되는 **containing block(기준 상자)**이 무엇이냐인데, 이걸 모르면 "top: 0을 줬는데 엉뚱한 곳에 붙는" 버그를 못 잡습니다.

**📖 핵심 개념**

🎯 **비유**: `position`은 "게시판에 종이를 붙이는 방식"입니다. `static`은 줄 맞춰 순서대로 붙이기, `relative`는 원래 자리에 압정 자국은 남기고 종이만 살짝 옮기기, `absolute`는 종이를 떼어내 **특정 액자(기준 조상)** 안 좌표에 붙이기, `fixed`는 **유리창(뷰포트)**에 붙여 스크롤해도 안 움직이기, `sticky`는 스크롤하다 특정 선에 닿으면 그 자리에 **찰싹 달라붙기**입니다.

📌 **containing block 규칙(가장 중요)**: `absolute` 요소의 기준은 **`position`이 `static`이 아닌 가장 가까운 조상**(relative/absolute/fixed/sticky)입니다. 그런 조상이 없으면 **최초 컨테이닝 블록(≈뷰포트)**이 기준이 됩니다. 그래서 실무 관용구가 "부모에 `position: relative`, 자식에 `position: absolute`"입니다 — 부모를 기준 상자로 지정하는 것이죠.

📌 **transform이 fixed의 기준을 바꾼다(함정)**: 조상 중 하나라도 `transform`, `filter`, `perspective`, `will-change`, `contain: paint` 등이 걸려 있으면 그 조상이 `fixed`의 **새 기준**이 됩니다. "position: fixed인데 뷰포트가 아니라 부모 안에 갇힌다"는 대부분 이 때문입니다.

📌 **sticky의 조건**: `sticky`는 ① `top`/`bottom` 등 임계값이 있어야 하고, ② **스크롤되는 조상 영역 안**에서만 붙습니다. 부모에 `overflow: hidden`이 걸려 있으면 스크롤 컨테이너가 달라져 안 붙는 것처럼 보일 수 있습니다.

```css
/* 관용구: 부모를 기준 상자로 만들고 자식을 그 안에서 절대 배치 */
.card { position: relative; }        /* 기준 상자 */
.card .badge {
  position: absolute;
  top: 8px; right: 8px;              /* .card의 우상단 */
}

/* sticky 헤더 */
.toc { position: sticky; top: 16px; } /* 스크롤 16px 지점에서 고정 */

/* 함정: 조상의 transform이 fixed 모달을 가둔다 */
.animated-wrapper { transform: translateZ(0); } /* GPU 승격 목적 */
.modal { position: fixed; inset: 0; }  /* 뷰포트가 아니라 wrapper 기준이 됨! */
```

**🔥 예상 꼬리질문**
- Q. `absolute` 요소는 흐름에서 빠진다는데, 그럼 크기는 어떻게 정해지나요? → A. 흐름에서 빠져 부모 폭을 자동으로 채우지 않으므로 **내용(shrink-to-fit)만큼** 좁아집니다. `left`와 `right`(또는 `inset: 0`)를 동시에 주면 기준 상자에 맞춰 늘어납니다.
- Q. `inset` 속성은 무엇인가요? → A. `top/right/bottom/left`를 한 번에 쓰는 단축 속성입니다. `inset: 0`은 네 방향 0, `inset: 10px 20px`은 상하 10·좌우 20입니다.
- Q. `fixed`와 `sticky`의 차이를 한 문장으로? → A. `fixed`는 **항상** 뷰포트(또는 변형된 기준)에 고정, `sticky`는 **임계점을 지날 때만** 고정되고 그 전엔 정상 흐름을 따릅니다.

<details><summary>📝 한 줄 요약</summary>
`absolute`/`fixed`의 위치는 "가장 가까운 position 지정 조상"인 containing block을 기준으로 계산되며, 조상의 `transform`/`filter`는 `fixed`의 기준까지 바꿔 모달이 갇히는 대표적 버그를 만든다.
</details>

---

## C3. z-index를 분명히 줬는데 안 먹습니다. 왜 그런가요? 🔴

**💬 30초 답변**
> `z-index`는 **같은 쌓임 맥락(stacking context) 안에서만** 서로 비교됩니다. 요소마다 z-index를 아무리 크게 줘도, 각자 **다른 쌓임 맥락**에 속해 있으면 부모 맥락끼리의 순서가 먼저 결정되고 자식의 z-index는 그 안에서만 유효합니다. 그래서 "자식에 z-index: 9999를 줬는데도 다른 요소 뒤에 깔리는" 일이 생깁니다. 쌓임 맥락은 `position` + `z-index`뿐 아니라 `opacity < 1`, `transform`, `filter`, `will-change`, `isolation: isolate` 등으로도 새로 생기므로, 원인을 찾으려면 "누가 새 쌓임 맥락을 만들었나"를 추적해야 합니다.

**📖 핵심 개념**

🎯 **비유**: 쌓임 맥락은 "건물의 층"입니다. z-index는 **한 층 안에서의 방 번호**일 뿐입니다. 3층(부모 A)의 999호가 아무리 높은 번호여도, 5층(부모 B)의 1호보다 위에 있을 수는 없습니다. 층(부모 맥락)의 순서가 먼저고, 방 번호(자식 z-index)는 같은 층 안에서만 의미가 있습니다.

📌 **쌓임 맥락을 새로 만드는 대표 조건**: ① 루트 `<html>`, ② `position: relative/absolute` + `z-index !== auto`, ③ `position: fixed/sticky`, ④ **`opacity < 1`**, ⑤ **`transform`, `filter`, `perspective`, `clip-path`, `mask` 등이 `none`이 아님**, ⑥ `will-change`에 위 속성 지정, ⑦ **`isolation: isolate`**, ⑧ Flex/Grid 자식에 `z-index` 지정. ④·⑤가 특히 함정입니다 — 애니메이션이나 반투명을 넣는 순간 의도치 않게 맥락이 갈립니다.

📌 **디버깅 절차**: (1) z-index가 안 먹는 두 요소의 **공통 조상까지 거슬러 올라가며** 각 요소가 속한 쌓임 맥락을 찾는다 → (2) 두 요소가 **서로 다른 맥락**에 있으면 각 맥락의 **최상위 조상끼리** z-index/순서를 비교한다 → (3) 해결은 보통 "경쟁하는 요소들을 **같은 쌓임 맥락**으로 모으거나", "맥락을 만드는 조상의 z-index를 조정"한다.

📌 **`isolation: isolate` 활용**: 위치나 z-index 부작용 없이 **의도적으로** 새 쌓임 맥락을 만들고 싶을 때 씁니다. 컴포넌트를 독립시켜 "이 컴포넌트의 z-index는 바깥에 영향 주지 않는다"를 보장하는 캡슐화 도구입니다.

```css
/* 문제 상황 */
.header { position: relative; z-index: 10; }
.hero   { transform: translateY(0); }   /* ← 여기서 새 쌓임 맥락 생성! */
.hero .tooltip { position: absolute; z-index: 9999; }
/* .tooltip은 .hero 맥락 안에 갇혀, .header(z-index:10)를 못 넘음 */

/* 해결 A: 경쟁 요소를 같은 맥락으로 (예: .hero의 transform 제거) */
/* 해결 B: 컴포넌트 격리로 예측 가능하게 */
.card { isolation: isolate; }  /* 내부 z-index가 바깥으로 새지 않음 */
```

**🔥 예상 꼬리질문**
- Q. `opacity: 0.99`만 줘도 z-index 문제가 생긴다는데 사실인가요? → A. 사실입니다. `opacity`가 1 미만이면 **그 요소는 새 쌓임 맥락의 루트**가 됩니다. 반투명 카드 위 배지가 갑자기 다른 요소에 가려진다면 이걸 의심하세요.
- Q. z-index 없이 순서만으로 앞뒤가 정해지기도 하나요? → A. 네. 같은 맥락·같은 z-index면 **HTML 소스 순서상 뒤에 오는 요소가 위**에 그려집니다. `position`이 있는 요소는 없는 요소보다 위입니다.
- Q. z-index 값을 999999처럼 크게 주는 게 해법인가요? → A. 아닙니다. 다른 맥락이면 소용없고, 팀 전체가 큰 값 경쟁("z-index 인플레이션")에 빠집니다. **맥락 구조를 정리**하고 z-index는 작은 정수 스케일(예: 10/20/30)로 관리하는 게 맞습니다.

<details><summary>📝 한 줄 요약</summary>
z-index는 같은 쌓임 맥락 안에서만 비교되고, `opacity<1`·`transform`·`filter` 등이 몰래 새 맥락을 만들어 "9999인데도 뒤에 깔리는" 버그를 유발하므로, 값을 키우지 말고 맥락 구조를 추적·정리해야 한다.
</details>

---

## C4. Flexbox를 속성 단위가 아니라 축(axis) 개념으로 설명해 보세요. 🔴

**💬 30초 답변**
> Flexbox는 **1차원(한 축) 레이아웃**입니다. `flex-direction`이 정하는 **주축(main axis)**을 따라 아이템을 배치하고, 그에 수직인 **교차축(cross axis)**으로 정렬합니다. `justify-content`는 **주축** 정렬, `align-items`는 **교차축** 정렬이라 이 둘을 헷갈리면 안 됩니다. 각 아이템의 최종 크기는 `flex: grow shrink basis` 세 값으로 계산되는데, `flex: 1`은 `1 1 0%`의 축약으로 "남는 공간을 균등하게 나눠 가진다"는 뜻입니다. 방향이 바뀌면(`row`↔`column`) `justify`와 `align`의 의미도 통째로 회전한다는 걸 이해하는 게 핵심입니다.

**📖 핵심 개념**

🎯 **비유**: Flex 컨테이너는 "한 줄로 선 사람들"입니다. 주축은 **줄이 늘어선 방향**, 교차축은 **키를 맞추는 방향**입니다. `justify-content`는 "줄 안에서 앞으로 몰까/뒤로 몰까/균등 간격을 둘까"(주축), `align-items`는 "줄의 위쪽에 맞출까/아래쪽에 맞출까/키를 다 늘려 세울까"(교차축)입니다.

📌 **`flex: grow shrink basis` 해부**
- **`flex-basis`**: 늘고 줄기 전의 **기준 크기**(기본 `auto` = 내용 크기 또는 `width`).
- **`flex-grow`**: 남는 공간이 있을 때 **몇 배로 나눠 가질지**(기본 0 = 안 늘어남).
- **`flex-shrink`**: 공간이 부족할 때 **얼마나 줄어들지**(기본 1 = 줄어듦).
- 자주 쓰는 축약: `flex: 1` → `1 1 0%`(basis를 0으로 두고 공간을 균등 배분), `flex: auto` → `1 1 auto`(내용 크기를 존중하며 남는 공간 배분), `flex: none` → `0 0 auto`(고정).

📌 **`min-width: auto` 함정(면접 단골)**: Flex 아이템의 `min-width`/`min-height` 기본값은 `auto`라서 **내용보다 작게 줄어들지 않습니다.** 그래서 긴 텍스트나 큰 이미지가 든 아이템이 컨테이너를 뚫고 넘치거나(overflow), `text-overflow: ellipsis`가 안 먹습니다. 해결은 해당 아이템에 **`min-width: 0`**(또는 `min-height: 0`)을 주는 것입니다.

📌 **`gap`은 Flex에서도 쓴다**: 예전엔 마진으로 간격을 줬지만 이제 `gap`이 Flex/Grid 모두에서 표준입니다. 마지막 아이템 마진 제거 핵이 필요 없어집니다.

```css
.toolbar {
  display: flex;
  justify-content: space-between; /* 주축: 양끝 정렬 */
  align-items: center;            /* 교차축: 세로 가운데 */
  gap: 12px;
}

/* 3분할: 가운데만 늘어나고 양옆은 내용 크기 고정 */
.left, .right { flex: none; }
.center       { flex: 1; }        /* 1 1 0% → 남는 공간 독차지 */

/* 넘침/말줄임이 안 될 때: min-width 0으로 축소 허용 */
.ellipsis-item {
  flex: 1;
  min-width: 0;                   /* ← 이게 없으면 ellipsis가 안 먹음 */
}
.ellipsis-item .title {
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}
```

**🔥 예상 꼬리질문**
- Q. `flex: 1`과 `flex: auto`의 차이는? → A. `flex: 1`은 basis가 `0%`라 **내용 크기를 무시**하고 남는 공간만으로 균등 분배해 아이템들이 같은 너비가 되기 쉽고, `flex: auto`는 basis가 `auto`라 **각자 내용 크기를 먼저 확보한 뒤** 남는 공간을 나눠 크기가 달라집니다.
- Q. 세로·가로 완벽 중앙 정렬을 Flex로? → A. 부모에 `display: flex; justify-content: center; align-items: center;` 세 줄이면 됩니다. (`place-items: center` 축약도 가능)
- Q. `align-items`와 `align-content`의 차이는? → A. `align-items`는 **한 줄 안에서 아이템들의 교차축 정렬**, `align-content`는 **여러 줄(wrap된)이 컨테이너 교차축에서 어떻게 분포**하는지입니다. 한 줄만 있으면 `align-content`는 효과가 없습니다.

<details><summary>📝 한 줄 요약</summary>
Flexbox는 주축(`justify-content`)·교차축(`align-items`) 1차원 정렬이고, 크기는 `flex: grow shrink basis`로 계산되며(`flex:1`=`1 1 0%`), 아이템의 기본 `min-width:auto` 때문에 넘침·말줄임이 안 될 땐 `min-width:0`을 준다.
</details>

---

## C5. Grid에서 `auto-fill`과 `auto-fit`의 차이는 무엇인가요? 🔴

**💬 30초 답변**
> Grid는 **2차원(행·열 동시) 레이아웃**입니다. 반응형 카드 그리드에서 자주 쓰는 `repeat(auto-fill, minmax(200px, 1fr))`와 `repeat(auto-fit, ...)`의 차이가 면접 단골인데, 둘 다 "컨테이너 폭에 맞춰 열 개수를 자동 계산"하지만 **아이템이 열을 다 못 채웠을 때** 동작이 다릅니다. `auto-fill`은 **빈 열(트랙)을 그대로 유지**해 아이템이 왼쪽에 모이고, `auto-fit`은 **빈 열을 0으로 접어** 남은 아이템들이 늘어나 공간을 꽉 채웁니다. `fr`는 남는 공간의 비율 단위, `minmax(min, max)`는 트랙의 최소·최대 크기를 정하는 함수라는 것도 함께 이해해야 합니다.

**📖 핵심 개념**

🎯 **비유**: 좌석 배치입니다. `auto-fill`은 "좌석을 최대한 많이 깔아두는 것"이라 사람(아이템)이 적으면 **빈 좌석이 남습니다.** `auto-fit`은 "사람 수에 맞춰 좌석을 붙이는 것"이라 빈 좌석을 치워 **남은 사람들이 넓게 앉습니다.**

📌 **핵심 함수·단위**
- **`fr`(fraction)**: 트랙에 남는 공간을 비율로 나눕니다. `1fr 2fr`이면 1:2로 분배. 고정 크기·gap을 제외한 나머지를 나눕니다.
- **`minmax(min, max)`**: 트랙이 `min`보다 작아지지 않고 `max`까지 늘어납니다. `minmax(200px, 1fr)`은 "최소 200px, 남으면 1fr만큼 확장".
- **`repeat(count, track)`**: 반복 정의. `count` 자리에 `auto-fill`/`auto-fit`을 넣으면 개수를 브라우저가 계산합니다.
- **`grid-template-areas`**: 문자열로 레이아웃을 시각적으로 배치. 반응형에서 영역만 재배치하기 좋습니다.

📌 **암시적 vs 명시적 그리드**: `grid-template-columns/rows`로 정의한 게 **명시적 그리드**, 아이템이 넘쳐 자동 생성되는 트랙이 **암시적 그리드**입니다. 암시적 트랙 크기는 `grid-auto-rows`/`grid-auto-columns`로 제어합니다.

📌 **subgrid(2023년 이후 주요 브라우저 지원)**: 자식 그리드가 **부모의 트랙 선(line)을 그대로 물려받아** 정렬을 맞추는 기능입니다. 예전엔 카드마다 제목·본문·버튼 높이가 제각각이라 정렬이 틀어졌는데, `grid-template-rows: subgrid`로 카드 내부 행을 부모 그리드에 맞춰 **여러 카드의 요소 라인을 일치**시킬 수 있습니다.

```css
/* 반응형 카드 그리드: 열 개수 자동, 최소 200px 보장 */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
/* auto-fit: 아이템이 적으면 빈 트랙을 접어 남은 카드가 넓어짐 */
/* auto-fill: 같은 상황에서 빈 트랙을 남겨 카드가 200px에 머물고 왼쪽 정렬 */

/* 영역 기반 레이아웃 */
.page {
  display: grid;
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
  grid-template-columns: 200px 1fr;
}
.page > header { grid-area: header; }
.page > nav    { grid-area: nav; }
.page > main   { grid-area: main; }

/* subgrid: 카드 내부 행을 부모 그리드에 정렬 */
.card { display: grid; grid-template-rows: subgrid; grid-row: span 3; }
```

**🔥 예상 꼬리질문**
- Q. 그럼 반응형 카드에는 `auto-fill`과 `auto-fit` 중 뭘 쓰나요? → A. "카드가 적을 때 **넓게 펴지길** 원하면 `auto-fit`", "카드 크기를 **일정하게 유지**하고 빈 공간을 남기고 싶으면 `auto-fill`"입니다. 대부분의 갤러리는 `auto-fit`을 선호합니다.
- Q. Flexbox와 Grid는 언제 각각 쓰나요? → A. **1차원(한 줄 정렬·툴바·태그 목록)**이면 Flexbox, **2차원(행과 열을 동시에 맞추는 페이지·카드 격자)**이면 Grid입니다. 둘을 중첩해 쓰는 것도 자연스럽습니다.
- Q. `1fr`과 `auto`의 차이는? → A. `auto`는 **내용 크기**에 맞춰지고, `1fr`은 **남는 공간을 비율로** 차지합니다. `1fr`끼리는 균등 분배되지만 `auto`는 콘텐츠에 따라 제각각입니다.

<details><summary>📝 한 줄 요약</summary>
Grid는 2차원 배치이고 `auto-fill`은 빈 트랙을 남겨 아이템 크기를 유지, `auto-fit`은 빈 트랙을 접어 아이템을 늘리며, `minmax`+`fr`로 반응형을 만들고 `subgrid`로 카드 내부 라인을 부모에 정렬한다.
</details>

---

## C6. `px`, `em`, `rem`, `vw`... 와 `clamp`를 언제 어떻게 쓰나요? 🟡

**💬 30초 답변**
> 단위는 **절대(px)**와 **상대(em·rem·%·vw/vh)**로 나뉩니다. `px`는 예측 가능하지만 사용자의 브라우저 글꼴 크기 설정을 무시해 **접근성에 불리**하고, `rem`은 루트(html) 폰트 크기에 비례해 사용자 설정을 존중하면서도 `em`처럼 중첩으로 값이 누적되는 혼란이 없어 **폰트·간격의 기본 단위로 권장**됩니다. 뷰포트 단위(`vw`/`vh`)와 새로 표준화된 `dvh`(동적 뷰포트 높이)는 화면 비율 기반 크기에 쓰고, `clamp(min, 선호, max)`는 "최소·최대 사이에서 유동적으로 커지는" 반응형 타이포그래피를 미디어 쿼리 없이 한 줄로 구현합니다.

**📖 핵심 개념**

🎯 **비유**: 단위는 "치수를 재는 자"입니다. `px`는 **눈금이 고정된 쇠자**(항상 같지만 사람 손 크기를 무시), `rem`은 **기준 손가락 한 마디**(사용자가 손가락을 키우면 다 같이 커짐), `em`은 **바로 위 요소의 손가락**(중첩되면 점점 커지는 눈덩이), `clamp`는 **"이 사이에서만 늘어나는 고무줄 자"**입니다.

📌 **`em` vs `rem`**: `em`은 **부모(자기 요소)의 font-size** 기준이라 중첩되면 값이 곱해져 누적됩니다(`1.2em`이 3단 중첩되면 1.728배). `rem`은 항상 **루트(`<html>`)의 font-size** 기준이라 어디서 쓰든 값이 일정합니다. 그래서 컴포넌트 크기·간격은 `rem`, "이 요소의 글자 크기에 비례해야 하는 패딩" 같은 국소적 비례는 `em`이 적합합니다.

📌 **접근성**: 사용자가 브라우저 기본 글꼴을 키웠을 때(저시력 사용자), `px`로 고정한 텍스트는 **안 커집니다**. 폰트 크기는 `rem`을 쓰는 게 접근성 원칙입니다. 반대로 보더 1px처럼 물리적으로 얇아야 하는 값은 `px`가 맞습니다.

📌 **뷰포트 단위와 `dvh`**: `vw`/`vh`는 뷰포트의 1%입니다. 모바일에서 `100vh`는 주소창이 접혔다 펴질 때 값이 튀는 고질적 문제가 있었는데, **`dvh`(dynamic viewport height)**는 UI 변화에 맞춰 동적으로 반영되고, `svh`(small)·`lvh`(large)로 최소/최대 상태도 지정할 수 있습니다(2022~2023년 주요 브라우저 지원).

📌 **`clamp(MIN, PREFERRED, MAX)`**: 값이 `PREFERRED`를 따르되 `MIN` 아래·`MAX` 위로는 안 갑니다. 유동 타이포그래피의 표준 관용구입니다.

```css
:root { font-size: 16px; }         /* 1rem = 16px (사용자 설정 존중) */

.container { max-width: 60rem; padding: 1.5rem; } /* rem 기반 */
.icon-gap  { gap: 0.5em; }          /* 글자 크기에 비례하는 국소 간격 */

/* 미디어 쿼리 없는 반응형 제목: 최소 1.5rem, 뷰포트 따라, 최대 3rem */
.title { font-size: clamp(1.5rem, 4vw + 1rem, 3rem); }

/* 모바일 풀스크린: 주소창 변화에 튀지 않음 */
.hero { min-height: 100dvh; }
```

**🔥 예상 꼬리질문**
- Q. `rem`을 쓰면서 `html { font-size: 62.5% }`(=10px) 트릭을 쓰기도 하던데요? → A. `1rem=10px`로 계산을 쉽게 하려는 관용구지만, 사용자 기본 글꼴 배수가 그대로 곱해지는 건 유지되므로 접근성엔 문제없습니다. 다만 팀 컨벤션에 따라 호불호가 갈립니다.
- Q. `clamp`의 가운데 값에 `4vw + 1rem`처럼 더하는 이유는? → A. 순수 `vw`만 쓰면 아주 좁은 화면에서 지나치게 작아지므로, `rem`을 더해 **바닥을 받쳐** 극단적으로 작아지는 걸 막고 기울기를 완만하게 합니다.
- Q. `%`는 무엇을 기준으로 하나요? → A. 속성마다 다릅니다. `width`의 `%`는 부모 폭, `padding`/`margin`의 `%`는 **부모의 폭(세로 마진도 폭 기준!)**, `font-size`의 `%`는 부모 폰트 크기 기준입니다.

<details><summary>📝 한 줄 요약</summary>
폰트·간격은 사용자 설정을 존중하는 `rem`을 기본으로, 국소 비례는 `em`, 화면 비율은 `vw`/`dvh`를 쓰고, `clamp(min, 선호, max)`로 미디어 쿼리 없이 유동 반응형을 구현한다.
</details>

---

## C7. 특정성(specificity)과 캐스케이드는 어떻게 계산되고 `@layer`는 왜 쓰나요? 🔴

**💬 30초 답변**
> 여러 규칙이 한 요소에 충돌할 때 어떤 값이 이기는지는 **캐스케이드(cascade)**가 결정합니다. 순서는 ① **origin·중요도**(작성자 `!important` > 작성자 일반 등), ② **`@layer` 순서**, ③ **특정성(specificity)**, ④ **소스 순서(뒤에 온 것 우선)**입니다. 특정성은 `(인라인, ID, 클래스·속성·가상클래스, 요소·가상요소)` 4자리 점수로 비교하는데, 예를 들어 `#id`(0,1,0,0)는 클래스 100개(0,0,100,0)보다도 셉니다. `!important` 남발과 특정성 경쟁을 피하려고 도입된 게 **`@layer`(캐스케이드 레이어)**로, 레이어 순서로 우선순위를 명시적으로 관리해 "어디서 온 스타일이 이겼는지"를 예측 가능하게 만듭니다.

**📖 핵심 개념**

🎯 **비유**: 캐스케이드는 "여러 심사위원이 매기는 점수 합산"입니다. 먼저 **소속(레이어)**으로 큰 우열을 가르고, 같은 소속이면 **선택자의 정밀도(특정성)**로, 그것도 같으면 **마지막에 제출한 사람**이 이깁니다.

📌 **특정성 계산 (a, b, c)**
- **a** = ID 선택자 개수 (`#header`)
- **b** = 클래스·속성·가상클래스 개수 (`.btn`, `[type="text"]`, `:hover`)
- **c** = 요소·가상요소 개수 (`div`, `::before`)
- 인라인 스타일은 이보다 위, `!important`는 그 위(같은 origin 내). `*`(전체 선택자)와 결합자는 특정성 0.
- 예: `#nav .list li a:hover` → ID 1, 클래스/가상클래스 2(.list, :hover), 요소 2(li, a) → **(1, 2, 2)**.

📌 **`:where()`는 특정성 0**: `:is()`와 `:where()`는 여러 선택자를 묶지만, `:is()`는 인자 중 **가장 높은 특정성**을 가져오는 반면 **`:where()`는 항상 특정성 0**입니다. 그래서 라이브러리/리셋 CSS에서 `:where(...)`로 감싸면 "사용자가 쉽게 덮어쓸 수 있는 낮은 우선순위 기본값"을 제공할 수 있습니다.

📌 **`@layer`(캐스케이드 레이어)**: 스타일을 이름 붙인 층으로 나누고 **층 순서로 우선순위를 고정**합니다. 나중에 선언한 레이어가 이깁니다. **레이어 간 우선순위는 특정성보다 먼저** 적용되므로, 낮은 레이어에 있는 규칙은 특정성이 아무리 높아도 높은 레이어의 규칙에 집니다. 리셋 → 프레임워크 → 컴포넌트 → 유틸리티 순으로 층을 쌓으면 `!important` 없이 우선순위를 설계할 수 있습니다.

```css
/* 레이어 순서 먼저 선언 → 뒤(utilities)일수록 우선 */
@layer reset, framework, components, utilities;

@layer reset {
  /* :where로 특정성 0 → 사용자가 쉽게 덮어씀 */
  :where(ul, ol) { margin: 0; padding: 0; }
}
@layer components {
  .btn { background: navy; }          /* 특정성 (0,1,0) */
}
@layer utilities {
  .bg-red { background: red; }         /* 특정성 (0,1,0) */
}
/* utilities가 components보다 나중 레이어라, .btn.bg-red면 red가 이김
   (특정성이 같더라도 레이어 순서가 먼저 결정) */
```

**🔥 예상 꼬리질문**
- Q. `!important`는 언제 정당한가요? → A. 서드파티 위젯을 어쩔 수 없이 덮어써야 하거나, 유틸리티 클래스의 의도된 강제성 정도입니다. 일반 컴포넌트 스타일에서 남발하면 **디버깅 불가능한 우선순위 전쟁**을 부르므로 지양하고, 대신 `@layer`나 선택자 재설계로 푸는 게 원칙입니다.
- Q. 상속(inheritance)과 캐스케이드는 다른 건가요? → A. 다릅니다. **캐스케이드**는 "충돌하는 규칙 중 승자 뽑기", **상속**은 "지정되지 않은 속성을 부모에게서 물려받기"입니다. `color`·`font`는 상속되지만 `margin`·`border`는 상속되지 않습니다. `inherit`/`initial`/`unset`/`revert`로 명시 제어할 수 있습니다.
- Q. ID 선택자를 피하라는 이유는? → A. 특정성이 지나치게 높아(0,1,0,0) 나중에 덮어쓰기 어렵기 때문입니다. 스타일링은 클래스 위주로 하고 ID는 앵커·JS 훅 용도로 두는 게 유지보수에 좋습니다.

<details><summary>📝 한 줄 요약</summary>
스타일 충돌은 origin/`!important` → `@layer` 순서 → 특정성`(ID,클래스,요소)` → 소스 순서로 결정되며, `:where()`는 특정성 0, `@layer`는 특정성보다 먼저 우선순위를 고정해 `!important` 없이 설계하게 해준다.
</details>

---

## C8. 2023년 이후 표준이 된 모던 CSS를 실무에 어떻게 쓰나요? 🟡

**💬 30초 답변**
> 최근 몇 년 사이 **`:has()`(부모/관계 선택자), 컨테이너 쿼리(`@container`), 논리 속성(logical properties), `aspect-ratio`, `text-wrap: balance`** 등이 주요 브라우저에서 표준으로 자리 잡아, 예전엔 JS나 편법으로 풀던 문제를 CSS만으로 선언적으로 해결할 수 있게 됐습니다. 특히 `:has()`는 "자식·상태에 따라 부모 스타일을 바꾸는" 오래된 숙원을 풀었고, 컨테이너 쿼리는 뷰포트가 아니라 **컴포넌트 자신의 폭**에 반응해 진짜 재사용 가능한 반응형 컴포넌트를 만들게 해줍니다.

**📖 핵심 개념**

🎯 **비유**: 미디어 쿼리가 "**건물 전체 크기(뷰포트)**를 보고 옷을 갈아입는 것"이라면, 컨테이너 쿼리는 "**자기가 들어간 방 크기(부모 컨테이너)**를 보고 옷을 정하는 것"입니다. 같은 카드 컴포넌트가 사이드바(좁음)와 본문(넓음)에서 각각 알아서 다르게 배치됩니다.

📌 **`:has()` — 관계/부모 선택자**: 조건을 만족하는 자손을 가진 요소를 선택합니다. `.card:has(img)`는 "이미지가 있는 카드", `label:has(input:checked)`는 "체크된 입력을 가진 라벨". 폼 검증 상태에 따른 UI 변화, "자식 개수에 따른 레이아웃" 등을 JS 없이 처리합니다.

📌 **컨테이너 쿼리(`@container`)**: 부모에 `container-type: inline-size`를 지정하면, 자식이 `@container (min-width: 400px)`로 **그 부모의 폭**에 반응합니다. 컴포넌트를 어디에 놓든 문맥에 맞게 반응하므로 디자인 시스템에 특히 강력합니다.

📌 **논리 속성(logical properties)**: `margin-left` 대신 `margin-inline-start`, `width` 대신 `inline-size`처럼 **물리적 방향(상하좌우) 대신 흐름 방향(inline/block, start/end)**으로 지정합니다. 아랍어(RTL)·세로쓰기 등 국제화에서 방향이 자동으로 뒤집혀 다국어 대응이 쉬워집니다.

📌 **기타 유용한 표준**: `aspect-ratio: 16/9`(비율 고정으로 이미지 CLS 방지), `text-wrap: balance`(제목 줄바꿈을 시각적으로 균형 있게), `gap`(Flex/Grid 공통 간격), `inset`(top/right/bottom/left 단축), `accent-color`(체크박스·라디오 색 커스터마이징).

```css
/* :has() — 이미지 있는 카드만 2열 레이아웃 */
.card:has(img) { grid-template-columns: 120px 1fr; }
/* 폼 검증: 유효하지 않은 입력을 가진 필드 그룹을 빨갛게 */
.field:has(input:invalid) { border-color: crimson; }

/* 컨테이너 쿼리 — 부모 폭에 반응하는 재사용 컴포넌트 */
.card-wrap { container-type: inline-size; }
@container (min-width: 400px) {
  .card { display: grid; grid-template-columns: 1fr 2fr; }
}

/* 논리 속성 — RTL에서 자동으로 좌우 반전 */
.badge { margin-inline-start: 8px; padding-block: 4px; }

/* 비율 고정으로 레이아웃 흔들림(CLS) 방지 */
.thumb { aspect-ratio: 16 / 9; object-fit: cover; }
```

**🔥 예상 꼬리질문**
- Q. `:has()`는 성능에 문제가 없나요? → A. 브라우저가 최적화돼 일반적 사용은 문제없지만, 매우 넓은 범위(예: `body:has(...)`)에 복잡한 조건을 걸면 스타일 재계산 비용이 커질 수 있으니 **가급적 좁은 범위**에 씁니다.
- Q. 컨테이너 쿼리가 미디어 쿼리를 대체하나요? → A. 대체가 아니라 **보완**입니다. 페이지 전체 레이아웃(네비게이션 접기 등)은 미디어 쿼리가, 재사용 컴포넌트 내부 배치는 컨테이너 쿼리가 적합합니다.
- Q. 아직 구형 브라우저를 지원해야 하면? → A. `@supports (selector(:has(*)))`로 기능 감지 후 점진적 향상(progressive enhancement)을 적용하거나, 핵심 동작은 견고한 기본값으로 두고 모던 CSS는 "있으면 더 좋은" 층으로 얹습니다.

<details><summary>📝 한 줄 요약</summary>
`:has()`는 부모/관계 선택자로 JS 없이 상태 기반 UI를, 컨테이너 쿼리(`@container`)는 뷰포트가 아닌 부모 폭 기반 반응형 컴포넌트를, 논리 속성은 다국어(RTL) 대응을, `aspect-ratio`는 CLS 방지를 선언적으로 해결한다.
</details>

---

## C9. 반응형 레이아웃을 설계할 때 흔히 빠지는 함정과 원칙은? 🔴

**💬 30초 답변**
> 반응형의 핵심 원칙은 **"고정 크기를 최소화하고, 콘텐츠가 스스로 흐르게 두라"**입니다. 브레이크포인트를 기기 기준으로 잔뜩 나누기보다 **콘텐츠가 깨지는 지점**에서 최소한으로 두고, 가능한 곳은 `flex-wrap`·`auto-fit` 그리드·`clamp` 같은 **본질적(intrinsic) 반응형**으로 처리하면 미디어 쿼리 없이도 유연해집니다. 실무 함정은 대체로 ① `100vw`로 인한 가로 스크롤, ② Flex 아이템의 `min-width: auto` 넘침, ③ 고정 `height`로 인한 콘텐츠 잘림, ④ 이미지 미지정으로 인한 CLS, ⑤ `px` 폰트로 인한 접근성 저하입니다.

**📖 핵심 개념**

🎯 **비유**: 좋은 반응형은 "물"입니다. 어떤 그릇(화면)에 담아도 알아서 모양을 채웁니다. 나쁜 반응형은 "여러 크기의 얼음 조각"이라, 딱 맞는 그릇에선 예쁘지만 조금만 달라져도 넘치거나 빈틈이 생깁니다. 미디어 쿼리는 "얼음을 몇 종류 준비하는 것", 본질적 반응형은 "애초에 물로 만드는 것"입니다.

📌 **흔한 함정과 해결**
- **가로 스크롤**: `width: 100vw`는 스크롤바 폭을 포함해 뷰포트보다 넓어질 수 있습니다. `width: 100%`를 쓰고, 전역에 `box-sizing: border-box`를 두어 패딩이 폭을 밀어내지 않게 합니다.
- **Flex 넘침**: 앞서 본 `min-width: 0`(C4)로 축소를 허용합니다.
- **고정 높이 금지**: `height` 고정 대신 `min-height`를 써서 콘텐츠가 늘면 컨테이너도 늘게 합니다.
- **CLS(누적 레이아웃 이동)**: 이미지·광고·임베드에 `width`/`height` 속성이나 `aspect-ratio`를 지정해 로드 전에 자리를 확보합니다(07-20 성능 편의 CLS와 직결).
- **터치 타깃·접근성**: 버튼 등 클릭 영역은 최소 약 44px, 폰트는 `rem`.

📌 **`box-sizing: border-box`**: 기본 `content-box`는 `width`에 패딩·보더가 더해져 실제 크기가 커집니다. 전역으로 `border-box`를 주면 "지정한 width가 곧 실제 폭"이 되어 레이아웃 계산이 직관적이 됩니다. 사실상 모든 프로젝트의 리셋 기본값입니다.

📌 **모바일 퍼스트**: 기본 스타일을 좁은 화면 기준으로 짜고, `min-width` 미디어 쿼리로 넓은 화면 스타일을 **더하는** 방식이 관리하기 쉽습니다. `<meta name="viewport" content="width=device-width, initial-scale=1">`이 빠지면 모바일에서 데스크톱 폭으로 렌더링되니 반드시 넣습니다.

```css
/* 거의 모든 프로젝트의 기본 리셋 */
*, *::before, *::after { box-sizing: border-box; }

/* 본질적 반응형: 미디어 쿼리 없이 유연 */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 1rem;                       /* min(100%, 220px): 아주 좁으면 100%로 안전 */
}

/* 모바일 퍼스트: 기본은 세로, 넓어지면 가로 */
.layout { display: flex; flex-direction: column; }
@media (min-width: 48rem) {
  .layout { flex-direction: row; }
}
```

**🔥 예상 꼬리질문**
- Q. 브레이크포인트는 몇 개가 적당한가요? → A. 기기 개수가 아니라 **콘텐츠가 실제로 깨지는 지점** 기준으로, 보통 2~4개면 충분합니다. "디자인이 어색해지는 폭에서만" 추가하는 게 원칙입니다.
- Q. `minmax(min(100%, 220px), 1fr)`에서 `min(100%, 220px)`를 쓰는 이유는? → A. 컨테이너가 220px보다 좁을 때 `minmax`의 최소값 220px이 컨테이너를 뚫어 **가로 스크롤**이 생기는 걸 막습니다. `min(100%, 220px)`는 "220px, 단 컨테이너보다 크면 100%"라 안전합니다.
- Q. `content-box`가 필요한 경우도 있나요? → A. 드물지만, 특정 컴포넌트에서 "패딩이 콘텐츠 폭에 영향을 주지 않아야" 하는 계산이 필요할 때 국소적으로 되돌릴 수 있습니다. 전역 기본값은 `border-box`가 실용적입니다.

<details><summary>📝 한 줄 요약</summary>
반응형은 고정 크기를 줄이고 `flex-wrap`·`auto-fit`·`clamp`로 콘텐츠가 스스로 흐르게 하는 게 원칙이며, `box-sizing: border-box`·`min-height`·`aspect-ratio`·`rem`으로 가로 스크롤·잘림·CLS·접근성 함정을 피한다.
</details>

---

## 🎯 마무리: 이 자료의 핵심 관통 개념

이 편은 CSS를 "속성 암기"가 아니라 **레이아웃 엔진의 규칙**으로 이해하는 데 초점을 뒀습니다.

1. **모든 배치는 문맥에서 시작한다** — 정상 흐름·BFC(C1), containing block(C2), 쌓임 맥락(C3)은 모두 "이 요소가 어떤 문맥/기준 안에 있는가"라는 하나의 질문입니다. z-index·position 버그의 90%는 이 문맥을 잘못 읽어서 생깁니다.
2. **Flex는 1차원(축), Grid는 2차원** — `justify`(주축)/`align`(교차축)의 구분(C4), `auto-fill`/`auto-fit`·`minmax`·subgrid(C5)를 원리로 알면 레이아웃을 "감"이 아니라 "계산"으로 짤 수 있습니다.
3. **충돌은 캐스케이드가 정한다** — 특정성 `(ID, 클래스, 요소)`과 `@layer`, `:where()`(C7)를 알면 `!important` 없이 우선순위를 설계할 수 있습니다.
4. **모던 CSS는 편법을 표준으로 대체한다** — `:has()`·컨테이너 쿼리·논리 속성·`clamp`·`aspect-ratio`(C6, C8)는 예전에 JS로 풀던 문제를 선언적으로 해결합니다.
5. **좋은 반응형은 물처럼 흐른다** — 고정 크기를 최소화하고 본질적 반응형을 우선하라(C9).

> 면접 팁: "이 레이아웃 버그의 원인이 뭘까요?" 류의 질문엔 **"먼저 이 요소가 속한 서식 문맥/쌓임 맥락/기준 상자를 확인하겠습니다"**라고 접근 방식을 말하는 것만으로도 "원리로 디버깅하는 사람"이라는 인상을 줄 수 있습니다.
