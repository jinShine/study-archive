# 이미지·폰트 최적화 — 페이지 무게의 80%를 결정하는 에셋 전략

> 주제: 신입~주니어 프론트엔드가 면접에서 "이미지 최적화요? WebP 쓰고 lazy loading 걸어요" 정도를 넘어 "**한 페이지의 전송 바이트 대부분을 차지하는 이미지·폰트를 포맷·해상도·우선순위·로딩 타이밍 관점에서 설계할 줄 안다**"를 보여주는 심화 — 이미지 포맷 선택 기준(JPEG/PNG/WebP/AVIF/SVG), 반응형 이미지(`srcset`/`sizes`/`<picture>`), 지연 로딩(`loading="lazy"`)과 그 함정, LCP 이미지 우선순위 제어(`preload`/`fetchpriority`/`decoding`), 이미지·폰트로 인한 CLS 방지(`width`/`height`·`aspect-ratio`·`size-adjust`), `next/image`가 내부적으로 하는 일, 웹폰트 로딩(FOIT/FOUT·`font-display`·WOFF2·서브셋·가변 폰트), **한글 폰트 특유의 용량 문제와 `unicode-range` 분할**, SVG·아이콘·비디오, 그리고 측정과 검증
>
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

---

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|---------|
| D1 | 왜 이미지와 폰트가 프론트엔드 성능의 핵심인가요? | 🔴 |
| D2 | 이미지 포맷은 어떤 기준으로 고르나요? (JPEG·PNG·WebP·AVIF·SVG) | 🔴 |
| D3 | 반응형 이미지는 어떻게 구현하나요? (`srcset` · `sizes` · `<picture>`) | 🔴 |
| D4 | 지연 로딩(`loading="lazy"`)은 어떻게 동작하고, 언제 쓰면 안 되나요? | 🔴 |
| D5 | LCP 이미지를 가장 빨리 띄우려면? (`preload` · `fetchpriority` · `decoding`) | 🔴 |
| D6 | 이미지 때문에 생기는 CLS는 어떻게 막나요? | 🔴 |
| D7 | `next/image`는 내부적으로 무엇을 해주나요? | 🔴 |
| D8 | 웹폰트는 왜 성능 문제가 되나요? FOIT · FOUT · `font-display` | 🔴 |
| D9 | 웹폰트를 실전에서 어떻게 최적화하나요? (WOFF2 · 서브셋 · preload · 가변 폰트) | 🟡 |
| D10 | 폰트 때문에 생기는 CLS는 어떻게 없애나요? (`size-adjust` · f-mods · `next/font`) | 🟡 |
| D11 | SVG·아이콘·비디오는 어떻게 다루나요? | 🟡 |
| D12 | 최적화를 어떻게 측정하고 증명하나요? | 🟡 |

---

## D1. 왜 이미지와 폰트가 프론트엔드 성능의 핵심인가요? 🔴

### 💬 30초 답변

> "웹 페이지 전송 바이트의 대부분은 이미지와 폰트 같은 **정적 에셋**입니다. JS 번들을 몇십 KB 줄이는 것보다, 3MB짜리 히어로 이미지를 300KB로 줄이는 게 로딩 시간에 훨씬 큰 영향을 줍니다. 특히 LCP(Largest Contentful Paint)의 측정 대상이 되는 요소는 대부분 **큰 이미지 아니면 큰 텍스트 블록**이라서, 이미지 최적화와 폰트 로딩 전략이 곧 LCP 점수를 결정합니다. 또 이미지의 크기를 미리 예약하지 않거나 폰트가 늦게 교체되면 **CLS(레이아웃 시프트)**가 발생합니다. 즉 Core Web Vitals 3개 중 2개(LCP·CLS)가 사실상 에셋 최적화 문제입니다."

### 📖 핵심 개념

🎯 **비유**: 이삿짐 트럭을 상상해 보세요. 옷가지(JS 코드)를 몇 벌 줄이는 것보다, **냉장고와 장롱(이미지·폰트)**을 어떻게 싣느냐가 이사 시간을 결정합니다. 게다가 냉장고 자리를 미리 안 비워두면(크기 예약 안 하면) 다른 짐을 다 옮긴 뒤에 전부 밀어야 하죠 — 그게 CLS입니다.

📌 **왜 에셋이 먼저인가**

| 관점 | 이유 |
|------|------|
| **바이트 비중** | 대부분의 실제 사이트에서 이미지가 전송 바이트 1위, 폰트가 상위권. JS는 바이트는 작아도 **실행 비용**이 큼 |
| **LCP 직결** | LCP 후보 요소는 `<img>`, `<image>`(SVG 내), `<video>`의 포스터, `url()` 배경 이미지, 그리고 **텍스트 블록** — 결국 이미지 또는 폰트 |
| **CLS 직결** | 크기 미지정 이미지 + 늦게 교체되는 웹폰트 = CLS의 양대 원인 |
| **비용 대비 효과** | 코드 리팩터링 없이 설정·속성만으로 큰 개선이 가능 → **면접에서 "무엇부터 하시겠어요?"의 정답** |

> 📎 **관련 자료 연결**: `2026-07-20_browser-rendering-performance.md`에서 LCP·CLS·INP의 **정의와 렌더링 파이프라인**을 다뤘다면, 오늘 문서는 그 지표를 **실제로 개선하는 에셋 레벨 실무**를 다룹니다. `2026-07-26_build-bundling...`이 "JS 바이트 줄이기"라면 오늘은 "이미지·폰트 바이트 줄이기"입니다.

### 🔥 예상 꼬리질문

**Q. 그럼 JS 번들 최적화는 안 해도 되나요?**
A. 아닙니다. 바이트 관점에서는 이미지가 크지만, **JS는 다운로드 후 파싱·컴파일·실행 비용**이 추가로 들어 메인 스레드를 막습니다(INP·TBT에 직결). 이미지 최적화는 **LCP·전송량**에, JS 최적화는 **상호작용 반응성**에 주로 효과가 있어 목적이 다릅니다.

**Q. LCP 요소가 무엇인지 어떻게 확인하나요?**
A. Chrome DevTools의 Performance 패널에서 타임라인의 LCP 마커를 클릭하면 해당 요소가 하이라이트됩니다. Lighthouse 리포트의 "Largest Contentful Paint element" 항목에서도 확인할 수 있고, 코드로는 `PerformanceObserver`로 `largest-contentful-paint` 엔트리를 관찰하면 됩니다.

```js
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const last = entries[entries.length - 1]; // LCP는 마지막 엔트리가 최종값
  console.log('LCP:', last.startTime, last.element);
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

<details><summary>📝 한 줄 요약</summary>
페이지 무게의 대부분은 이미지·폰트이고, Core Web Vitals의 LCP·CLS가 곧 에셋 문제이므로 성능 개선은 에셋에서 시작하는 것이 비용 대비 효과가 가장 크다.
</details>

---

## D2. 이미지 포맷은 어떤 기준으로 고르나요? (JPEG·PNG·WebP·AVIF·SVG) 🔴

### 💬 30초 답변

> "먼저 **벡터냐 래스터냐**로 나눕니다. 로고·아이콘·도형처럼 선과 면으로 된 그래픽은 SVG가 정답입니다. 해상도에 무관하게 선명하고 용량도 작습니다. 사진 같은 래스터 이미지는 **AVIF > WebP > JPEG/PNG** 순으로 압축률이 좋습니다. WebP는 사실상 모든 최신 브라우저에서 지원되고 JPEG 대비 25~35% 정도 작아서 **기본값으로 삼기 좋고**, AVIF는 WebP보다 20% 정도 더 작지만 인코딩이 느려 빌드/CDN 캐시 전략이 필요합니다. 실무에서는 `<picture>`나 이미지 CDN으로 **AVIF → WebP → JPEG 순 폴백**을 깔아두는 게 표준 패턴입니다. 애니메이션은 GIF 대신 반드시 비디오(MP4/WebM)나 WebP/AVIF 애니메이션을 씁니다."

### 📖 핵심 개념

🎯 **비유**: 포맷은 **짐 싸는 방식**입니다. SVG는 "가구 조립 설명서"(도면만 보내고 현장에서 그림) — 아무리 크게 만들어도 설명서 용량은 같습니다. 래스터는 "찍은 사진" — 크게 보려면 실제로 더 많은 픽셀을 보내야 합니다.

📌 **포맷 선택 표**

| 포맷 | 종류 | 투명도 | 애니메이션 | 언제 쓰나 |
|------|------|--------|-----------|-----------|
| **SVG** | 벡터 | O | O(SMIL/CSS) | 로고, 아이콘, 일러스트, 차트 — 해상도 독립 |
| **AVIF** | 래스터(손실/무손실) | O | O | 최고 압축률이 필요한 히어로/사진. 인코딩 느림 |
| **WebP** | 래스터(손실/무손실) | O | O | **범용 기본값**. JPEG/PNG 자리를 그대로 대체 |
| **JPEG** | 래스터(손실) | X | X | 폴백용. 사진 |
| **PNG** | 래스터(무손실) | O | X | 폴백용. 투명 필요 + 무손실이 중요한 경우 |
| **GIF** | 래스터 | 1비트 | O | ❌ 새로 쓰지 말 것. 비디오로 대체 |

📌 **손실(lossy) vs 무손실(lossless)**
- 손실 압축은 사람 눈이 잘 인지하지 못하는 정보를 버려 용량을 줄입니다. 사진에 적합.
- 무손실은 원본을 100% 복원 가능. 스크린샷·도형·텍스트가 포함된 이미지에 적합(손실 압축하면 글자 주변이 지저분해짐).
- **품질(quality) 값**: 대개 75~85가 실무 스위트 스팟입니다. 90 이상은 용량만 커지고 눈에 잘 안 보입니다. (Next.js `next/image`의 기본 `quality`도 75)

📌 **AVIF의 트레이드오프 (면접에서 깊이 드러나는 포인트)**

| 항목 | 내용 |
|------|------|
| 압축률 | 같은 품질 기준 WebP보다 약 20% 더 작음 |
| 인코딩 비용 | **훨씬 비쌈.** Next.js 공식 문서는 "WebP 대비 약 50% 더 오래 걸린다"고 표현하지만, 실제 libaom 계열 인코더는 설정에 따라 **수 배~수십 배** 느린 경우도 흔함 → **캐시 미스인 첫 요청은 오히려 느릴 수 있음** |
| 대응 | 빌드 타임에 미리 변환하거나, CDN 캐시로 첫 요청 이후를 커버 |
| 결론 | "무조건 AVIF"가 아니라 **"핵심 이미지는 AVIF, 나머지는 WebP"** 같은 선택적 적용이 현실적 |

### 💻 코드: `<picture>`로 포맷 폴백 깔기

```html
<!-- 브라우저는 위에서부터 지원하는 첫 source를 고른다.
     지원 안 되면 마지막 <img>의 src가 폴백이 된다. -->
