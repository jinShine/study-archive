# 프론트엔드 테스트 심화 (테스트 피라미드 · RTL · Playwright)

> 주제: 신입~주니어 프론트엔드가 면접에서 "테스트 코드 짜봤어요"를 넘어 "무엇을·어느 레벨에서·왜 테스트하는지 전략적으로 설계할 줄 안다"를 보여주는 심화 — 테스트 피라미드/트로피, 단위/통합/E2E의 경계, Vitest·Jest 환경, React Testing Library의 철학(구현이 아닌 동작을 테스트)과 쿼리 우선순위, `userEvent` vs `fireEvent`, 비동기 테스트(`findBy`·`waitFor`)와 MSW 목킹, Playwright E2E(자동 대기·웹 우선 단언·로케이터), 플레이키 테스트 원인과 해결
> 출처: 일일 심화 자료 (기존 5.common.md Q97 "TDD 기법"의 심화 통합·확장편 · daily 미다룸 신규 영역)
>
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화
>
> ⚙️ 기준 버전: React Testing Library 14+, Playwright 1.4x, Vitest 1.x / Jest 29 (2025년 기준 안정 버전). API는 안정적이지만 실무 도입 시 각 라이브러리 최신 문서 확인 권장.

---

## 📑 목차

1. [왜 테스트를 하는가 · 테스트 피라미드와 트로피 🔴](#q1)
2. [단위 vs 통합 vs E2E — 경계와 선택 기준 🔴](#q2)
3. [테스트 환경: Vitest vs Jest, jsdom의 정체 🟡](#q3)
4. [React Testing Library의 철학: 구현이 아닌 동작을 테스트하라 🔴](#q4)
5. [쿼리 우선순위: `getByRole`을 먼저 쓰는 이유 🔴](#q5)
6. [`getBy` vs `queryBy` vs `findBy` — 3형제 구분 🔴](#q6)
7. [`userEvent` vs `fireEvent` — 왜 userEvent가 권장되는가 🔴](#q7)
8. [비동기 테스트와 API 목킹(MSW) 🔴](#q8)
9. [Playwright로 하는 E2E: 자동 대기와 웹 우선 단언 🟡](#q9)
10. [플레이키(flaky) 테스트: 원인과 해결 🟢](#q10)
11. [무엇을 테스트하고 무엇을 하지 말아야 하는가 🟡](#q11)

---

<a id="q1"></a>
## Q1. 프론트엔드에서 테스트는 왜 하고, 어떤 종류를 어떤 비율로 짜야 하나요? 🔴

### 💬 30초 답변
테스트의 목적은 "코드가 깨졌는지"가 아니라 **"사용자에게 중요한 동작이 여전히 작동하는지"를 자동으로 보장**하는 것입니다. 리팩터링·기능 추가 시 회귀(regression)를 잡아주는 안전망이죠. 전통적으로는 빠르고 싼 단위 테스트를 가장 많이, 느리고 비싼 E2E를 가장 적게 쌓는 **테스트 피라미드**를 따르지만, 프론트엔드에서는 Kent C. Dodds가 제안한 **테스트 트로피**(통합 테스트 중심)가 더 현실적이라는 관점이 널리 받아들여집니다.

### 📖 핵심 개념

**🎯 비유 — 자동차 공장의 품질 검사**
부품 하나하나 검사(단위)만 하면 조립했을 때 안 맞을 수 있고, 완성차 시운전(E2E)만 하면 어디가 문제인지 못 찾고 느립니다. 그래서 "부품 몇 개를 조립한 모듈 단위 검사(통합)"에 무게를 둡니다. 프론트엔드 컴포넌트는 홀로 존재하지 않고 서로 맞물려 동작하므로, 이 조립 단위 검사가 가장 가성비가 좋습니다.

**📌 테스트 피라미드 (전통)**

```
        /\        E2E        (적게 · 느림 · 비쌈 · 신뢰도 높음)
       /  \       ─────
      /    \      Integration
     /      \     ─────
    /________\    Unit       (많이 · 빠름 · 쌈 · 신뢰도 낮음)
```

**📌 테스트 트로피 (프론트엔드 현실, Kent C. Dodds)**

```
   E2E          🏆  (소량)
   Integration  ███████  ← 여기에 가장 큰 투자 (ROI 최고)
   Unit         ███
   Static       ██  ← TypeScript · ESLint (테스트 이전의 1차 방어선)
```

- 핵심 주장: **"테스트가 실제 사용자의 사용 방식과 닮을수록 더 큰 신뢰를 준다"** (The more your tests resemble the way your software is used, the more confidence they can give you.)
- Static(정적 분석): TypeScript 타입 체크, ESLint. 테스트를 돌리기도 전에 오타·타입 오류를 잡는 가장 싼 방어선.

**📌 왜 프론트는 통합 중심인가?**
컴포넌트를 완전히 격리해 단위로만 테스트하면 mock이 너무 많아지고, mock이 실제와 어긋나면 "테스트는 통과하는데 앱은 깨지는" 상황이 생깁니다. 반대로 여러 컴포넌트를 실제로 렌더링해 상호작용을 검증하는 통합 테스트가, 유지보수 비용 대비 잡아내는 버그가 훨씬 많습니다.

### 🔥 예상 꼬리질문

**Q. 테스트 커버리지 100%를 목표로 해야 하나요?**
A. 아니요. 커버리지는 "실행된 코드 라인 비율"일 뿐 "올바르게 검증됐는지"를 보장하지 않습니다. 100%를 강제하면 의미 없는 테스트(getter 호출만 하는 등)를 양산하게 됩니다. 대신 **핵심 비즈니스 로직·자주 바뀌는 부분·버그가 났던 부분**에 집중하는 게 실용적입니다.

**Q. TDD(테스트 주도 개발)는 뭔가요?**
A. Red(실패하는 테스트 먼저 작성) → Green(테스트를 통과시키는 최소 코드) → Refactor(정리) 사이클을 반복하는 방식입니다. 요구사항을 테스트로 먼저 명세하므로 설계가 명확해지고 과도한 구현을 막아줍니다. 다만 UI가 자주 바뀌는 탐색 단계에서는 오히려 비효율적일 수 있어, 로직이 확정된 부분에 선택적으로 적용하는 경우가 많습니다.

<details><summary>📝 한 줄 요약</summary>
테스트는 회귀를 잡는 안전망이며, 프론트엔드에서는 "사용자 사용 방식을 닮은" 통합 테스트에 가장 크게 투자하는 테스트 트로피가 현실적이다.
</details>

---

<a id="q2"></a>
## Q2. 단위·통합·E2E 테스트의 차이와 각각 언제 쓰나요? 🔴

### 💬 30초 답변
**단위(Unit)**는 함수·훅 하나를 격리해서, **통합(Integration)**은 여러 컴포넌트가 함께 동작하는 화면 단위를, **E2E(End-to-End)**는 실제 브라우저에서 사용자 시나리오 전체를 검증합니다. 속도·격리도는 단위 > 통합 > E2E 순으로 낮아지지만, "실제 동작에 대한 신뢰도"는 반대 순서로 높아집니다.

### 📖 핵심 개념

| 구분 | 대상 | 도구 예시 | 속도 | 신뢰도 | 대표 예 |
|------|------|-----------|------|--------|---------|
| 단위 | 순수 함수, 커스텀 훅, 유틸 | Vitest/Jest, RTL(`renderHook`) | ⚡️매우 빠름 | 낮음 | `formatPrice(1000)` → `"1,000원"` |
| 통합 | 여러 컴포넌트 조합, 페이지 | RTL + jsdom + MSW | 빠름 | 중간 | 로그인 폼 입력→제출→에러 메시지 표시 |
| E2E | 실제 브라우저 + 실제/스텁 서버 | Playwright, Cypress | 느림 | 높음 | 회원가입→결제→주문완료 전체 플로우 |

**🎯 비유 — 요리**
- 단위: 소금이 짠지 맛보기 (재료 하나)
- 통합: 국물 간을 보기 (여러 재료가 어우러진 상태)
- E2E: 손님에게 코스 전체를 서빙하고 반응 보기 (실제 경험)

**📌 판단 기준 (실무 감각)**
- 순수 계산 로직(할인 계산, 날짜 포맷) → **단위**
- "버튼 누르면 목록이 갱신된다" 같은 컴포넌트 상호작용 → **통합**
- "로그인 안 하면 결제 페이지 접근 시 로그인으로 리다이렉트" 같은 라우팅·인증 흐름 → **E2E**

### 🔥 예상 꼬리질문

**Q. 스냅샷(snapshot) 테스트는 어디에 속하나요?**
A. 렌더 결과를 문자열로 저장해두고 다음 실행 때 비교하는 방식으로, 넓게는 단위/통합에 걸칩니다. 의도치 않은 UI 변화를 감지할 수 있지만, 작은 변경에도 자주 깨지고 개발자가 내용을 보지 않고 습관적으로 `--update` 해버리는 문제(rubber-stamping)가 있어 **큰 컴포넌트 전체 스냅샷은 지양**하고, 꼭 필요하면 작은 단위나 직렬화된 데이터에만 쓰는 게 좋습니다.

**Q. E2E를 많이 짜면 안 되는 이유는?**
A. 실행이 느리고(수초~수분), 네트워크·타이밍에 의존해 플레이키해지기 쉬우며, 실패 시 원인 파악(디버깅) 비용이 큽니다. 그래서 "핵심 해피 패스 몇 개"에 한정합니다.

<details><summary>📝 한 줄 요약</summary>
단위는 격리된 로직, 통합은 컴포넌트 상호작용, E2E는 실제 브라우저의 전체 시나리오를 검증하며, 속도와 신뢰도는 트레이드오프 관계다.
</details>

---

<a id="q3"></a>
## Q3. Vitest와 Jest의 차이, 그리고 jsdom은 무엇인가요? 🟡

### 💬 30초 답변
둘 다 테스트 러너/프레임워크로 API가 거의 호환됩니다. **Jest**는 오랜 표준이지만 자체 트랜스파일러 설정이 무겁고, **Vitest**는 Vite 기반이라 **ESM·TypeScript를 별도 설정 없이 빠르게** 처리하고 HMR처럼 변경분만 재실행합니다. 프론트엔드 테스트는 브라우저가 없는 Node 환경에서 도는데, `document`·`window` 같은 DOM API를 흉내 내주는 게 **jsdom**입니다.

### 📖 핵심 개념

**📌 Vitest vs Jest**

| 항목 | Jest | Vitest |
|------|------|--------|
| 기반 | 자체(babel/ts-jest) | Vite(esbuild) |
| ESM 지원 | 설정 까다로움 | 네이티브 |
| 속도 | 느린 편 | 빠름(변경분 watch) |
| 설정 | 별도(jest.config) | vite.config 재사용 |
| API | `describe/it/expect/jest.fn` | 거의 동일(`vi.fn`) |

- Vite로 만든 프로젝트(React+Vite, SvelteKit 등)라면 Vitest가 설정 공유 측면에서 유리. Next.js/CRA 계열은 여전히 Jest가 많음.

**📌 jsdom의 정체와 한계**
- jsdom = 순수 JavaScript로 구현한 브라우저 DOM 시뮬레이터. `render`한 컴포넌트를 실제 화면 없이 메모리상에서 DOM 트리로 만들어 검증하게 해줍니다.
- **한계**: 실제 렌더링 엔진이 아니므로 **레이아웃/그리기가 없습니다.** 즉 `getComputedStyle`로 실제 픽셀 크기, `IntersectionObserver`, `scrollTo`, 캔버스, 실제 CSS 적용 여부 등은 제대로 동작하지 않거나 mock이 필요합니다. → 이런 시각적/브라우저 의존 동작은 **E2E(Playwright)**로 넘겨야 합니다.

```js
// 기본 구조 (Vitest/Jest 공통)
import { describe, it, expect } from 'vitest' // 또는 '@jest/globals'

describe('formatPrice', () => {
  it('세 자리마다 콤마를 찍고 원을 붙인다', () => {
    expect(formatPrice(1000000)).toBe('1,000,000원')
  })
})
```

### 🔥 예상 꼬리질문

**Q. `jest.fn()` / `vi.fn()`은 뭔가요?**
A. **모의 함수(mock function)**입니다. 실제 구현 대신 넣어두고 "몇 번 호출됐는지, 어떤 인자로 호출됐는지"를 기록합니다. 예: `onClick`이 클릭 시 호출되는지 `expect(onClick).toHaveBeenCalledTimes(1)`로 검증.

**Q. jsdom에서 `IntersectionObserver`를 쓰는 컴포넌트를 테스트하려면?**
A. jsdom에 없으므로 전역에 mock을 심어줘야 합니다(`global.IntersectionObserver = vi.fn()...`). 다만 이런 케이스가 많다면 그 동작 자체는 E2E로 검증하는 게 더 정확합니다.

<details><summary>📝 한 줄 요약</summary>
Vitest는 Vite 기반의 빠른 최신 러너, Jest는 성숙한 표준이며, 둘 다 실제 브라우저 없이 DOM을 흉내 내는 jsdom 위에서 돌지만 jsdom은 레이아웃/시각 동작을 지원하지 않는다.
</details>

---

<a id="q4"></a>
## Q4. React Testing Library(RTL)의 핵심 철학은 무엇인가요? 🔴

### 💬 30초 답변
**"구현 세부사항(implementation details)이 아니라 사용자가 보고 겪는 동작을 테스트하라"**입니다. state 값이나 내부 함수 이름 같은 걸 직접 들여다보지 않고, 화면에 렌더된 결과와 사용자 상호작용(클릭·입력) 관점에서 검증합니다. 그래서 내부 구현을 리팩터링해도 동작이 같으면 테스트가 깨지지 않습니다.

### 📖 핵심 개념

**🎯 비유 — 자판기 테스트**
자판기가 잘 작동하는지 볼 때, 내부 회로 배선을 뜯어보는(구현) 게 아니라 "500원 넣고 콜라 버튼 누르면 콜라가 나온다"(동작)를 확인합니다. 내부 부품을 바꿔도 이 동작만 같으면 사용자에겐 정상입니다. RTL은 이 관점을 강제합니다.

**📌 "구현 세부사항"을 테스트하면 왜 나쁜가**
- 예전 Enzyme 방식: `wrapper.state('count')`, `wrapper.instance().handleClick()`처럼 내부에 접근.
- 문제 1 (false negative): 리팩터링만 해도(useState→useReducer) 동작은 같은데 테스트가 깨짐 → 신뢰 저하.
- 문제 2 (false positive): 내부 상태는 맞는데 실제 화면엔 안 그려질 수도 있어 통과하지만 버그.

**📌 RTL이 제공하는 것**
- `render(<Component />)`: 컴포넌트를 jsdom에 렌더.
- `screen`: 렌더된 문서에서 요소를 찾는 쿼리들(`screen.getByRole` 등).
- 접근성 트리 기준으로 요소를 찾게 유도 → 테스트를 잘 짜면 **접근성도 자연히 좋아지는** 부수효과.

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Counter from './Counter'

it('버튼을 누르면 카운트가 1 증가한다', async () => {
  const user = userEvent.setup()
  render(<Counter />)

  // 내부 state가 아니라 "화면에 보이는 텍스트"로 검증
  expect(screen.getByText('count: 0')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: '증가' }))

  expect(screen.getByText('count: 1')).toBeInTheDocument()
})
```

### 🔥 예상 꼬리질문

**Q. 그럼 커스텀 훅은 어떻게 테스트하나요? state를 못 본다면서요.**
A. 훅은 UI가 없으니 예외적으로 `@testing-library/react`의 `renderHook`을 씁니다. `const { result } = renderHook(() => useCounter())` 후 `act()`로 상태 변경을 감싸고 `result.current`로 반환값을 검증합니다. 이건 "훅의 공개 API(반환값)"를 보는 것이라 여전히 구현 세부사항 회피 원칙과 맞습니다.

**Q. `data-testid`는 써도 되나요?**
A. 최후의 수단입니다. role·label·text로 도저히 특정할 수 없는 경우에만 쓰세요. 남용하면 "사용자가 인식하는 방식"과 멀어지고, 접근성 개선 유도 효과도 사라집니다.

<details><summary>📝 한 줄 요약</summary>
RTL은 내부 state/함수가 아니라 사용자가 보고 조작하는 동작을 테스트하게 강제해, 리팩터링에 강하고 접근성까지 챙기는 테스트를 유도한다.
</details>

---

<a id="q5"></a>
## Q5. RTL 쿼리 우선순위는 어떻게 되고, 왜 `getByRole`을 먼저 쓰나요? 🔴

### 💬 30초 답변
RTL은 "사용자가 요소를 인식하는 방식"에 가까운 순서로 쿼리 우선순위를 권장합니다. **① 모두가 접근 가능한 쿼리(`getByRole` → `getByLabelText` → `getByText` 등) → ② 시맨틱 쿼리(`getByAltText`, `getByTitle`) → ③ 최후의 `getByTestId`** 순입니다. `getByRole`을 최우선으로 두는 이유는 스크린리더 사용자를 포함한 **모든 사용자가 요소를 인식하는 방식**과 가장 일치하기 때문입니다.

### 📖 핵심 개념

**📌 우선순위 순서 (위일수록 권장)**

1. **접근 가능한 쿼리 (Accessible to everyone)**
   - `getByRole` — 버튼, 링크, 제목 등 ARIA role 기반. `{ name }` 옵션으로 접근성 이름까지 특정. **1순위.**
   - `getByLabelText` — 폼 필드(label과 연결된 input)에 최적.
   - `getByPlaceholderText` — label이 없을 때 차선.
   - `getByText` — 버튼 아닌 일반 텍스트(문단, div 등).
   - `getByDisplayValue` — 값이 채워진 input.
2. **시맨틱 쿼리**
   - `getByAltText`(이미지), `getByTitle`.
3. **테스트 ID**
   - `getByTestId` — 사용자에게 안 보이는 속성. 정말 방법이 없을 때만.

**🎯 비유 — 길 안내**
"저 빨간 지붕 건물"(role/text, 누구나 인식)로 안내하지, "3번째 블록의 좌표 X"(testid, 내부용 표식)로 안내하지 않습니다. 사람이 실제로 인식하는 단서를 쓰는 게 좋은 안내입니다.

```jsx
// ❌ 나쁨: 구현/내부 표식에 의존
screen.getByTestId('submit-btn')
container.querySelector('.btn-primary')

// ✅ 좋음: 사용자가 인식하는 방식
screen.getByRole('button', { name: '제출' })
screen.getByLabelText('이메일')
screen.getByRole('heading', { name: '로그인', level: 1 })
```

**📌 왜 role이 접근성을 끌어올리는가**
`getByRole('button', { name: '제출' })`이 통과하려면 실제로 `<button>`이거나 `role="button"`이고 접근성 이름이 있어야 합니다. 즉 테스트를 role 기준으로 짜면, 자연스럽게 시맨틱 마크업과 label을 갖추게 되어 스크린리더 사용자 경험이 좋아집니다. (7/17 접근성 자료와 직접 연결됩니다.)

### 🔥 예상 꼬리질문

**Q. 어떤 요소가 무슨 role인지 어떻게 아나요?**
A. `screen.logTestingPlaygroundURL()`을 호출하거나, 에러 메시지에 RTL이 "이 요소는 이런 role/쿼리로 찾을 수 있다"고 후보를 출력해줍니다. Testing Playground 확장/사이트로도 확인할 수 있습니다.

**Q. `getByRole`이 느리다는데 사실인가요?**
A. 접근성 트리를 계산하므로 `getByTestId`보다는 느립니다. 하지만 대부분의 테스트에선 체감 차이가 미미하고, 얻는 신뢰도·접근성 이득이 훨씬 큽니다. 성능이 정말 문제되는 대규모 스위트에서만 국소적으로 고려하세요.

<details><summary>📝 한 줄 요약</summary>
쿼리는 `getByRole`을 최우선으로, testId를 최후로 쓰며, role 기반 쿼리는 사용자 인식 방식과 일치할 뿐 아니라 시맨틱 마크업·접근성을 자연히 개선한다.
</details>

---

<a id="q6"></a>
## Q6. `getBy`, `queryBy`, `findBy`는 어떻게 다른가요? 🔴

### 💬 30초 답변
세 접두사는 **① 요소가 없을 때 동작**과 **② 비동기 여부**로 갈립니다. `getBy`는 없으면 즉시 에러(존재 단언용), `queryBy`는 없으면 `null` 반환(부재 단언용), `findBy`는 Promise를 반환해 요소가 나타날 때까지 기다립니다(비동기 등장용). 각각 `getAllBy/queryAllBy/findAllBy` 복수형이 있습니다.

### 📖 핵심 개념

| 접두사 | 요소 있음 | 요소 없음 | 여러 개 | 비동기 | 주 용도 |
|--------|-----------|-----------|---------|--------|---------|
| `getBy` | 반환 | **에러 throw** | 에러 | ❌ | 지금 있어야 하는 요소 |
| `queryBy` | 반환 | **`null` 반환** | 에러 | ❌ | **없음을 단언**할 때 |
| `findBy` | Promise 반환 | 타임아웃(기본 1초) 후 에러 | — | ✅(await) | 비동기로 **나타날** 요소 |

**🎯 비유 — 택배 확인**
- `getBy`: "지금 문 앞에 택배 있지?" 없으면 바로 화냄(에러).
- `queryBy`: "혹시 택배 있나 없나 확인" — 없으면 "없음(null)"이라 답. **"없어야 정상"을 확인할 때.**
- `findBy`: "곧 올 택배 기다렸다가 확인" — 도착할 때까지 최대 N초 대기.

```jsx
// 존재 단언 → getBy
expect(screen.getByRole('button', { name: '저장' })).toBeEnabled()

// 부재 단언 → queryBy (getBy면 에러나서 못 씀!)
expect(screen.queryByText('에러가 발생했습니다')).not.toBeInTheDocument()

// 비동기 등장 → findBy (fetch 후 나타나는 데이터)
const item = await screen.findByText('주문 완료')
expect(item).toBeInTheDocument()
```

**📌 흔한 실수**
"없음"을 `getByText(...).not...`으로 쓰면 요소가 없을 때 `getBy`가 먼저 에러를 던져 단언이 실행조차 안 됩니다. 부재 단언엔 **반드시 `queryBy`**를 씁니다.

### 🔥 예상 꼬리질문

**Q. `findBy`와 `waitFor(() => getBy...)`는 뭐가 다른가요?**
A. `findBy`는 사실상 `waitFor` + `getBy`의 축약형입니다. 단일 요소가 나타나길 기다리는 대부분의 경우 `findBy`가 더 간결하고 권장됩니다. `waitFor`는 "특정 조건(예: mock 함수가 호출됨)"처럼 요소 등장 외의 비동기 상태를 기다릴 때 씁니다.

**Q. `findBy`의 기본 타임아웃은?**
A. 1000ms(1초)입니다. 필요하면 `findByText('...', {}, { timeout: 3000 })`로 조정할 수 있지만, 타임아웃을 늘려야 한다면 대개 mock 설계나 로딩 처리를 점검하는 게 먼저입니다.

<details><summary>📝 한 줄 요약</summary>
`getBy`는 존재 단언(없으면 에러), `queryBy`는 부재 단언(없으면 null), `findBy`는 비동기로 나타나는 요소를 await로 기다린다.
</details>

---

<a id="q7"></a>
## Q7. `userEvent`와 `fireEvent`의 차이, 왜 userEvent를 권장하나요? 🔴

### 💬 30초 답변
`fireEvent`는 **단일 DOM 이벤트 하나**를 그냥 발생시키고, `userEvent`는 **실제 사용자의 상호작용을 더 사실적으로 시뮬레이션**합니다. 예를 들어 `userEvent.type('abc')`는 실제 타이핑처럼 포커스→keydown→keypress→input→keyup을 글자마다 순서대로 일으키고, `userEvent.click`은 hover→mousedown→focus→mouseup→click을 재현합니다. 실제와 가까워 버그를 더 잘 잡으므로 권장됩니다.

### 📖 핵심 개념

**🎯 비유 — 로봇 팔로 키보드 치기**
- `fireEvent.change(input, { target: { value: 'abc' }})`: 로봇이 텍스트 값을 **순간이동**시켜 꽂아 넣음. 중간 과정이 없음.
- `userEvent.type(input, 'abc')`: 로봇이 **손가락으로 a, b, c를 차례로 누름**. 그 사이 발생하는 모든 이벤트가 실제처럼 흐름.

**📌 왜 차이가 중요한가**
`onKeyDown`으로 특정 키 입력을 막거나, `maxLength`, IME 조합, 포커스 이동에 따라 동작이 달라지는 컴포넌트는 `fireEvent`로는 그 경로를 못 밟아 버그를 놓칩니다. `userEvent`는 그 경로를 재현하므로 신뢰도가 높습니다.

```jsx
import userEvent from '@testing-library/user-event'

it('폼을 채우고 제출한다', async () => {
  // v14부터 setup()으로 인스턴스를 만든 뒤 await로 호출하는 게 표준
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.type(screen.getByLabelText('이메일'), 'a@b.com')
  await user.type(screen.getByLabelText('비밀번호'), 'pw1234')
  await user.click(screen.getByRole('button', { name: '로그인' }))

  expect(await screen.findByText('환영합니다')).toBeInTheDocument()
})
```

**📌 v14 변경점 (면접 포인트)**
- 예전엔 `userEvent.click(el)`처럼 바로 호출했지만, **v14부터는 `const user = userEvent.setup()` 후 `await user.click(el)`** 형태가 표준입니다. 모든 인터랙션이 비동기(Promise)라 `await`가 필요합니다.
- `fireEvent`는 여전히 존재하며, 라이브러리 내부/저수준 이벤트나 userEvent가 커버 못 하는 특수 이벤트에 씁니다.

### 🔥 예상 꼬리질문

**Q. 그럼 fireEvent는 언제 써야 하나요?**
A. userEvent가 지원하지 않는 이벤트(예: `scroll`, `mouseEnter`를 특정 요소에 강제, `input`의 특수 케이스)나, 사용자 상호작용이 아닌 프로그램적 이벤트를 직접 흉내 낼 때입니다. 사용자 조작은 userEvent가 우선입니다.

**Q. `await`를 빼먹으면 어떻게 되나요?**
A. 인터랙션이 끝나기 전에 단언이 실행되어 "아직 반영 안 된 상태"를 검사하게 됩니다. 간헐적으로 통과/실패하는 플레이키 테스트의 흔한 원인이라, userEvent 호출엔 항상 `await`를 붙입니다.

<details><summary>📝 한 줄 요약</summary>
userEvent는 실제 사용자 조작(포커스·키 시퀀스 등)을 사실적으로 재현해 fireEvent보다 신뢰도가 높으며, v14부터 `setup()` 후 `await` 호출이 표준이다.
</details>

---

<a id="q8"></a>
## Q8. 비동기(API 호출) 컴포넌트는 어떻게 테스트하나요? 목킹은? 🔴

### 💬 30초 답변
fetch 결과가 화면에 반영되길 기다리는 데엔 **`findBy`나 `waitFor`**를 쓰고, API 자체는 실제 서버 대신 **MSW(Mock Service Worker)로 네트워크 레벨에서 목킹**하는 것이 최신 권장 방식입니다. `global.fetch = vi.fn()`처럼 fetch를 직접 mock하는 것보다, MSW는 "실제 요청을 가로채 가짜 응답을 주므로" 코드가 실제 네트워크를 쓰는 것과 동일하게 동작해 더 견고합니다.

### 📖 핵심 개념

**🎯 비유 — 영화 세트장**
fetch를 직접 mock하는 건 배우에게 "여기서 이 대사만 해"라고 코드에 손대는 것. MSW는 아예 **가짜 상점 세트**를 지어두고, 컴포넌트가 진짜로 문 열고 들어가 물건을 사게 하는 것. 컴포넌트 코드는 자신이 실제 서버를 쓰는지 세트인지 모릅니다 → 코드 변경 없이 진짜에 가깝게 테스트.

**📌 MSW의 장점**
- fetch/axios 어떤 클라이언트를 쓰든 **네트워크 계층에서 가로채**므로 코드 수정 불필요.
- 같은 mock 핸들러를 **테스트·개발(브라우저)·Storybook**에서 재사용 가능.
- 성공/에러/지연 응답을 시나리오별로 쉽게 구성.

```jsx
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/user', () =>
    HttpResponse.json({ name: '홍길동' })
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers()) // 테스트 간 격리
afterAll(() => server.close())

it('유저 정보를 불러와 표시한다', async () => {
  render(<UserProfile />)

  // 로딩 → 데이터 도착까지 findBy로 대기
  expect(await screen.findByText('홍길동')).toBeInTheDocument()
})

it('에러 시 에러 메시지를 보여준다', async () => {
  // 이 테스트에서만 500 응답으로 덮어쓰기
  server.use(
    http.get('/api/user', () => new HttpResponse(null, { status: 500 }))
  )
  render(<UserProfile />)
  expect(await screen.findByText(/오류가 발생/)).toBeInTheDocument()
})
```

**📌 `waitFor` 사용 팁**
- 콜백 안에는 **단언(expect)만** 넣고 부수효과(클릭 등)는 넣지 마세요. 콜백이 여러 번 재실행되기 때문입니다.
- 여러 단언을 넣기보다 하나의 조건만 기다리는 게 디버깅에 유리합니다.

```jsx
await waitFor(() => {
  expect(mockOnSubmit).toHaveBeenCalledWith({ email: 'a@b.com' })
})
```

**📌 `act()` 경고**
"An update to X was not wrapped in act(...)" 경고는 대개 **비동기 상태 업데이트를 기다리지 않아서** 납니다. `findBy`/`waitFor`/`await user...`로 제대로 기다리면 대부분 사라집니다. `act`를 수동으로 감싸는 건 최후의 수단입니다.

### 🔥 예상 꼬리질문

**Q. TanStack Query를 쓰는 컴포넌트 테스트 시 주의점은?**
A. 테스트마다 새 `QueryClient`를 만들어 캐시를 격리하고, `retry: false`로 설정해 실패 시 불필요한 재시도로 테스트가 느려지지 않게 합니다. 그리고 `QueryClientProvider`로 감싸는 커스텀 `renderWithClient` 헬퍼를 두면 편합니다. (7/19 상태관리 자료와 연결)

**Q. 왜 fetch를 직접 mock하지 말라는 건가요?**
A. 구현 세부사항(어떤 HTTP 클라이언트를 쓰는지)에 테스트가 묶이고, 실제 요청/응답 직렬화·헤더 처리 등을 건너뛰어 "테스트는 통과하나 실제론 깨지는" 위험이 커지기 때문입니다.

<details><summary>📝 한 줄 요약</summary>
비동기 결과는 findBy/waitFor로 기다리고, API는 네트워크 계층을 가로채는 MSW로 목킹하면 코드 수정 없이 실제에 가깝게 성공·에러·지연 시나리오를 검증할 수 있다.
</details>

---

<a id="q9"></a>
## Q9. Playwright로 E2E 테스트할 때 핵심 개념은 무엇인가요? 🟡

### 💬 30초 답변
Playwright는 실제 브라우저(Chromium·Firefox·WebKit)를 자동 조작해 사용자 시나리오를 검증하는 E2E 도구입니다. 핵심은 **자동 대기(auto-waiting)**와 **웹 우선 단언(web-first assertions)**입니다. 요소가 보이고 클릭 가능해질 때까지 자동으로 기다려주고, `expect(locator).toBeVisible()` 같은 단언도 조건이 만족될 때까지 재시도하므로, 예전 도구에서 흔했던 `sleep()`이나 수동 wait가 거의 필요 없습니다.

### 📖 핵심 개념

**🎯 비유 — 참을성 있는 QA 직원**
옛날 자동화 도구는 "3초 기다렸다 클릭"처럼 시간을 못 박아, 느리면 실패하고 빠르면 시간 낭비였습니다. Playwright는 "요소가 준비될 때까지 지켜보다가 되는 순간 클릭"하는 참을성 있는 직원이라 안정적이고 빠릅니다.

**📌 로케이터(Locator)와 권장 쿼리**
Playwright도 RTL처럼 접근성·사용자 관점 쿼리를 권장합니다.
- `page.getByRole('button', { name: '로그인' })` — 1순위
- `page.getByLabel('이메일')`, `page.getByText(...)`, `page.getByPlaceholder(...)`
- `page.getByTestId(...)` — 최후

```js
import { test, expect } from '@playwright/test'

test('로그인 후 대시보드로 이동한다', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('이메일').fill('a@b.com')
  await page.getByLabel('비밀번호').fill('pw1234')
  await page.getByRole('button', { name: '로그인' }).click()

  // 웹 우선 단언: URL과 요소가 조건 만족할 때까지 자동 재시도
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible()
})
```

**📌 강력한 기능들 (면접 어필 포인트)**
- **네트워크 가로채기**: `page.route()`로 특정 API를 스텁 처리(외부 의존 제거).
- **트레이스/스크린샷/비디오**: 실패 시 `trace.zip`으로 각 단계 DOM·네트워크를 타임라인으로 재생 → 디버깅 강력.
- **병렬 실행 & 자동 격리**: 각 테스트가 독립 브라우저 컨텍스트(쿠키·스토리지 분리)에서 병렬 실행.
- **인증 재사용**: 로그인 상태를 `storageState`로 저장해 테스트마다 로그인 반복을 생략(속도↑).

**📌 Cypress와의 비교(간단히)**
- Playwright: 멀티 브라우저(WebKit 포함), 진짜 병렬, 여러 탭/오리진 지원, 무료 병렬. 문법은 async/await.
- Cypress: 개발자 경험(타임머신 UI)이 좋고 커뮤니티가 크지만, 기본적으로 단일 브라우저 컨텍스트·병렬은 유료(Cloud) 성격이 강함.

### 🔥 예상 꼬리질문

**Q. E2E 테스트에서 실제 백엔드를 쓰나요?**
A. 상황에 따라 다릅니다. 완전한 신뢰가 필요한 핵심 플로우는 스테이징 백엔드를 쓰고, 특정 시나리오(에러·엣지)는 `page.route()`로 응답을 스텁합니다. 실제 백엔드를 쓰면 신뢰도는 높지만 느리고 플레이키해질 수 있어 트레이드오프를 판단합니다.

**Q. `page.waitForTimeout(3000)`은 왜 안티패턴인가요?**
A. 고정 시간 대기는 느린 환경에선 부족해 실패하고 빠른 환경에선 시간 낭비이며, 플레이키의 주범입니다. 대신 조건 기반 대기(`toBeVisible` 등 웹 우선 단언, `waitForURL`)를 씁니다.

<details><summary>📝 한 줄 요약</summary>
Playwright는 자동 대기와 재시도되는 웹 우선 단언으로 안정적인 E2E를 제공하며, role 기반 로케이터·네트워크 가로채기·트레이스 디버깅·인증 재사용이 핵심 무기다.
</details>

---

<a id="q10"></a>
## Q10. 플레이키(flaky) 테스트란 무엇이고 왜 생기며 어떻게 없애나요? 🟢

### 💬 30초 답변
플레이키 테스트는 **코드 변경이 없는데도 실행할 때마다 통과/실패가 오락가락**하는 테스트입니다. 주원인은 비동기 처리를 제대로 기다리지 않거나(타이밍 의존), 테스트 간 상태가 공유되거나, 고정 시간 대기·실제 시간/랜덤/외부 네트워크에 의존하는 것입니다. CI 신뢰를 무너뜨려 "빨간불을 무시하는" 문화를 만들기 때문에 반드시 잡아야 합니다.

### 📖 핵심 개념

**📌 주요 원인과 해결**

| 원인 | 증상 | 해결 |
|------|------|------|
| 비동기 미대기 | 가끔 "요소 없음" 실패 | `await user...`, `findBy`, 웹 우선 단언 |
| 고정 sleep | 느린 CI에서만 실패 | 조건 기반 대기로 교체 |
| 테스트 간 상태 공유 | 실행 순서 따라 결과 다름 | `afterEach` cleanup, mock reset, 독립 QueryClient |
| 시간/타이머 의존 | 특정 시각에 실패 | `vi.useFakeTimers()`로 시간 고정 |
| 랜덤/Date.now | 값이 매번 달라짐 | seed 고정, Date mock |
| 실제 네트워크 | 서버 상태 따라 실패 | MSW/route로 스텁 |
| 애니메이션/전환 | 요소가 아직 이동 중 | 단언 재시도, 애니메이션 비활성 |

**🎯 비유 — 흔들리는 저울**
같은 물건을 올려도 잴 때마다 값이 다른 저울은 아무도 안 믿습니다. 플레이키 테스트도 마찬가지로 "실패해도 다시 돌리면 되겠지" 하며 무시하게 되고, 그 순간 진짜 버그도 함께 묻힙니다.

**📌 진단 팁**
- 여러 번 반복 실행(`--repeat-each` in Playwright, 반복 러너)으로 재현.
- 테스트를 하나만 격리 실행(`.only`)해서 통과하면 → 상태 공유 문제일 가능성.
- CI에서만 실패하면 → 타이밍/환경 차이(느린 머신) 의심.

### 🔥 예상 꼬리질문

**Q. 플레이키를 그냥 재시도(retry)로 넘기면 안 되나요?**
A. Playwright는 CI에서 `retries`를 두는 게 실용적이지만, 재시도는 "임시 완화"이지 해결이 아닙니다. 재시도로 통과한 테스트는 리포트에 flaky로 표시해 근본 원인을 추적해야 합니다. 남발하면 진짜 회귀를 숨기게 됩니다.

**Q. 테스트 격리는 구체적으로 어떻게 보장하나요?**
A. 각 테스트 전후로 DOM cleanup(RTL은 자동), mock 함수 `mockReset`, MSW `resetHandlers`, 전역 상태/스토리지 초기화, 그리고 테스트가 **실행 순서에 의존하지 않도록** 서로 독립적인 데이터로 작성합니다.

<details><summary>📝 한 줄 요약</summary>
플레이키 테스트는 비동기 미대기·상태 공유·고정 sleep·외부 의존이 원인이며, 조건 기반 대기와 철저한 테스트 격리로 없애야 CI 신뢰가 유지된다.
</details>

---

<a id="q11"></a>
## Q11. 무엇을 테스트하고, 무엇을 테스트하지 말아야 하나요? 🟡

### 💬 30초 답변
**사용자에게 중요한 동작·비즈니스 로직·자주 회귀가 나는 부분**을 테스트하고, **구현 세부사항(내부 state, 함수 이름)·서드파티 라이브러리 자체·거의 안 바뀌는 정적 마크업**은 테스트하지 않는 게 좋습니다. "이 테스트가 깨지면 실제로 사용자에게 문제가 생기는가?"를 기준으로 삼습니다.

### 📖 핵심 개념

**✅ 테스트할 가치가 높은 것**
- 조건 분기가 있는 비즈니스 로직(할인, 권한, 유효성 검사)
- 사용자 상호작용 흐름(폼 제출→성공/에러, 목록 필터링)
- 에러·엣지 케이스(빈 목록, 네트워크 실패, 권한 없음)
- 과거에 버그가 났던 지점(회귀 방지 테스트)
- 접근성 핵심(폼 label, 버튼 role)

**❌ 테스트하지 말아야 할(또는 비용 대비 낮은) 것**
- 내부 state 값, 특정 함수가 호출됐다는 사실 자체(동작이 아닌 구현)
- React·라이브러리가 보장하는 동작(예: `useState`가 값을 저장하는지)
- 단순 표시용 정적 텍스트/스타일(자주 바뀌고 잘 안 깨짐)
- 큰 컴포넌트의 통짜 스냅샷(rubber-stamping 위험)

**🎯 비유 — 집 점검**
문·창문·수도(사용자가 매일 쓰는 기능)는 꼼꼼히 점검하되, 벽돌 하나하나가 규격에 맞는지(라이브러리 내부)까지 매번 확인하진 않습니다. 그건 벽돌 제조사(React 팀)의 몫입니다.

**📌 좋은 테스트의 특징 (FIRST 원칙)**
- **F**ast(빠름), **I**ndependent(격리·순서 무관), **R**epeatable(어디서든 동일 결과), **S**elf-validating(통과/실패 자동 판정), **T**imely(적시에 작성).

### 🔥 예상 꼬리질문

**Q. 테스트를 언제 작성하는 게 좋나요?**
A. 로직이 확정된 순수 함수·유틸은 TDD로 먼저, UI 탐색이 많은 초기 컴포넌트는 구현이 안정된 뒤 통합 테스트로, 버그가 발견되면 재현 테스트를 먼저 짜고 고치는(회귀 방지) 방식이 실무에서 균형이 좋습니다.

**Q. 테스트가 오히려 개발을 느리게 하지 않나요?**
A. 잘못 짠 테스트(구현 세부사항에 묶인 테스트)는 리팩터링마다 깨져 오히려 짐이 됩니다. 반대로 동작 중심으로 잘 짠 테스트는 리팩터링·기능 추가 시 자신감을 주어 장기적으로 속도를 높입니다. 핵심은 "무엇을 테스트하느냐"입니다.

<details><summary>📝 한 줄 요약</summary>
"깨지면 사용자에게 문제가 생기는가"를 기준으로 동작·비즈니스 로직·회귀 지점을 테스트하고, 구현 세부사항·라이브러리 내부·정적 마크업은 피하는 게 유지보수 가능한 테스트다.
</details>

---

## 🎯 오늘의 핵심 3줄 정리

1. **전략**: 프론트엔드는 "사용자 사용 방식을 닮은" 통합 테스트에 가장 크게 투자(테스트 트로피)하고, 단위는 순수 로직에, E2E는 핵심 해피 패스에 한정한다.
2. **RTL**: 구현이 아닌 동작을 테스트하라 — `getByRole` 우선 쿼리, `getBy/queryBy/findBy` 구분, `userEvent`로 사실적 상호작용, 비동기는 `findBy`/`waitFor` + MSW 목킹.
3. **E2E & 품질**: Playwright의 자동 대기·웹 우선 단언으로 안정적 시나리오를 검증하고, 고정 sleep·상태 공유를 없애 플레이키 테스트를 근절한다.

---

## 🔗 기존 자료와의 연결
- **7/16 리렌더링 최적화**: `memo`/`useCallback`이 실제로 리렌더를 막는지 테스트로 검증할 때 "구현이 아닌 동작" 원칙이 적용됨.
- **7/17 접근성/ARIA**: `getByRole` 기반 테스트가 시맨틱 마크업·접근성을 자연히 끌어올림(직접 연결).
- **7/19 상태관리/TanStack Query**: 서버 상태 컴포넌트 테스트 시 QueryClient 격리·MSW 목킹.
- **기존 5.common.md Q97 (TDD)**: 본 자료가 Red-Green-Refactor를 실제 도구(RTL/Playwright/MSW) 관점으로 확장.