<picture>
  <source srcset="/hero.avif" type="image/avif" />
  <source srcset="/hero.webp" type="image/webp" />
  <img
    src="/hero.jpg"
    alt="여름 신상 컬렉션 대표 이미지"
    width="1200"
    height="630"
    fetchpriority="high"
  />
</picture>
```

> ⚠️ **흔한 실수**: `<source>`의 순서가 중요합니다. 브라우저는 **"가장 작은 것"을 고르는 게 아니라 "지원하는 첫 번째 것"**을 고릅니다. 그래서 압축률이 좋은 포맷을 위에 둡니다.

> ⚠️ `<picture>`를 쓰더라도 `alt`·`width`·`height`는 **`<img>`에** 붙입니다. `<picture>`는 소스 선택 로직만 담당하고, 실제로 렌더링되는 요소는 `<img>`입니다.

### 🔥 예상 꼬리질문

**Q. `<picture>`와 `srcset`은 뭐가 다른가요?**
A. 목적이 다릅니다.
- **`srcset` + `sizes`** = *해상도 전환(resolution switching)*: **같은 이미지**를 여러 크기로 준비해두고 브라우저가 화면·DPR에 맞게 고르게 함. 어떤 걸 고를지는 **브라우저가 판단**합니다.
- **`<picture>` + `<source>`** = *아트 디렉션(art direction) 또는 포맷 분기*: **다른 이미지 / 다른 포맷**을 조건(`media`, `type`)에 따라 강제로 고르게 함. 개발자가 **명시적으로 지정**합니다.
예를 들어 "모바일에서는 인물 클로즈업, 데스크톱에서는 전신 사진"처럼 **구도 자체가 달라지면** `<picture media="...">`를 씁니다.

**Q. SVG는 언제 쓰면 안 되나요?**
A. 노드 수가 매우 많은 복잡한 일러스트(수천 개의 path)는 SVG가 오히려 파일도 크고 **렌더링 비용(파싱 + 래스터화)**도 큽니다. 이 경우 래스터 포맷이 낫습니다. 또 **사용자가 업로드한 SVG를 그대로 인라인 삽입하면 XSS 위험**이 있습니다(SVG 안에 `<script>`가 들어갈 수 있음) — 이건 `2026-07-21_web-security-xss-csrf-csp.md`와 연결되는 포인트입니다.

**Q. 이미지 CDN을 쓰면 뭐가 좋나요?**
A. URL 쿼리스트링만으로 리사이즈·포맷 변환·품질 조절을 **온디맨드**로 해주고, `Accept` 헤더를 보고 AVIF/WebP를 자동 협상(content negotiation)해 줍니다. 원본 하나만 관리하면 되니 빌드 파이프라인이 단순해집니다. 단, `Vary: Accept` 헤더가 제대로 걸려야 캐시가 잘못 섞이지 않습니다.

<details><summary>📝 한 줄 요약</summary>
벡터는 SVG, 사진은 AVIF→WebP→JPEG 폴백을 기본으로 하고, 품질은 75~85, GIF는 비디오로 대체한다.
</details>

---

## D3. 반응형 이미지는 어떻게 구현하나요? (`srcset` · `sizes` · `<picture>`) 🔴

### 💬 30초 답변

> "모바일 화면에 3840px 이미지를 내려보내는 건 낭비입니다. `srcset`으로 **같은 이미지의 여러 너비 버전 목록**을 주고, `sizes`로 **이 이미지가 레이아웃에서 실제로 몇 px을 차지하는지** 알려주면, 브라우저가 화면 너비와 DPR(기기 픽셀 비율)을 곱해 가장 적절한 후보를 고릅니다. 핵심은 `sizes`인데, 이걸 빠뜨리면 브라우저는 기본값 `100vw`로 가정해서 **필요보다 훨씬 큰 이미지를 받습니다.** 그리고 `sizes`는 CSS가 아니라 HTML 파서 단계에서 읽히기 때문에, CSS를 기다리지 않고 **프리로드 스캐너가 미리 이미지를 받기 시작**할 수 있다는 점이 중요합니다."

### 📖 핵심 개념

🎯 **비유**: 옷 가게에서 "S/M/L/XL 있어요"(`srcset`)라고 알려주고, "손님 체격은 대략 이 정도예요"(`sizes`)라고 힌트를 주면 점원(브라우저)이 맞는 사이즈를 골라줍니다. `sizes`를 안 주면 점원은 "일단 XL 드릴게요"라고 합니다.

📌 **`w` 서술자 vs `x` 서술자**

```html
<!-- ① w 서술자: 이미지 파일의 "실제 픽셀 너비"를 알려준다. sizes와 짝.
     src는 srcset을 이해하지 못하는 환경을 위한 폴백. -->
<img
  src="/photo-800.jpg"
  srcset="/photo-400.jpg 400w,
          /photo-800.jpg 800w,
          /photo-1600.jpg 1600w"
  sizes="(max-width: 600px) 100vw,
         (max-width: 1200px) 50vw,
         600px"
  width="800" height="600"
  alt="제주 바다 풍경"
/>

<!-- ② x 서술자: 화면상 크기가 "고정"인 이미지(아바타, 로고 등)에 적합. sizes 불필요. -->
<img
  src="/avatar.png"
  srcset="/avatar.png 1x, /avatar@2x.png 2x, /avatar@3x.png 3x"
  width="48" height="48"
  alt="김승진 프로필 사진"
/>
```

📌 **브라우저의 선택 과정 (`w` 서술자 기준)**

1. `sizes`의 미디어 조건을 **위에서부터** 평가해, 처음으로 참인 조건의 길이를 채택합니다. (모두 거짓이면 마지막 값)
2. 그 길이를 CSS 픽셀로 계산합니다. 예: 뷰포트 500px, `(max-width: 600px) 100vw` → **500px 필요**
3. **DPR을 곱합니다.** DPR 2 기기라면 500 × 2 = **1000 물리 픽셀** 필요
4. `srcset` 후보 중 1000w 이상을 만족하는 가장 작은 것 → `photo-1600.jpg` 선택

> 💡 그래서 "**모바일이면 무조건 작은 이미지**"가 아닙니다. 요즘 폰은 DPR이 2~3이라 **뷰포트는 작아도 물리 픽셀 요구량은 데스크톱과 비슷하거나 더 클 수 있습니다.** 이 사실을 말하면 면접에서 확실히 깊이가 드러납니다.

📌 **`sizes`를 쓸 때의 주의**

| 주의점 | 설명 |
|--------|------|
| CSS와 **직접 연결되지 않음** | `sizes`는 개발자가 손으로 적는 **약속**입니다. CSS 레이아웃을 바꾸면 `sizes`도 같이 고쳐야 합니다 |
| 틀려도 에러가 안 남 | 그래서 조용히 성능이 나빠집니다. DevTools Network에서 실제 선택된 파일을 확인하는 습관이 필요 |
| `auto` 값 | 최신 브라우저는 `sizes="auto"`를 지원합니다(레이아웃에서 자동 계산). 단 **`loading="lazy"`인 이미지에서만** 의미가 있습니다 — 지연 로딩 이미지는 로드 시점에 이미 레이아웃이 확정돼 있기 때문입니다 |

📌 **아트 디렉션이 필요할 때**

```html
<picture>
  <!-- 모바일: 세로 크롭 이미지 -->
  <source media="(max-width: 640px)" srcset="/hero-portrait.webp" />
  <!-- 데스크톱: 와이드 이미지 -->
  <source media="(min-width: 641px)" srcset="/hero-wide.webp" />
  <img src="/hero-wide.jpg" alt="캠페인 배너" width="1600" height="600" />
</picture>
```

### 🔥 예상 꼬리질문

**Q. `srcset`을 썼는데도 항상 가장 큰 이미지가 다운로드됩니다. 왜죠?**
A. 대표적인 원인 세 가지입니다. ① `sizes`가 없어서 브라우저가 `100vw`로 가정, ② `sizes` 값이 실제 레이아웃보다 크게 적혀 있음, ③ **이미 큰 이미지가 캐시에 있으면 브라우저는 그걸 재사용**합니다(더 작은 걸 새로 받는 게 손해니까). 테스트할 때는 캐시를 비우고 확인해야 합니다.

**Q. 프리로드 스캐너(preload scanner)가 뭔가요?**
A. 브라우저는 HTML을 파싱해 DOM을 만드는 메인 파서와 별개로, **HTML 텍스트를 미리 훑어 이미지·스크립트·CSS 같은 서브리소스 URL을 찾아 먼저 다운로드를 시작하는** 보조 스캐너를 돌립니다. 그래서 `<img src>`나 `srcset`은 아주 일찍 발견되지만, **JS로 동적으로 만든 이미지나 CSS `background-image`는 스캐너가 못 봅니다.** LCP 이미지를 CSS 배경으로 넣으면 느려지는 이유가 이것이고, 그럴 땐 `<link rel="preload" as="image">`로 보완합니다.

**Q. `width`/`height`를 적어놓고 CSS로 크기를 다르게 주면 문제가 되나요?**
A. 문제 없습니다. HTML의 `width`/`height`는 **종횡비를 알려주기 위한 것**이고, 실제 표시 크기는 CSS가 결정합니다. 다만 CSS에서 한쪽만 바꾸면 비율이 깨지므로 `height: auto`(또는 `width: auto`)를 함께 주는 게 관례입니다.

```css
img { max-width: 100%; height: auto; }
```

<details><summary>📝 한 줄 요약</summary>
`srcset`으로 후보를, `sizes`로 실제 표시 너비를 알려주면 브라우저가 뷰포트×DPR을 계산해 최적 이미지를 고르며, `sizes` 누락은 곧 과다 다운로드다.
</details>

---

## D4. 지연 로딩(`loading="lazy"`)은 어떻게 동작하고, 언제 쓰면 안 되나요? 🔴

### 💬 30초 답변

> "`loading="lazy"`를 붙이면 브라우저가 그 이미지를 **뷰포트에 가까워질 때까지 다운로드하지 않습니다.** 예전엔 IntersectionObserver로 직접 구현했지만 지금은 브라우저 네이티브 기능이라 한 줄이면 됩니다. 중요한 건 **어디에 쓰면 안 되는가**인데, **첫 화면(above the fold)에 보이는 이미지, 특히 LCP 이미지에는 절대 lazy를 걸면 안 됩니다.** 지연 로딩은 이미지 발견을 일부러 늦추는 것이라 LCP가 눈에 띄게 나빠집니다. 실무 규칙은 '**첫 화면 이미지는 eager + high priority, 그 아래는 lazy**'입니다."

### 📖 핵심 개념

🎯 **비유**: 뷔페에서 접시에 다 담지 않고, **먹을 때가 되면 그때 가져오는 것**이 지연 로딩입니다. 다만 지금 당장 먹어야 할 메인 요리까지 "나중에 가져올게요" 하면 곤란하죠.

📌 **네이티브 지연 로딩**

```html
<!-- 첫 화면 아래 콘텐츠: 지연 로딩 -->
<img src="/product-12.webp" loading="lazy" decoding="async"
     width="400" height="300" alt="상품 12" />

<!-- 첫 화면 LCP 이미지: 즉시 로딩 + 우선순위 상향 -->
<img src="/hero.webp" loading="eager" fetchpriority="high"
     width="1200" height="630" alt="메인 배너" />
```

| 속성 | 값 | 의미 |
|------|-----|------|
| `loading` | `lazy` / `eager`(기본) | 뷰포트 근처까지 다운로드 지연 여부 |
| `decoding` | `async` / `sync` / `auto`(기본) | 이미지 디코딩을 메인 스레드 밖에서 비동기로 할지 |
| `fetchpriority` | `high` / `low` / `auto`(기본) | 리소스 가져오기 우선순위 힌트 |

📌 **`loading="lazy"`에 대한 흔한 오해 정리**

| 오해 | 진실 |
|------|------|
| "뷰포트에 들어와야 로딩된다" | 아닙니다. 브라우저는 **여유 거리(threshold)를 두고 미리** 로딩을 시작합니다. 사용자가 스크롤했을 때 이미 로드가 끝나 있도록 하려는 것이며, 이 거리는 브라우저·네트워크 상태에 따라 다릅니다 |
| "전부 lazy 걸면 무조건 빨라진다" | 아닙니다. 첫 화면 이미지에 걸면 **LCP가 나빠집니다**. Lighthouse도 이를 별도 경고로 잡습니다 |
| "lazy면 `width`/`height`는 없어도 된다" | 오히려 **더 필요합니다**. 나중에 로드되므로 자리 예약이 없으면 스크롤 중에 레이아웃이 튑니다 |
| "`<iframe>`엔 안 된다" | `<iframe loading="lazy">`도 지원됩니다(유튜브 임베드 등에 유용) |

📌 **`decoding="async"`는 무슨 차이인가**
이미지를 화면에 그리려면 다운로드 후 **디코딩(압축 해제 → 비트맵)** 과정이 필요합니다. 큰 이미지의 디코딩은 수십 ms가 걸릴 수 있고, 동기로 처리하면 그동안 메인 스레드가 막혀 **INP·반응성**이 나빠집니다. `decoding="async"`는 "이미지 디코딩이 끝날 때까지 다른 콘텐츠 표시를 막지 말라"는 힌트입니다.

> ⚠️ 단, **LCP 이미지에는 `decoding="async"`가 항상 이득은 아닙니다.** 비동기 디코딩은 표시 시점을 살짝 뒤로 미룰 수 있어서, LCP 이미지에는 `decoding` 지정을 생략(`auto`)하고 브라우저 판단에 맡기거나 `sync`를 쓰는 편이 나은 경우도 있습니다. 반드시 측정으로 확인하세요.

### 💻 참고: IntersectionObserver로 직접 만드는 경우 (네이티브가 부족할 때)

```js
// 예: 배경 이미지, 비디오 등 네이티브 lazy가 없는 대상에 적용
const io = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.style.backgroundImage = `url(${el.dataset.bg})`;
    observer.unobserve(el); // ✅ 한 번 처리했으면 반드시 해제 (메모리 누수 방지)
  });
}, {
  rootMargin: '200px 0px', // 뷰포트보다 200px 먼저 트리거 → 스크롤 시 이미 로드됨
  threshold: 0,
});

document.querySelectorAll('[data-bg]').forEach((el) => io.observe(el));
```

### 🔥 예상 꼬리질문

**Q. React 컴포넌트에서 IntersectionObserver를 쓸 때 주의점은?**
A. `useEffect`의 클린업에서 `observer.disconnect()`를 호출해야 합니다. 안 그러면 컴포넌트가 언마운트돼도 옵저버가 DOM 노드를 참조해 **메모리 누수**가 됩니다. (`2026-07-22_js-event-loop-microtask-memory.md`의 누수 패턴과 같은 맥락)

```jsx
useEffect(() => {
  const io = new IntersectionObserver(cb, { rootMargin: '200px' });
  if (ref.current) io.observe(ref.current);
  return () => io.disconnect(); // ✅ 필수
}, []);
```

**Q. 무한 스크롤 목록에서는 어떻게 하나요?**
A. 목록 이미지 전부에 `loading="lazy"`를 걸고, **아이템 개수가 수천 개로 늘어나면 지연 로딩만으로는 부족합니다.** DOM 노드 자체가 많아져 메모리와 렌더링 비용이 커지므로 **가상화(virtualization, 화면에 보이는 몇 개만 실제 DOM에 유지)**를 함께 씁니다. CSS `content-visibility: auto`로 화면 밖 요소의 렌더링을 건너뛰게 하는 것도 보조 수단입니다.

**Q. `loading="lazy"`가 SEO에 영향을 주나요?**
A. 검색 엔진 크롤러도 렌더링을 수행하므로 네이티브 lazy loading은 일반적으로 인덱싱에 문제가 없습니다. 반면 **JS로 직접 구현한 lazy loading에서 `src`를 비워두고 `data-src`만 채워두면** 크롤러가 이미지를 못 볼 수 있습니다. 이것도 네이티브를 우선 쓰는 이유 중 하나입니다.

<details><summary>📝 한 줄 요약</summary>
`loading="lazy"`는 첫 화면 아래 이미지에만 쓰고, LCP·히어로 이미지에는 `eager` + `fetchpriority="high"`를 써야 한다.
</details>

---

## D5. LCP 이미지를 가장 빨리 띄우려면? (`preload` · `fetchpriority` · `decoding`) 🔴

### 💬 30초 답변

> "LCP를 개선하려면 이미지가 **① 언제 발견되고 ② 어떤 우선순위로 다운로드되며 ③ 언제 렌더링되는지** 세 단계를 모두 봐야 합니다. 브라우저는 처음 발견한 이미지들을 기본적으로 **낮은 우선순위**로 잡습니다. 화면에 보이는지 아직 모르기 때문이죠(레이아웃 이후에야 알 수 있음). 그래서 히어로 이미지에 `fetchpriority="high"`를 붙여 **처음부터 높은 우선순위로 받게** 만드는 게 가장 효과적인 한 줄짜리 개선입니다. 실제로 이 한 줄로 LCP가 2.6초에서 1.9초로 줄어든 사례가 web.dev에 공개돼 있습니다. 이미지가 CSS 배경이거나 JS로 늦게 삽입되는 등 **프리로드 스캐너가 못 보는 경우**에는 `<link rel="preload" as="image">`로 발견 시점 자체를 앞당깁니다."

### 📖 핵심 개념

🎯 **비유**: 공항 보안 검색대에 줄이 섰다고 합시다. 브라우저는 기본적으로 "이미지는 뒤로" 정책을 씁니다. `fetchpriority="high"`는 **패스트트랙 티켓**이고, `preload`는 아예 **줄에 더 일찍 서게 하는 것**입니다. 둘은 다른 문제를 풉니다.

📌 **문제를 나눠 보기**

| 병목 | 증상 | 처방 |
|------|------|------|
| **발견이 늦음** (discovery) | 이미지 요청이 워터폴에서 한참 뒤에 시작 | `<link rel="preload" as="image">`, HTML에 직접 `<img>`로 넣기, CSS 배경 대신 `<img>` 사용 |
| **우선순위가 낮음** (priority) | 요청은 일찍 갔는데 다른 리소스에 밀림 | `fetchpriority="high"`, 불필요한 리소스에 `fetchpriority="low"` |
| **서버 응답이 느림** | TTFB 자체가 김 | CDN, 캐시 헤더, 이미지 CDN |
| **파일이 큼** | 다운로드가 오래 걸림 | 포맷·품질·`srcset` (D2·D3) |
| **렌더링이 막힘** | 다운로드는 끝났는데 늦게 보임 | 렌더 블로킹 CSS/JS 줄이기, 폰트 대기 제거 |

### 💻 실전 패턴

```html
<head>
  <!-- ① 도메인 연결 미리 열기: 외부 이미지 CDN을 쓸 때 DNS+TCP+TLS 시간 절약
       ⚠️ 이미지용 preconnect에는 crossorigin을 붙이지 않는다.
          일반 <img> 요청은 CORS 모드가 아니라서, crossorigin을 붙이면
          커넥션 풀 키가 달라져 미리 연 연결을 재사용하지 못하고 연결이 하나 낭비된다.
          crossorigin은 실제 요청이 CORS로 나가는 폰트에만 붙인다. -->
  <link rel="preconnect" href="https://images.example-cdn.com" />

  <!-- ② LCP 이미지가 CSS 배경이거나 늦게 발견될 때만 preload
         (반응형이면 imagesrcset/imagesizes까지 함께 맞춰야 중복 다운로드가 안 생긴다) -->
  <link
    rel="preload"
    as="image"
    href="/hero-800.webp"
    imagesrcset="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1600.webp 1600w"
    imagesizes="(max-width: 640px) 100vw, 800px"
    fetchpriority="high"
  />
</head>

<body>
  <!-- ③ 일반적인 경우: 그냥 img에 fetchpriority만 붙이는 게 가장 간단하고 안전 -->
  <img
    src="/hero-800.webp"
    srcset="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1600.webp 1600w"
    sizes="(max-width: 640px) 100vw, 800px"
    width="1600" height="900"
    alt="여름 세일 배너"
    fetchpriority="high"
  />
</body>
```

📌 **`fetchpriority`의 반대 방향 활용 (덜 알려진 고급 포인트)**
높이는 것만 생각하기 쉬운데, **낮추는 것도 강력합니다.** 첫 화면에 있지만 중요하지 않은 이미지(캐러셀의 2~5번째 슬라이드, 장식용 배경)에 `fetchpriority="low"`를 주면 대역폭이 LCP 이미지로 몰립니다. 캐러셀은 실제로 이 패턴의 대표 사례입니다 — 첫 슬라이드만 `high`, 나머지는 `low` 또는 `lazy`.

```html
<div class="carousel">
  <img src="/slide-1.webp" fetchpriority="high" alt="..." />        <!-- LCP 후보 -->
  <img src="/slide-2.webp" fetchpriority="low" loading="lazy" alt="..." />
  <img src="/slide-3.webp" fetchpriority="low" loading="lazy" alt="..." />
</div>
```

📌 **`preconnect` vs `dns-prefetch` vs `preload` vs `prefetch`**

| 힌트 | 하는 일 | 언제 |
|------|---------|------|
| `dns-prefetch` | DNS 조회만 미리 | 확실치 않은 서드파티 도메인 |
| `preconnect` | DNS + TCP + TLS까지 미리 | **곧 확실히 쓸** 외부 도메인 (2~3개까지만) |
| `preload` | 리소스를 **지금 페이지에 쓸 것**으로 미리 다운로드 | LCP 이미지, 중요 폰트 |
| `prefetch` | **다음 페이지**에서 쓸 것을 유휴 시간에 미리 | 다음 네비게이션 예측 |

> ⚠️ **preload 남용 주의**: 모든 걸 preload하면 우선순위 개념이 사라져 오히려 느려집니다. "모두가 1순위면 아무도 1순위가 아니다." 보통 **페이지당 1~2개**(LCP 이미지, 핵심 폰트)로 제한합니다. 또 잘못 쓰면 브라우저 콘솔에 "preloaded but not used within a few seconds" 경고가 뜹니다.

### 🔥 예상 꼬리질문

**Q. `preload`와 `fetchpriority="high"` 중 뭘 먼저 쓰나요?**
A. **`fetchpriority="high"`가 먼저**입니다. 이미지가 HTML에 `<img>`로 들어있어 프리로드 스캐너가 이미 발견할 수 있다면, `preload`는 발견 시점을 크게 못 앞당기고 관리 비용만 늘립니다. `preload`는 **스캐너가 못 보는 경우**(CSS `background-image`, JS로 생성, `@import` 뒤에 숨은 리소스)에 씁니다.

**Q. 우선순위를 어떻게 확인하나요?**
A. Chrome DevTools → Network 패널 → 열 머리글 우클릭 → **Priority** 열을 켭니다. 그러면 각 요청의 우선순위(Highest/High/Medium/Low/Lowest)를 볼 수 있습니다. `fetchpriority` 적용 전후를 비교하면 효과를 눈으로 확인할 수 있어요.

**Q. HTTP/2·HTTP/3에서도 우선순위가 의미가 있나요?**
A. 있습니다. HTTP/2 이상은 하나의 연결에서 여러 스트림을 멀티플렉싱하므로, **한정된 대역폭을 어떤 스트림에 얼마나 배분할지**가 곧 우선순위 문제입니다. 다만 실제 스케줄링은 서버·CDN 구현에 달려 있어서, **클라이언트가 힌트를 줘도 서버가 존중하지 않으면 효과가 줄어듭니다.** (`2026-07-23_network-http-caching-http2-http3-cors.md` 참고)

<details><summary>📝 한 줄 요약</summary>
LCP 개선은 "발견을 빠르게(preload) + 우선순위를 높게(fetchpriority=high) + 덜 중요한 건 낮추기(low)"의 조합이며, `<img>`가 HTML에 있으면 `fetchpriority`만으로 충분한 경우가 많다.
</details>

---

## D6. 이미지 때문에 생기는 CLS는 어떻게 막나요? 🔴

### 💬 30초 답변

> "이미지가 로드되기 전에는 브라우저가 그 이미지가 얼마나 클지 모르기 때문에 자리를 0으로 잡고, 로드되는 순간 갑자기 공간이 생기면서 아래 콘텐츠가 밀립니다. 그게 CLS입니다. 해결책은 **로드 전에 자리를 예약하는 것**이고, 가장 쉬운 방법은 `<img>`에 **`width`와 `height` 속성을 적는 것**입니다. 현대 브라우저는 이 두 값으로 `aspect-ratio`를 자동 계산해 반응형 상황에서도 비율만큼 자리를 미리 확보합니다. 크기를 미리 알 수 없는 경우엔 컨테이너에 `aspect-ratio` CSS를 주거나, 스켈레톤·플레이스홀더로 높이를 고정합니다."

### 📖 핵심 개념

🎯 **비유**: 극장에서 지각한 친구를 위해 **미리 자리를 맡아두는 것**입니다. 자리를 안 맡아두면 친구가 도착했을 때 모두가 한 칸씩 옮겨 앉아야 하죠 — 그게 레이아웃 시프트입니다.

📌 **왜 `width`/`height`만으로 반응형에서도 되는가**

과거에는 "반응형이면 `width`/`height`를 쓰면 안 된다"는 통념이 있었지만, 지금은 **정반대**입니다. 브라우저는 HTML의 `width`/`height` 속성으로 다음과 같은 기본 스타일을 내부적으로 적용합니다.

```css
/* 브라우저 기본 동작(개념) */
img {
  aspect-ratio: attr(width) / attr(height);
}
```

그래서 CSS로 `width: 100%; height: auto;`를 줘도 **비율이 유지된 채 자리가 미리 예약**됩니다.

```html
<!-- ✅ 올바른 패턴 -->
<img src="/photo.webp" width="1600" height="900" alt="..." style="width:100%;height:auto" />
```

```css
img {
  max-width: 100%;
  height: auto; /* ✅ 이거 없으면 CSS width만 바뀌어 비율이 깨진다 */
}
```

📌 **크기를 모르는 경우 — `aspect-ratio`로 컨테이너 고정**

```css
.thumb {
  aspect-ratio: 16 / 9;   /* 자리 예약 */
  width: 100%;
  background: #eee;        /* 로딩 중 플레이스홀더 */
  overflow: hidden;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;       /* 비율이 달라도 잘라서 채움 */
}
```

📌 **CLS를 만드는 다른 이미지 관련 패턴**

| 원인 | 해결 |
|------|------|
| 광고·임베드가 나중에 삽입 | 컨테이너에 최소 높이(`min-height`) 예약 |
| 이미지 로드 후 배너가 나타남 | 배너 자리를 처음부터 예약하거나 `position: absolute`로 흐름에서 뺌 |
| 폰트 교체로 텍스트 높이 변화 | D10 참조 |
| 동적으로 삽입되는 토스트/알림 | `position: fixed`로 문서 흐름에 영향 없게 |

> 💡 **CLS 점수의 정의**: CLS는 "얼마나 큰 영역이(impact fraction) 얼마나 멀리(distance fraction) 움직였는가"의 곱을 세션 윈도우 단위로 합산해 최댓값을 취합니다. **사용자 입력 직후 500ms 이내의 이동은 제외**되므로, 버튼 클릭으로 아코디언이 펼쳐지는 건 CLS로 잡히지 않습니다. 좋은 임계값은 **0.1 이하**입니다.

### 🔥 예상 꼬리질문

**Q. `object-fit`과 `object-position`은 무슨 차이인가요?**
A. `object-fit`은 **어떻게 채울지**(`cover` = 비율 유지하며 넘치게 잘라 채움, `contain` = 비율 유지하며 다 보이게 넣음, `fill` = 비율 무시하고 늘림), `object-position`은 **어디를 기준으로 자를지**(`center`, `top`, `50% 20%` 등)입니다. 인물 썸네일에서 얼굴이 잘리는 문제는 대개 `object-position: top`으로 해결합니다.

**Q. 이미지가 로드되는 동안 흐릿한 미리보기를 보여주는 건 어떻게 하나요?**
A. **LQIP(Low Quality Image Placeholder)** 또는 **BlurHash** 패턴입니다. 아주 작은(예: 10×6px) 이미지를 base64로 인라인해 CSS blur를 걸어두고, 실제 이미지가 로드되면 교체합니다. `next/image`의 `placeholder="blur"`가 이걸 자동으로 해줍니다. **크기는 이미 예약돼 있으므로 CLS는 발생하지 않고**, 체감 로딩 속도(perceived performance)만 개선됩니다.

**Q. 스켈레톤 UI와 스피너 중 뭐가 나은가요?**
A. 일반적으로 스켈레톤이 낫습니다. ① 최종 레이아웃과 같은 크기를 차지해 **CLS를 원천 차단**하고, ② 사용자가 "무엇이 올지" 예측할 수 있어 체감 대기 시간이 짧아집니다. 다만 **로딩이 200ms 미만으로 짧을 땐 스켈레톤이 오히려 깜빡임**으로 느껴지므로 지연 표시(delay)를 두기도 합니다.

<details><summary>📝 한 줄 요약</summary>
`<img>`에 `width`/`height`를 반드시 적어 브라우저가 `aspect-ratio`로 자리를 예약하게 하고, 크기를 모르면 컨테이너에 `aspect-ratio` + `object-fit`을 쓴다.
</details>

---

## D7. `next/image`는 내부적으로 무엇을 해주나요? 🔴

### 💬 30초 답변

> "`next/image`는 지금까지 이야기한 최적화를 **기본값으로 묶어놓은 컴포넌트**입니다. 요청 시점에 이미지를 리사이즈하고 WebP/AVIF로 변환해 주고, `srcset`을 자동 생성하고, `width`/`height`를 필수로 요구해서 CLS를 막고, 기본적으로 `loading="lazy"`를 겁니다. 그리고 `priority` prop을 주면 `fetchpriority="high"` + `preload`가 붙습니다. 면접에서 중요한 건 '**자동으로 해준다**'가 아니라 '**어떤 원리로 해주고 무엇을 여전히 개발자가 결정해야 하는가**'입니다. 대표적으로 `sizes`는 개발자가 직접 정확히 적어야 하고, 이걸 빠뜨리면 최적화 효과가 크게 떨어집니다."

### 📖 핵심 개념

📌 **`next/image`가 해주는 일 vs 개발자가 해야 하는 일**

| `next/image`가 자동으로 | 개발자가 반드시 |
|------------------------|----------------|
| 요청된 크기로 온디맨드 리사이즈 | `width`/`height` 또는 `fill` 지정 |
| WebP/AVIF 자동 협상 (`Accept` 헤더 기반) | `next.config`에서 `formats` 설정 |
| `srcset` 자동 생성 (`deviceSizes`/`imageSizes` 기반) | **`sizes` 정확히 작성** ← 가장 자주 빠뜨림 |
| 기본 `loading="lazy"` | 첫 화면 이미지에 `priority` 부여 |
| 최적화 결과 캐싱 | 외부 도메인 `remotePatterns` 허용 설정 |
| blur 플레이스홀더 생성(로컬 import 시 자동) | 원격 이미지는 `blurDataURL` 직접 제공 |

### 💻 코드

```jsx
import Image from 'next/image';
import heroImg from '@/public/hero.png'; // 정적 import → width/height/blurDataURL 자동 추론

export default function Page() {
  return (
    <>
      {/* ① LCP 히어로: priority 필수 (= fetchpriority high + preload, lazy 해제) */}
      <Image
        src={heroImg}
        alt="여름 신상 컬렉션"
        priority
        placeholder="blur"   // 정적 import라 blurDataURL 자동 생성
        sizes="100vw"
      />

      {/* ② 카드 그리드 썸네일: 레이아웃에 맞춘 sizes가 핵심 */}
      <Image
        src="https://cdn.example.com/product/12.jpg"
        alt="상품 12"
        width={400}
        height={300}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* ③ 부모 크기에 꽉 채우기: 부모에 position:relative + 크기 필요 */}
      <div className="relative aspect-video w-full">
        <Image src="/banner.jpg" alt="배너" fill sizes="100vw"
               style={{ objectFit: 'cover' }} />
      </div>
    </>
  );
}
```

```js
// next.config.js
module.exports = {
  images: {
    // AVIF를 먼저 시도하고, 미지원 브라우저는 WebP로 폴백
    formats: ['image/avif', 'image/webp'],
    // 외부 이미지 허용 (보안: 아무 도메인이나 최적화 프록시로 쓰이지 않게 제한)
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com', pathname: '/product/**' },
    ],
    // srcset 후보로 쓰일 너비 목록 (기본값이 대부분 적절함)
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

📌 **`sizes` 유무의 실제 차이 (Next 공식 문서 기준)**
- **`sizes` 없음** → 1x/2x 정도의 제한된 `srcset`만 생성. **고정 크기 이미지**에 적합
- **`sizes` 있음** → 640w, 750w… 같은 **완전한 `srcset`** 생성. **반응형 레이아웃**에 필수

즉 `fill`이나 CSS로 유동적으로 크기가 변하는 이미지에서 `sizes`를 빠뜨리면, 브라우저가 과도하게 큰 후보를 고르게 됩니다.

📌 **주의할 점 (실무 함정)**

| 함정 | 설명 |
|------|------|
| 셀프 호스팅 최적화 비용 | Vercel이 아닌 환경에서는 이미지 최적화가 **서버 CPU를 씁니다.** 트래픽이 크면 이미지 CDN을 앞에 두거나 `loader`를 커스텀 |
| `unoptimized` | 이미 최적화된 이미지(예: 이미지 CDN 경유)라면 이중 처리 방지 |
| `quality` 화이트리스트 | 최신 Next에서는 사용할 `qualities` 값을 설정에 명시해야 하는 경우가 있음 |
| 정적 export | `output: 'export'` 환경에서는 기본 최적화 로더를 못 써서 별도 로더가 필요 |
| `fill` 사용 시 | 부모에 `position: relative`(또는 absolute/fixed)와 명확한 크기가 있어야 함 |

### 🔥 예상 꼬리질문

**Q. `priority`는 몇 개까지 쓰나요?**
A. **보통 1개, 많아도 2개**입니다. `priority`는 preload를 발생시키는데, 여러 개를 preload하면 서로 대역폭을 뺏어 결국 LCP가 더 느려집니다. "첫 화면에서 가장 큰 이미지 하나"가 원칙입니다.

**Q. `next/image` 없이 순수 `<img>`로 같은 수준을 만들 수 있나요?**
A. 가능합니다. `srcset`/`sizes`/`width`/`height`/`loading`/`fetchpriority`/`<picture>`를 직접 작성하고, 이미지 CDN이나 빌드 스크립트로 리사이즈·포맷 변환을 처리하면 됩니다. `next/image`는 이 반복 작업을 **기본값으로 강제**해 실수를 줄여주는 게 핵심 가치입니다. 이렇게 답하면 "도구를 쓸 줄 안다"가 아니라 "원리를 알고 도구를 고른다"로 들립니다.

**Q. `<Image>`를 썼는데 오히려 느려졌다는 얘기도 있던데요?**
A. 대표적인 원인은 ① `sizes` 미지정으로 과대 이미지 다운로드, ② 첫 화면 이미지에 `priority` 미지정(기본 lazy라 LCP 악화), ③ 셀프 호스팅 환경에서 최적화 서버 병목(첫 요청 지연), ④ AVIF 인코딩이 느려 캐시 미스 시 TTFB 증가입니다. 대부분 설정 문제입니다.

<details><summary>📝 한 줄 요약</summary>
`next/image`는 리사이즈·포맷 변환·srcset·lazy·CLS 방지를 기본값으로 묶어주지만, `sizes`와 `priority`는 개발자가 레이아웃을 알고 직접 정해야 한다.
</details>

---

## D8. 웹폰트는 왜 성능 문제가 되나요? FOIT · FOUT · `font-display` 🔴

### 💬 30초 답변

> "웹폰트는 **CSS를 파싱해서 해당 폰트를 실제로 쓰는 텍스트가 있다는 걸 알아야만** 다운로드가 시작됩니다. 즉 발견 시점이 늦습니다. 게다가 폰트가 도착하기 전까지 브라우저는 텍스트를 어떻게 처리할지 정해야 하는데, 아무것도 안 보여주면 **FOIT(Flash of Invisible Text)**, 대체 폰트로 먼저 보여주고 나중에 바꾸면 **FOUT(Flash of Unstyled Text)**가 됩니다. FOIT는 텍스트가 LCP 요소일 때 **LCP를 직접 악화**시키고, FOUT는 폰트 교체 시 글자 크기가 달라져 **CLS**를 유발합니다. 이 트레이드오프를 제어하는 게 `font-display` 속성입니다."

### 📖 핵심 개념

🎯 **비유**: 손님이 왔는데 정장이 세탁소에서 안 왔습니다. ① 정장 올 때까지 **문을 안 열어준다**(FOIT — 안 보임), ② **평상복으로 일단 맞이하고** 정장 오면 갈아입는다(FOUT — 깜빡임), ③ **0.1초만 기다려 보고** 안 오면 **평상복으로 확정**하고, 도착한 정장은 다음 방문 때 입는다(`optional`).

📌 **`font-display` 값 비교**

브라우저는 폰트 로딩을 세 구간으로 나눠 관리합니다: **블록 기간(block period)** → **교체 기간(swap period)** → **실패(failure)**.

| 값 | 블록 기간 | 교체 기간 | 결과 | 언제 쓰나 |
|-----|----------|----------|------|-----------|
| `auto` | 브라우저 기본(대개 block과 유사) | — | 브라우저 판단 | 명시하는 게 안전 |
| `block` | 약 3초(보이지 않음) | 무한 | FOIT 강함 | 아이콘 폰트처럼 대체 불가능한 경우 |
| **`swap`** | 0초 | 무한 | **FOUT** — 즉시 대체 폰트, 오면 교체 | **본문 텍스트 기본 추천**(LCP 유리) |
| `fallback` | 약 100ms | 약 3초 | 짧은 FOIT + 제한된 교체 | 균형형 |
| `optional` | 약 100ms | **없음** | 늦으면 **아예 안 씀**(다음 방문에 캐시로) | **CLS를 0으로 만들고 싶을 때** |

```css
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/Pretendard-Regular.subset.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;   /* ✅ 명시 필수 */
}
```

📌 **`swap` vs `optional`의 트레이드오프 — 면접 포인트**

| | `swap` | `optional` |
|---|--------|-----------|
| LCP | 좋음 (텍스트가 즉시 보임) | 좋음 |
| CLS | **위험** (교체 시 흔들릴 수 있음) | **0에 가까움** (교체 자체를 안 하거나 극초기에만) |
| 브랜드 일관성 | 항상 웹폰트가 적용됨 | 느린 네트워크의 첫 방문자는 **웹폰트를 못 볼 수 있음** |
| 추천 | 대부분의 본문 | 디자인 타협이 가능하고 CLS가 최우선일 때 |

> 💡 `swap`을 쓰면서 CLS를 없애는 방법이 D10의 `size-adjust`/f-mods입니다. **`swap` + 폰트 메트릭 보정**이 지금 가장 권장되는 조합입니다.

📌 **폰트 발견이 늦는 이유 (워터폴)**

```
HTML 다운로드 → CSS 다운로드 → CSS 파싱 → @font-face 발견
  → 해당 폰트를 쓰는 요소가 실제로 있는지 확인 → 폰트 다운로드 시작
```

CSS는 렌더 블로킹 리소스라 이 체인이 길어집니다. 그래서 **핵심 폰트는 `<link rel="preload" as="font">`로 이 체인을 건너뜁니다.**

### 🔥 예상 꼬리질문

**Q. 폰트가 여러 개인데 다 preload해도 되나요?**
A. 안 됩니다. **첫 화면에서 실제로 쓰이는 1~2개(보통 본문 Regular, 제목 Bold)만** preload하세요. 나머지를 preload하면 LCP 이미지와 대역폭을 다투게 됩니다. 실제로 preload한 폰트를 안 쓰면 콘솔 경고도 뜹니다.

**Q. 폰트 preload에 `crossorigin`이 왜 필요한가요?**
A. 폰트는 **같은 출처라도 CORS 모드(anonymous)로 요청**되도록 명세가 정해져 있습니다. `<link rel="preload" as="font">`에 `crossorigin`을 빠뜨리면 preload한 요청과 실제 폰트 요청의 모드가 달라져 **캐시가 매칭되지 않고 폰트를 두 번 받게 됩니다.** 매우 흔한 실수이고, 면접에서 알면 인상적인 디테일입니다.

```html
<link rel="preload" href="/fonts/Pretendard-Regular.subset.woff2"
      as="font" type="font/woff2" crossorigin />
```

**Q. 아이콘 폰트에는 왜 `block`을 쓰나요?**
A. 아이콘 폰트는 대체 폰트로 렌더링하면 **의미 없는 네모나 엉뚱한 글자**가 보입니다(tofu). 차라리 잠깐 안 보이는 게 낫죠. 다만 요즘은 아이콘 폰트 자체를 **SVG 아이콘으로 대체**하는 게 접근성·성능 양쪽에서 더 낫습니다(D11 참고).

<details><summary>📝 한 줄 요약</summary>
폰트는 발견이 늦어 FOIT(LCP 악화) 또는 FOUT(CLS 유발)를 만들며, `font-display: swap` + preload + 메트릭 보정이 현재의 표준 처방이다.
</details>

---

## D9. 웹폰트를 실전에서 어떻게 최적화하나요? (WOFF2 · 서브셋 · preload · 가변 폰트) 🟡

### 💬 30초 답변

> "네 가지입니다. ① **포맷은 WOFF2만** 씁니다. Brotli 압축 기반이라 WOFF보다 30% 더 작고 지원도 사실상 전부입니다. TTF/EOT/WOFF 폴백을 나열하는 건 이제 **불필요할 뿐 아니라 중복 다운로드 위험**만 만듭니다. ② **서브셋(subset)**으로 안 쓰는 글리프를 제거합니다. **한글 폰트는 완성형 기준 1만 1172자라서 이게 특히 중요합니다** — 서브셋 없이 쓰면 수 MB가 되기도 합니다. ③ **핵심 폰트만 preload**합니다. ④ **가변 폰트(variable font)**를 쓰면 Regular/Medium/Bold를 각각 받는 대신 파일 하나로 모든 굵기를 커버할 수 있습니다."

### 📖 핵심 개념

📌 **① WOFF2만 쓰기**

```css
/* ❌ 옛날 방식 — 불필요하게 복잡하고 위험 */
@font-face {
  font-family: "MyFont";
  src: url("/f.eot"), url("/f.woff2") format("woff2"),
       url("/f.woff") format("woff"), url("/f.ttf") format("truetype");
}

/* ✅ 현대 방식 */
@font-face {
  font-family: "MyFont";
  src: url("/f.woff2") format("woff2");
  font-display: swap;
}
```

📌 **② 서브셋 — 한글의 특수성 (한국 개발자에게 실전 핵심)**

| 언어 | 대략적인 글리프 수 | 서브셋 없는 WOFF2 크기 감각 |
|------|------------------|--------------------------|
| 영문(Latin) | 수백 자 | 20~50KB |
| **한글** | **유니코드 한글 음절 11,172자(U+AC00–U+D7A3) + 자모** | **1~4MB** |

전략은 두 가지입니다.

**(가) 정적 서브셋** — 사이트에서 실제로 쓰는 글자만 남기기. 텍스트가 고정된 랜딩 페이지, 로고 문구 등에 최적. `pyftsubset`(fonttools), `glyphhanger` 같은 도구를 씁니다.

```bash
# 예: 사용 문자 집합만 남겨 woff2로 뽑기
pyftsubset Pretendard-Regular.ttf \
  --text-file=used-chars.txt \
  --flavor=woff2 \
  --layout-features='*' \
  --output-file=Pretendard-Regular.subset.woff2
```

**(나) `unicode-range` 분할(동적 서브셋)** — 폰트를 수십~수백 개 조각으로 나누고 각 조각에 `unicode-range`를 지정하면, **브라우저가 페이지에 실제로 등장하는 문자에 해당하는 조각만 다운로드**합니다. Google Fonts가 이 방식을 씁니다.

```css
/* 한글 서브셋 예시 (조각별로 @font-face를 반복) */
@font-face {
  font-family: "Pretendard";
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/pretendard-subset-45.woff2") format("woff2");
  unicode-range: U+AC00-AC7F; /* 이 범위 글자가 나올 때만 다운로드 */
}
@font-face {
  font-family: "Pretendard";
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/pretendard-subset-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+2000-206F;
}
```

> 💡 **트레이드오프**: 조각이 많아지면 요청 수가 늘어납니다. HTTP/2·HTTP/3의 멀티플렉싱 덕분에 예전만큼 치명적이진 않지만, 조각이 지나치게 잘게 쪼개지면 오버헤드가 생깁니다. 실무에서는 **자주 쓰는 음절 위주로 100개 내외**로 나눈 배포판(예: Pretendard의 dynamic-subset)을 쓰는 경우가 많습니다.

📌 **③ preload + 자체 호스팅**

```html
<link rel="preload" href="/fonts/pretendard-regular.subset.woff2"
      as="font" type="font/woff2" crossorigin />
```

**자체 호스팅(self-hosting)을 권장하는 이유**: 외부 폰트 CDN을 쓰면 DNS+TCP+TLS 핸드셰이크가 추가되고, 브라우저 캐시가 사이트별로 분리(cache partitioning)되어 **"다른 사이트에서 이미 받았으니 빠르다"는 옛날 논리는 더 이상 성립하지 않습니다.** 게다가 유럽에서는 Google Fonts 직접 링크가 GDPR 이슈로 지적된 사례도 있습니다. 자체 호스팅하면 같은 오리진이라 연결 재사용이 가능하고 캐시 헤더도 직접 통제할 수 있습니다.

📌 **④ 가변 폰트(Variable Font)**

```css
@font-face {
  font-family: "PretendardVariable";
  /* 예전 자료의 format("woff2-variations")는 레거시 표기.
     지금은 format("woff2")로 충분하다. */
  src: url("/fonts/PretendardVariable.subset.woff2") format("woff2");
  font-weight: 45 920;   /* 지원하는 굵기 "범위"를 선언 (Pretendard Variable 기준) */
  font-display: swap;
}
h1 { font-weight: 750; } /* 100 단위가 아닌 임의 값도 사용 가능 */
```

| | 정적 폰트 | 가변 폰트 |
|---|----------|----------|
| 파일 수 | 굵기·스타일마다 1개 (Regular/Medium/Bold/Italic…) | **1개** |
| 총 용량 | 3개 쓰면 3배 | 단일 파일이 조금 크지만 **3개 이상 쓰면 대개 이득** |
| 표현력 | 정해진 굵기만 | 연속적인 굵기·너비 (애니메이션 가능) |
| 손익분기 | — | 보통 **굵기 2~3종 이상 쓸 때부터 유리** |

📌 **`next/font`를 쓰는 경우**

```jsx
// app/layout.jsx
import localFont from 'next/font/local';

const pretendard = localFont({
  src: './fonts/PretendardVariable.subset.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
  // 자동으로: 자체 호스팅 + preload + fallback 메트릭 보정(adjustFontFallback)
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}
```

`next/font`의 핵심 가치는 **빌드 타임에 폰트 파일을 자체 호스팅으로 가져오고, preload 링크를 자동 삽입하며, 대체 폰트의 메트릭을 자동 보정(D10)**해 준다는 점입니다. 외부 요청이 0이 되므로 프라이버시·성능 모두 이득입니다.

### 🔥 예상 꼬리질문

**Q. 폰트 파일에 어떤 캐시 헤더를 주나요?**
A. 파일명에 콘텐츠 해시가 들어가 있다면 **`Cache-Control: public, max-age=31536000, immutable`**(1년 + 불변)이 정답입니다. 폰트는 거의 바뀌지 않고, 바뀌면 파일명이 달라지므로 안전합니다. (`2026-07-23_network-http-caching...`의 강한 캐시 전략과 동일한 원리)

**Q. `font-family` 폴백 스택은 어떻게 짜나요?**
A. 웹폰트 → 시스템 한글 폰트 → 제네릭 순으로 씁니다. 한국어 환경에서는 아래 정도가 무난합니다.

```css
body {
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont,
    "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕",
    system-ui, sans-serif;
}
```

**Q. 굵기가 없는데 `font-weight: bold`를 주면 어떻게 되나요?**
A. 브라우저가 **가짜 굵게(faux bold)**를 만듭니다. 글자를 알고리즘으로 두껍게 그리는 건데, 자간·형태가 뭉개져 품질이 떨어지고 폭도 달라져 레이아웃이 흔들립니다. 필요한 굵기의 `@font-face`를 실제로 제공하거나 가변 폰트를 쓰세요. 기울임(faux italic)도 같은 문제가 있습니다.

<details><summary>📝 한 줄 요약</summary>
WOFF2 단일 포맷 + 서브셋(한글은 `unicode-range` 분할이 특히 중요) + 핵심 폰트만 crossorigin preload + 굵기 여러 개면 가변 폰트, 그리고 자체 호스팅.
</details>

---

## D10. 폰트 때문에 생기는 CLS는 어떻게 없애나요? (`size-adjust` · f-mods · `next/font`) 🟡

### 💬 30초 답변

> "`font-display: swap`을 쓰면 대체 폰트로 먼저 그렸다가 웹폰트로 교체되는데, 두 폰트의 **글자 폭과 높이(메트릭)가 다르면 교체 순간 텍스트 블록의 크기가 바뀌면서 레이아웃이 밀립니다.** 해결책은 **대체 폰트의 메트릭을 웹폰트에 맞춰 미리 보정하는 것**입니다. `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` 같은 CSS 속성(f-mods)으로 로컬 시스템 폰트를 감싼 `@font-face`를 만들어 폴백으로 쓰면, 교체가 일어나도 크기가 거의 그대로여서 CLS가 0에 수렴합니다. `next/font`는 이 계산을 자동으로 해 줍니다."

### 📖 핵심 개념

🎯 **비유**: 대역 배우와 주연 배우의 **키와 체격을 맞춰두는 것**입니다. 대역이 등장했다가 주연으로 바뀌어도 카메라 구도를 다시 잡을 필요가 없죠.

📌 **f-mods (font metric overrides)**

| 속성 | 조정 대상 |
|------|----------|
| `size-adjust` | 글리프 전체 크기 배율(%) — 폭·높이 동시 |
| `ascent-override` | 기준선 위 높이 |
| `descent-override` | 기준선 아래 깊이 |
| `line-gap-override` | 줄 간격 |

```css
/* ① 실제 웹폰트 */
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/pretendard-regular.subset.woff2") format("woff2");
  font-display: swap;
}

/* ② 웹폰트에 메트릭을 맞춘 "보정된 폴백" — src에 local()이 반드시 필요 */
@font-face {
  font-family: "Pretendard Fallback";
  src: local("Apple SD Gothic Neo"), local("Malgun Gothic");
  size-adjust: 100.5%;        /* 아래 수치는 예시 — 폰트마다 직접 계산해야 함 */
  ascent-override: 92%;
  descent-override: 22%;
  line-gap-override: 0%;
}

/* ③ 폴백 스택에 보정된 폰트를 넣는다 */
body {
  font-family: "Pretendard", "Pretendard Fallback", sans-serif;
}
```

> ⚠️ 위 수치는 **예시**입니다. 실제 값은 폰트의 `unitsPerEm`, `ascender`, `descender`, 평균 글자 폭 등을 읽어 계산해야 합니다. 직접 하기보다 `next/font`, `fontaine`, `capsize` 같은 도구를 쓰는 게 정확합니다.

📌 **`next/font`가 자동으로 해 주는 것**

```jsx
import { Noto_Sans_KR } from 'next/font/google';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],          // 미리 로드할 서브셋 선택
  weight: ['400', '700'],
  display: 'swap',
  // adjustFontFallback: true (기본값) → 메트릭 보정된 폴백 @font-face를 자동 생성
});
```

> ⚠️ 한글은 글리프가 많아 **Google Fonts 경유 자동 서브셋만으로는 충분히 가볍지 않은 경우가 많습니다.** 실무에서는 직접 서브셋한 파일을 `next/font/local`로 넣는 편(D9의 예시)이 용량과 통제력 양쪽에서 유리한 경우가 흔합니다. 어느 쪽이든 **빌드 결과의 실제 폰트 요청 크기를 Network 패널에서 확인**하고 판단하세요.

빌드 결과 HTML을 보면 `__Noto_Sans_KR_Fallback` 같은 이름의 `@font-face`가 `size-adjust`, `ascent-override`와 함께 자동 삽입돼 있습니다. **이걸 직접 확인해 본 경험을 말하면 면접에서 "도구를 뜯어봤구나"라는 인상을 줍니다.**

📌 **CLS를 줄이는 다른 폰트 전략**

| 전략 | 효과 | 비용 |
|------|------|------|
| f-mods 보정 폴백 | CLS 거의 제거, 웹폰트는 그대로 적용 | 설정 필요(도구로 해결) |
| `font-display: optional` | CLS 0 보장 | 느린 네트워크 첫 방문자는 웹폰트 못 봄 |
| 시스템 폰트만 사용 | CLS 0, 다운로드 0 | 브랜드 타이포그래피 포기 |
| preload로 도착 시점 앞당기기 | 교체가 초기에 일어나 영향 축소 | 대역폭 경쟁 |

### 🔥 예상 꼬리질문

**Q. `size-adjust`만으로 충분하지 않나요?**
A. `size-adjust`는 전체 배율이라 **가로 폭**은 잘 맞출 수 있지만, 줄 높이(line box)를 결정하는 것은 `ascent`/`descent`/`line-gap`입니다. 세로 방향 시프트까지 잡으려면 override 3종을 함께 써야 합니다.

**Q. 폰트 CLS를 어떻게 측정하나요?**
A. Chrome DevTools의 Performance 패널에서 **Experience 트랙의 Layout Shift 항목**을 클릭하면 어떤 요소가 얼마나 움직였는지 보여줍니다. 네트워크를 Slow 4G로 스로틀링하고 캐시를 비운 뒤 재현하면 폰트 교체 시프트를 잘 관찰할 수 있습니다. 코드로는 `PerformanceObserver`로 `layout-shift` 엔트리를 수집합니다.

```js
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.hadRecentInput) continue; // 사용자 입력 직후는 제외
    console.log('shift:', entry.value, entry.sources);
  }
}).observe({ type: 'layout-shift', buffered: true });
```

**Q. `local()`을 안 쓰고 폴백 `@font-face`를 만들면 어떻게 되나요?**
A. `src`가 비어 있으면 그 `@font-face`는 아무 폰트도 참조하지 않아 무시됩니다. **반드시 `local(...)`로 사용자의 시스템에 이미 있는 폰트를 지목**해야 합니다. 그래야 다운로드 없이(0바이트) 메트릭만 보정된 폴백이 만들어집니다.

<details><summary>📝 한 줄 요약</summary>
폰트 CLS는 대체 폰트와 웹폰트의 메트릭 차이 때문이며, `local()` + `size-adjust`/`ascent-override`로 보정된 폴백을 만들면(또는 `next/font`에 맡기면) 사실상 제거된다.
</details>

---

## D11. SVG·아이콘·비디오는 어떻게 다루나요? 🟡

### 💬 30초 답변

> "아이콘은 **아이콘 폰트 대신 SVG**가 현대적인 정답입니다. 아이콘 폰트는 글리프 전체를 받아야 하고, 폰트 로딩 실패 시 네모(tofu)가 보이며, 스크린리더가 엉뚱한 문자로 읽는 접근성 문제가 있습니다. SVG는 필요한 것만 인라인하거나 스프라이트로 묶고, `currentColor`로 CSS 색상 제어도 됩니다. 비디오는 **GIF를 절대 쓰지 말고** MP4(H.264)/WebM으로 대체합니다 — 같은 애니메이션이 GIF 대비 10분의 1 이하로 줄어드는 경우가 흔합니다. 그리고 자동재생 배경 비디오에는 `preload="none"` 또는 `metadata` + `poster`로 초기 로드를 줄입니다."

### 📖 핵심 개념

📌 **SVG 사용 방식 3가지 비교**

| 방식 | 예 | 장점 | 단점 |
|------|-----|------|------|
| **인라인 SVG** | `<svg>...</svg>`를 JSX에 직접 | CSS·JS로 조작 가능(`fill: currentColor`), 요청 0 | HTML 크기 증가, 반복되면 중복 |
| **`<img src="icon.svg">`** | 이미지처럼 사용 | 브라우저 캐시, HTML 깔끔 | 내부 스타일 조작 불가 |
| **SVG 스프라이트** | `<use href="/sprite.svg#check">` | 한 파일로 캐시 + 재사용 | 설정 필요, 크로스 오리진 제약 |

```jsx
// React에서 인라인 SVG 아이콘 — 접근성까지 챙긴 형태
function CheckIcon({ label }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      // 장식용이면 화면에서 숨김, 의미가 있으면 role+label
      {...(label
        ? { role: 'img', 'aria-label': label }
        : { 'aria-hidden': 'true', focusable: 'false' })}
    >
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

> 💡 `stroke="currentColor"` 또는 `fill="currentColor"`를 쓰면 부모의 `color` 값을 그대로 따라가서 호버·다크모드 대응이 CSS만으로 됩니다.

📌 **SVG 최적화**
- **SVGO**로 에디터가 남긴 메타데이터·주석·불필요한 소수점을 제거하면 보통 30~60% 줄어듭니다.
- `viewBox`는 유지하고 고정 `width`/`height`는 제거해 CSS로 크기를 제어하면 재사용성이 좋아집니다.
- 서버에서 SVG는 **gzip/brotli 압축이 잘 먹는 텍스트**입니다. `Content-Encoding` 설정을 확인하세요.
- ⚠️ **사용자 업로드 SVG를 인라인하지 마세요.** `<script>`, `onload` 속성 등으로 XSS가 가능합니다. 꼭 필요하면 DOMPurify로 정제하거나 `<img>`로만 렌더링(스크립트 실행 안 됨)합니다.

📌 **GIF → 비디오 대체**

```html
<!-- ① 첫 화면에 보이는 자동재생 배경/데모 영상: GIF 대신
     poster: 로드 전 보일 이미지 (LCP 후보이자 CLS 방지)
     ⚠️ autoplay가 있으면 preload 힌트는 무시된다 — 어차피 버퍼링해야 하므로. -->
<video autoplay muted loop playsinline
       poster="/demo-poster.webp" width="800" height="450">
  <source src="/demo.webm" type="video/webm" />  <!-- 더 작음, 우선 -->
  <source src="/demo.mp4" type="video/mp4" />    <!-- 호환성 폴백 -->
</video>

<!-- ② 첫 화면 밖의 영상: autoplay를 빼고 preload="none" + poster로 초기 비용 0에 가깝게.
     실제 재생은 IntersectionObserver로 뷰포트 진입 시 play()하거나 사용자 클릭으로. -->
<video muted loop playsinline preload="none"
       poster="/demo-poster.webp" width="800" height="450" controls>
  <source src="/demo.webm" type="video/webm" />
  <source src="/demo.mp4" type="video/mp4" />
</video>
```

| `preload` 값 | 동작 |
|-------------|------|
| `none` | 아무것도 미리 안 받음 — 첫 화면 밖 비디오에 적합 |
| `metadata` | 길이·크기 정보만 — 기본 추천 |
| `auto` | 브라우저 판단으로 많이 받음 — 대역폭 낭비 위험 |

> ⚠️ 모바일 자동재생은 **`muted`와 `playsinline`이 둘 다 있어야** 동작합니다. `playsinline`이 없으면 iOS에서 전체화면으로 튀어나옵니다.

### 🔥 예상 꼬리질문

**Q. 아이콘이 수백 개인데 전부 인라인하면 번들이 커지지 않나요?**
A. 커집니다. 그래서 실무에서는 ① 트리셰이킹 가능한 아이콘 라이브러리(`lucide-react` 등)를 **개별 import**해서 쓰는 실제 사용분만 번들에 넣거나, ② SVG 스프라이트 파일 하나로 묶어 브라우저 캐시를 활용합니다. (`2026-07-26_build-bundling...`의 트리셰이킹과 연결)

**Q. 다크 모드에서 이미지를 바꾸려면?**
A. `<picture>`의 `media`에 `prefers-color-scheme`를 쓸 수 있습니다.

```html
<picture>
  <source srcset="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
  <img src="/logo-light.svg" alt="회사 로고" width="120" height="32" />
</picture>
```

**Q. `alt`는 어떻게 써야 하나요?**
A. **의미를 전달하는 이미지**에는 그 의미를 문장으로 씁니다("여름 세일 30% 할인 배너"). **순수 장식용**이면 `alt=""`(빈 문자열)로 둬서 스크린리더가 건너뛰게 합니다. `alt` 속성 자체를 생략하면 스크린리더가 파일명을 읽어버리는 최악의 경우가 생깁니다. ("이미지"라는 단어는 넣지 않습니다 — 스크린리더가 이미 "그래픽"이라고 알려줍니다.) 자세한 건 `2026-07-17_web-accessibility-aria.md` 참고.

<details><summary>📝 한 줄 요약</summary>
아이콘은 아이콘 폰트 대신 SVG(+`currentColor`, `aria-hidden`), GIF는 반드시 WebM/MP4 비디오로 대체하고 `poster`·`preload`로 초기 비용을 통제한다.
</details>

---

## D12. 최적화를 어떻게 측정하고 증명하나요? 🟡

### 💬 30초 답변

> "**측정 없는 최적화는 추측**입니다. 저는 ① Lighthouse나 PageSpeed Insights로 **실험실 데이터(lab)**를 먼저 보고 개선 항목을 잡은 뒤, ② DevTools Network·Performance 패널에서 **실제 어떤 파일이 몇 KB로 언제 받아지는지** 확인하고, ③ 배포 후에는 `web-vitals` 라이브러리로 **실사용자 데이터(RUM/field)**를 수집해 검증합니다. 중요한 건 lab과 field가 다를 수 있다는 점입니다. Lighthouse는 특정 조건의 1회 측정이라, 실제 사용자의 느린 네트워크·저사양 기기 분포를 반영하지 못합니다. 그래서 최종 판단은 **field 데이터의 75퍼센타일**로 합니다."

### 📖 핵심 개념

📌 **측정 도구 지도**

| 도구 | 종류 | 무엇에 좋은가 |
|------|------|--------------|
| Lighthouse (DevTools) | Lab | 빠른 진단, 개선 항목 리스트 |
| PageSpeed Insights | Lab + Field(CrUX) | 실사용자 데이터와 함께 비교 |
| DevTools Network 패널 | Lab | 실제 다운로드된 파일·크기·우선순위 확인 |
| DevTools Performance 패널 | Lab | LCP 요소, layout shift 원인 추적 |
| WebPageTest | Lab | 워터폴 상세, 필름스트립, 다양한 지역/기기 |
| `web-vitals` (npm) | Field(RUM) | **실사용자** LCP/INP/CLS 수집 |

📌 **실사용자 지표 수집 (RUM)**

```js
import { onLCP, onINP, onCLS } from 'web-vitals';

function send(metric) {
  // sendBeacon: 페이지 이탈 중에도 유실 없이 전송
  const body = JSON.stringify({
    name: metric.name,          // 'LCP' | 'INP' | 'CLS'
    value: metric.value,
    rating: metric.rating,      // 'good' | 'needs-improvement' | 'poor'
    id: metric.id,
    path: location.pathname,
  });
  navigator.sendBeacon?.('/api/vitals', body);
}

onLCP(send);
onINP(send);
onCLS(send);
```

📌 **Core Web Vitals 임계값 (2026년 8월 기준)**

| 지표 | Good | Needs improvement | Poor |
|------|------|-------------------|------|
| **LCP** (로딩) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP** (반응성) | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** (안정성) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

> 기준은 **75퍼센타일**입니다. "사용자의 75%가 Good을 경험해야 Good"이라는 뜻입니다. 참고로 INP는 2024년 3월에 FID를 대체해 정식 Core Web Vital이 되었습니다.

📌 **에셋 관점 체크리스트 (그대로 외워서 말해도 좋은 순서)**

**이미지**
- [ ] 첫 화면 LCP 이미지에 `fetchpriority="high"`, `loading="lazy"` 제거(또는 `priority`)
- [ ] 그 외 이미지에 `loading="lazy"` + `decoding="async"`
- [ ] 모든 `<img>`에 `width`/`height`(또는 컨테이너 `aspect-ratio`)
- [ ] `srcset` + **정확한 `sizes`**
- [ ] WebP 기본, 핵심 이미지 AVIF, 벡터는 SVG
- [ ] 품질 75~85, 원본 그대로 업로드 금지
- [ ] GIF → 비디오 대체
- [ ] 의미 있는 `alt`, 장식은 `alt=""`

**폰트**
- [ ] WOFF2 단일 포맷, 자체 호스팅
- [ ] 서브셋(한글은 `unicode-range` 분할)
- [ ] `font-display: swap` 명시
- [ ] 핵심 1~2개만 `preload` + **`crossorigin`**
- [ ] 폴백 메트릭 보정(`size-adjust` 등) 또는 `next/font`
- [ ] 굵기 3종 이상이면 가변 폰트 검토
- [ ] `Cache-Control: max-age=31536000, immutable`

**검증**
- [ ] DevTools Network에서 **실제로 선택된 파일과 크기** 확인
- [ ] Slow 4G + 캐시 비움으로 재현
- [ ] 배포 후 field 데이터로 재확인

### 🔥 예상 꼬리질문

**Q. Lighthouse 점수가 90점인데 사용자들은 느리다고 합니다. 왜죠?**
A. Lighthouse는 **특정 조건에서의 1회 실험실 측정**입니다. ① 실제 사용자는 더 느린 기기·네트워크일 수 있고, ② 로그인 후 데이터가 많은 화면은 측정되지 않았을 수 있고, ③ Lighthouse는 초기 로딩 위주라 **로그인 후 상호작용(INP)** 문제를 놓칠 수 있고, ④ 지역별 CDN 커버리지 차이도 있습니다. 그래서 field 데이터(CrUX/자체 RUM)로 교차 검증해야 합니다.

**Q. 최적화 작업의 우선순위를 어떻게 정하나요?**
A. **효과 ÷ 비용**으로 정렬합니다. 보통 ① LCP 이미지 우선순위 조정(속성 한 줄, 효과 큼) → ② 이미지 포맷·크기 정리 → ③ 폰트 preload와 서브셋 → ④ 코드 스플리팅 → ⑤ 서버·CDN 튜닝 순입니다. 면접에서 "가장 먼저 무엇을 하시겠어요?"에는 "**먼저 측정해서 LCP 요소가 무엇인지 확인하고, 그 요소의 발견·우선순위·크기 순으로 봅니다**"라고 답하면 좋습니다.

**Q. 성능 회귀(regression)를 어떻게 막나요?**
A. CI에 **Lighthouse CI**나 **번들 사이즈 예산(performance budget)** 체크를 넣습니다. 예를 들어 "이미지 총합 500KB 초과 시 빌드 실패", "LCP 2.5s 초과 시 PR 경고" 같은 규칙을 두면 팀 차원에서 유지됩니다. (`2026-08-02_git-collaboration...`의 PR 리뷰 프로세스와 연결)

<details><summary>📝 한 줄 요약</summary>
Lab(Lighthouse/DevTools)으로 진단하고 Field(web-vitals RUM, 75퍼센타일)로 검증하며, CI에 성능 예산을 걸어 회귀를 막는다.
</details>

---

## 🎯 오늘의 핵심 6문장 (면접 직전 암기)

1. **페이지 무게의 대부분은 이미지·폰트이고, Core Web Vitals의 LCP·CLS는 사실상 에셋 문제다.** 그래서 성능 개선은 여기서 시작한다.
2. **이미지는 벡터면 SVG, 사진이면 AVIF → WebP → JPEG 폴백**을 깔고 품질은 75~85로, `srcset` + **정확한 `sizes`**로 뷰포트×DPR에 맞는 크기만 내려보낸다.
3. **첫 화면 이미지에는 `lazy`를 걸지 않고 `fetchpriority="high"`를, 나머지에는 `loading="lazy"`를** 준다. 덜 중요한 첫 화면 이미지는 오히려 `fetchpriority="low"`로 낮춘다.
4. **모든 `<img>`에 `width`/`height`를 적어** 브라우저가 `aspect-ratio`로 자리를 예약하게 하면 이미지 CLS는 사라진다.
5. **폰트는 WOFF2 단일 포맷 + 서브셋(한글은 `unicode-range` 분할) + `font-display: swap` + 핵심 1~2개만 `crossorigin` preload**, 그리고 `size-adjust` 계열로 폴백 메트릭을 보정해 교체 시프트를 없앤다.
6. **측정 없는 최적화는 추측이다.** Lab(Lighthouse·DevTools)으로 진단하고, Field(web-vitals 75퍼센타일)로 증명한다.

---

## 🔗 함께 보면 좋은 자료

| 문서 | 연결 지점 |
|------|----------|
| `2026-07-20_browser-rendering-performance.md` | Critical Rendering Path, LCP·CLS·INP의 정의 — 오늘 문서는 그 지표를 **에셋 레벨에서 개선하는 실무** |
| `2026-07-23_network-http-caching-http2-http3-cors.md` | 이미지·폰트의 `Cache-Control`, 멀티플렉싱과 우선순위, `preconnect` |
| `2026-07-26_build-bundling-treeshaking-codesplitting.md` | JS 바이트 줄이기 ↔ 오늘은 에셋 바이트 줄이기, 아이콘 트리셰이킹 |
| `2026-07-17_web-accessibility-aria.md` | `alt` 작성 원칙, 장식 이미지 처리, SVG 아이콘의 `aria-hidden` |
| `2026-07-21_web-security-xss-csrf-csp.md` | 사용자 업로드 SVG의 XSS 위험 |
| `2026-08-15_web-worker-service-worker-pwa.md` | Service Worker의 이미지·폰트 캐싱 전략(Cache First) |
| `2026-07-25_nextjs-caching-streaming-isr-ppr.md` | `next/image` 최적화 결과 캐싱, Next의 캐시 계층 |
| `interview/1.html.md` Q14 · `interview/5.common.md` Q85·Q99 | `srcset` 기본, 로딩 성능 개요, Core Web Vitals 기본 개념의 심화판 |

---

> 📅 작성일: 2026-08-18
> 🏷️ 분류: 브라우저 렌더링/성능 · 웹 표준 · Next.js
