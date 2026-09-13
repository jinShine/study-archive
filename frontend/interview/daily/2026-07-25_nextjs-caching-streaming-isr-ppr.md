# Next.js 심화 (App Router 캐싱 4계층 · 스트리밍/Suspense · ISR · PPR)

> 주제: 신입~주니어 프론트엔드가 면접에서 "Next.js로 SSR/SSG 해봤어요"를 넘어 "App Router가 요청 하나를 어떤 캐시 계층으로 처리하는지, 정적/동적 렌더링이 어디서 갈리는지, 스트리밍으로 TTFB를 어떻게 줄이는지를 설계할 줄 안다"를 보여주는 심화 — App Router의 4가지 캐싱 계층(Request Memoization·Data Cache·Full Route Cache·Router Cache), 정적 vs 동적 렌더링 경계, 재검증(time-based/on-demand), ISR, 스트리밍/Suspense, PPR(부분 사전 렌더링)
> 출처: 일일 심화 자료 (기존 4.react_next.md Q65~Q74 "Next.js 기본"·Q66 "CSR/SSR/SSG"·Q68 "서버/클라이언트 컴포넌트"의 심화 통합·확장편 · daily 미다룸 주제)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

> ⚠️ **버전 주의**: 이 문서는 **Next.js 15 App Router**(2024년 말 안정화) 기준입니다. Next.js 14 → 15에서 **캐싱 기본값이 크게 바뀌었으니**(아래 Q3) 실무·면접에서 "몇 버전이냐"를 반드시 구분하세요. **PPR**과 **`use cache`** 디렉티브는 작성 시점 기준 **experimental/canary** 기능입니다. 실제 지원 상태는 사용하는 버전의 공식 문서로 재확인하세요.

---

## 📑 목차

- Q1. App Router는 왜 4개의 캐시 계층을 두나요? (전체 그림) 🔴
- Q2. 정적 렌더링과 동적 렌더링은 어디서 갈리나요? 🔴
- Q3. Next.js 14 → 15에서 캐싱 기본값이 어떻게 바뀌었나요? 🔴
- Q4. Data Cache 재검증(revalidate)은 어떻게 설계하나요? 🔴
- Q5. ISR(증분 정적 재생성)은 정확히 무엇인가요? 🔴
- Q6. fetch가 아닌 데이터(ORM/DB)는 어떻게 캐시하나요? 🟡
- Q7. 스트리밍 SSR과 Suspense는 무엇을 해결하나요? 🔴
- Q8. PPR(부분 사전 렌더링)이란 무엇인가요? 🟢
- Q9. Router Cache(클라이언트 캐시)는 왜 헷갈리나요? 🟡

---

## Q1. App Router는 왜 4개의 캐시 계층을 두나요? (전체 그림) 🔴

**💬 30초 답변**
App Router는 "가능한 한 미리 만들고, 만든 건 재사용한다"는 철학이라 캐시가 **4계층**입니다. ①**Request Memoization**은 한 번의 요청 안에서 같은 `fetch`를 중복 호출해도 한 번만 실제로 나가게 묶어주고(서버, 요청 단위), ②**Data Cache**는 서버에서 가져온 데이터를 요청·배포를 넘어 지속 저장하며(서버, 영속), ③**Full Route Cache**는 빌드 시 렌더링한 HTML+RSC 페이로드를 저장하고(서버, 영속), ④**Router Cache**는 방문한 라우트를 브라우저 메모리에 담아 재방문을 빠르게 합니다(클라이언트, 세션). 앞의 셋은 서버, 마지막은 클라이언트라는 점이 핵심 구분선입니다.

**📖 핵심 개념**

🎯 **비유 — 프랜차이즈 카페 체인**
- **Request Memoization** = "주문 한 건 안에서 같은 음료 3잔 주문 → 바리스타는 레시피를 한 번만 확인": 한 번의 페이지 요청(한 손님) 처리 중 같은 데이터 요청을 묶음.
- **Data Cache** = "매장 냉장고에 미리 만들어 둔 시럽": 손님이 바뀌어도(요청이 바뀌어도), 심지어 가게 문 닫았다 열어도(재배포) 유지되는 재료 창고.
- **Full Route Cache** = "가장 잘 팔리는 세트 메뉴를 미리 조립해 진열": 페이지 전체(HTML+데이터)를 미리 완성해 진열.
- **Router Cache** = "손님이 자기 가방에 받아둔 영수증·메뉴판": 그 손님(브라우저)이 다시 왔을 때 바로 꺼내 봄.

📌 **4계층 비교표**

| 계층 | 위치 | 무엇을 캐시 | 지속 범위 | 목적 |
|---|---|---|---|---|
| Request Memoization | 서버 | `fetch()` 반환값 | **한 요청** 렌더링 동안 | 같은 요청 내 중복 fetch 제거 |
| Data Cache | 서버 | 데이터(fetch 결과 등) | **요청/배포 넘어 영속** | 데이터 소스 부하 감소 |
| Full Route Cache | 서버 | HTML + RSC 페이로드 | 배포/재검증까지 영속 | 렌더링 비용 자체를 제거 |
| Router Cache | 클라이언트 | RSC 페이로드 | 세션(메모리) | 네비게이션 즉시성·뒤로가기 |

📌 **한 요청의 흐름(정적 페이지 기준)**: 사용자가 라우트로 이동 → **Router Cache** 확인(있으면 즉시 표시) → 없으면 서버로 → **Full Route Cache** 확인(있으면 렌더링 생략하고 페이로드 반환) → miss면 렌더링하며 `fetch` 호출 → **Data Cache** 확인(있으면 재사용) → miss면 원본 데이터 소스로 요청 → 결과를 Data Cache에 저장 → 렌더링 결과를 Full Route Cache에 저장 → 응답. 이때 같은 렌더링 안에서 동일 `fetch`가 여러 컴포넌트에서 불리면 **Request Memoization**이 한 번으로 묶습니다.

**🔥 예상 꼬리질문**

**Q. Request Memoization과 Data Cache는 뭐가 다른가요?**
A. 범위와 수명이 다릅니다. Request Memoization은 **딱 그 한 번의 서버 렌더링(요청)** 동안만 유효한 임시 중복 제거로, 여러 컴포넌트가 같은 데이터를 각자 `fetch`해도 props 드릴링 없이 중복 네트워크를 막는 용도입니다. Data Cache는 **요청과 배포를 넘어 지속**되는 진짜 저장소로, "1시간마다 갱신" 같은 재검증 정책의 대상이 됩니다. 또 Memoization은 React의 기능이고, Data Cache는 Next.js의 기능입니다.

**Q. Request Memoization은 `fetch`에만 적용되나요?**
A. 자동 적용은 `fetch`(GET) 기준입니다. `fetch`가 아닌 DB 쿼리 등은 React의 `cache()` 함수로 감싸 같은 효과를 낼 수 있습니다(Q6 참고).

<details><summary>📝 한 줄 요약</summary>
App Router 캐시는 4계층 — Request Memoization(요청 내 중복제거)·Data Cache(서버 영속 데이터)·Full Route Cache(서버 영속 렌더링 결과)·Router Cache(클라이언트 세션). 앞 셋은 서버, 마지막은 클라이언트.
</details>

---

## Q2. 정적 렌더링과 동적 렌더링은 어디서 갈리나요? 🔴

**💬 30초 답변**
App Router는 라우트를 기본적으로 **정적 렌더링**(빌드 타임 또는 재검증 시 1회 렌더링 후 캐시)하려 하고, 다음 중 하나라도 있으면 **동적 렌더링**(요청마다 렌더링)으로 전환합니다: ①`cookies()`·`headers()`·`draftMode()`·`connection()` 같은 **동적 함수** 사용, ②`searchParams` 사용, ③캐시하지 않는(`no-store`) `fetch` 사용, ④세그먼트에 `export const dynamic = 'force-dynamic'` 지정. 즉 "요청마다 달라져야 하는 정보를 읽는 순간" 그 라우트는 동적이 됩니다.

**📖 핵심 개념**

🎯 **비유 — 신문 vs 즉석 편지**
정적 렌더링은 **신문 대량 인쇄**입니다. 새벽에 한 번 찍어(빌드) 모두에게 같은 걸 배포하니 빠르고 싸죠. 동적 렌더링은 **손님마다 즉석에서 쓰는 맞춤 편지**입니다. "당신 이름(쿠키)"이 들어가야 하니 요청이 올 때마다 새로 써야 합니다. Next.js는 "이 편지에 손님 이름을 쓰려는 순간"을 감지해 자동으로 즉석 모드로 바꿉니다.

📌 **동적으로 전환시키는 트리거(Next 15)**
- **동적 함수**: `cookies()`, `headers()`, `draftMode()`, `connection()` — Next 15부터 이들은 **비동기(async)** API라 `await cookies()`처럼 써야 합니다.
- **`searchParams`**: 페이지의 `searchParams` prop 접근(역시 Next 15에서 async prop).
- **캐시되지 않는 데이터 요청**: `fetch(url, { cache: 'no-store' })` 또는 `revalidate: 0`.
- **라우트 세그먼트 설정**: `export const dynamic = 'force-dynamic'`.

📌 **핵심 오해 정정**: "SSR = 항상 요청마다 서버 렌더링"이 아닙니다. App Router에서 서버 컴포넌트는 **기본적으로 정적**이며(빌드 타임 렌더 후 Full Route Cache에 저장), 위 트리거가 있어야 요청마다 도는 동적 렌더링(전통적 SSR에 가까움)이 됩니다. 그래서 "SSR/SSG"라는 이분법보다 **정적/동적 렌더링 + 캐시 전략**으로 이해하는 게 정확합니다.

```tsx
// app/dashboard/page.tsx — 동적 렌더링 (cookies 사용)
import { cookies } from 'next/headers'

export default async function Dashboard() {
  const cookieStore = await cookies() // ⬅️ 이 줄 때문에 라우트가 동적으로 전환
  const theme = cookieStore.get('theme')?.value
  return <main data-theme={theme}>요청마다 렌더링됩니다</main>
}
```

```tsx
// app/blog/[slug]/page.tsx — 정적 렌더링 + 정적 경로 생성(SSG)
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return posts.map((p: { slug: string }) => ({ slug: p.slug }))
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params // Next 15: params도 async
  const post = await fetch(`https://api.example.com/posts/${slug}`).then(r => r.json())
  return <article><h1>{post.title}</h1></article>
}
```

**🔥 예상 꼬리질문**

**Q. 특정 컴포넌트만 동적으로 하고 나머지는 정적으로 유지할 수 있나요?**
A. 일반적으로 **동적 트리거는 라우트 세그먼트 전체를 동적으로** 만듭니다. 하지만 동적인 부분을 `<Suspense>`로 감싸면 정적 셸은 먼저 보내고 동적 부분만 스트리밍할 수 있고(Q7), 나아가 **PPR**을 쓰면 한 페이지 안에서 정적 셸 + 동적 홀을 공존시킬 수 있습니다(Q8).

**Q. `export const dynamic` 옵션에는 뭐가 있나요?**
A. `'auto'`(기본, Next가 알아서), `'force-dynamic'`(항상 동적), `'force-static'`(강제 정적 — 동적 함수는 빈 값 반환), `'error'`(동적 요소 있으면 빌드 에러로 막기)입니다. `force-static`은 "이 페이지는 절대 요청마다 안 돌게 하겠다"를 명시할 때 유용합니다.

<details><summary>📝 한 줄 요약</summary>
기본은 정적 렌더링. cookies/headers/searchParams/no-store fetch/force-dynamic 중 하나라도 쓰면 그 라우트는 요청마다 도는 동적 렌더링으로 전환된다.
</details>

---

## Q3. Next.js 14 → 15에서 캐싱 기본값이 어떻게 바뀌었나요? 🔴

**💬 30초 답변**
Next 15의 가장 큰 변화는 **"기본적으로 덜 캐시한다"**로 방향을 튼 것입니다. Next 14까지는 `fetch`가 **기본 캐시(force-cache)**였고 GET Route Handler도 기본 캐시라, "왜 데이터가 안 바뀌지?" 하는 함정이 잦았습니다. Next 15에서는 **`fetch` 기본이 no-store(캐시 안 함)**, **GET Route Handler 기본이 캐시 안 함**, **Client Router Cache의 페이지 세그먼트 `staleTime` 기본이 0**으로 바뀌어, 이제는 **명시적으로 opt-in 해야 캐시**됩니다. "예측 가능성"을 위해 안전한 기본값(캐시 안 함)으로 바꾼 것이 요지입니다.

**📖 핵심 개념**

📌 **버전별 기본값 비교**

| 항목 | Next.js 14 | Next.js 15 |
|---|---|---|
| `fetch()` 기본 | 캐시함(force-cache) | **캐시 안 함(no-store)** |
| GET Route Handler | 캐시함 | **캐시 안 함** |
| Client Router Cache(페이지) | staleTime 30초 등 캐시 | **staleTime 0(동적 페이지 미캐시)** |
| `<Link prefetch>` 정적 페이지 | 캐시 | 여전히 캐시(정적은 유지) |

🎯 **비유 — 냉장고 기본 설정 변경**
Next 14는 "일단 다 냉장고에 넣어두는(캐시) 기본값"이라, 상한 줄 모르고 오래된 데이터를 내놓는 실수가 잦았습니다. Next 15는 "특별히 넣으라고 안 하면 그때그때 새로 만든다(no-store)"로 바꿔, 신선함을 기본으로 하고 **오래 두고 싶은 것만 명시적으로 냉장고에 넣게** 했습니다.

```tsx
// Next 15에서 명시적으로 캐시(opt-in)하는 법
// 1) 개별 fetch 캐시
const data = await fetch(url, { cache: 'force-cache' })

// 2) 시간 기반 재검증(ISR)
const data2 = await fetch(url, { next: { revalidate: 3600 } }) // 1시간

// 3) 라우트 세그먼트 전체를 정적으로 강제
export const dynamic = 'force-static'
// 또는
export const fetchCache = 'default-cache' // 세그먼트 내 fetch 기본을 캐시로
```

📌 **면접 포인트**: 이 변화를 알면 "왜 프로덕션에서 데이터가 갱신이 안 되지?"(14의 흔한 함정)와 "왜 캐시가 안 먹지?"(15의 흔한 함정)를 **버전 관점에서 진단**할 수 있습니다. 실무에서 강력한 신호가 됩니다.

**🔥 예상 꼬리질문**

**Q. Next 15에서도 정적 페이지는 여전히 캐시되나요?**
A. 네. 바뀐 건 주로 **데이터(fetch)와 동적 페이지의 클라이언트 캐시** 기본값입니다. 동적 함수를 안 쓰고 캐시 fetch만 쓰는 순수 정적 페이지는 여전히 빌드 타임에 렌더되어 Full Route Cache/prefetch 대상이 됩니다.

**Q. `use cache` 디렉티브는 뭔가요?**
A. 함수·컴포넌트·파일 단위로 "이건 캐시해라"를 선언하는 **새 방향의 캐싱 API**로, 개별 `fetch` 옵션 대신 캐시 경계를 코드로 명확히 표현하려는 시도입니다. 다만 작성 시점 기준 **experimental/canary** 단계이므로, 실무 도입 전 사용 버전의 안정성 상태를 확인해야 합니다.

<details><summary>📝 한 줄 요약</summary>
Next 15는 fetch·GET Route Handler·Router Cache 기본을 "캐시 안 함"으로 바꿨다. 이제 캐시는 opt-in(force-cache/revalidate/force-static)이며, 버전을 알면 캐시 버그를 정확히 진단할 수 있다.
</details>

---

## Q4. Data Cache 재검증(revalidate)은 어떻게 설계하나요? 🔴

**💬 30초 답변**
재검증은 두 방식입니다. **시간 기반(time-based)**은 `fetch(url, { next: { revalidate: 60 } })`처럼 "N초가 지나면 다음 요청 때 백그라운드로 새로 가져오라"는 것이고(오래된 데이터를 먼저 보여주고 뒤에서 갱신하는 stale-while-revalidate 방식), **온디맨드(on-demand)**는 데이터가 실제로 바뀐 순간(예: CMS 발행 웹훅)에 `revalidateTag('posts')`나 `revalidatePath('/blog')`를 호출해 즉시 캐시를 무효화하는 것입니다. "시간표대로 갱신 vs 사건 발생 시 갱신"의 차이입니다.

**📖 핵심 개념**

🎯 **비유 — 우유 유통기한 vs 리콜 통보**
시간 기반 재검증은 **유통기한**입니다. "60초 지나면 다음 손님한테는 새 우유로 바꿔줄게" — 기한 지난 직후 온 손님은 일단 있던 우유를 받고(빠름), 그사이 새 우유를 채웁니다(stale-while-revalidate). 온디맨드 재검증은 **리콜 통보**입니다. 유통기한과 무관하게 "이 제품 문제 있으니 지금 즉시 회수"처럼, 실제 사건(글 발행/수정)이 터지면 태그·경로를 콕 집어 즉시 폐기합니다.

📌 **`revalidateTag` vs `revalidatePath`**
- `revalidateTag('posts')`: `fetch(url, { next: { tags: ['posts'] } })`로 태그를 붙여둔 **모든 캐시 항목**을 한 번에 무효화. 여러 페이지에 걸친 같은 데이터를 정밀 타격할 때 강력.
- `revalidatePath('/blog')`: 특정 **경로**의 캐시를 무효화. "이 페이지 통째로 새로" 할 때.

```tsx
// 1) 시간 기반 (ISR) — 1시간마다 재검증
async function getPosts() {
  return fetch('https://api.example.com/posts', {
    next: { revalidate: 3600, tags: ['posts'] },
  }).then(r => r.json())
}
```

```tsx
// 2) 온디맨드 — 관리자가 글 발행 시 호출하는 Route Handler
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
  revalidateTag('posts') // ⬅️ 'posts' 태그 붙은 캐시 즉시 무효화
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
```

```tsx
// 3) Server Action 안에서 재검증 (폼 제출 후)
'use server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  await savePostToDB(formData)
  revalidatePath('/blog') // 작성 직후 목록 페이지 갱신
}
```

📌 **선택 기준**: 데이터가 "대충 최신이면 되는" 것(뉴스 목록, 가격표)이면 시간 기반이 단순하고 좋습니다. "발행 즉시 정확히 반영"이 필요하면(방금 쓴 글이 안 보이면 안 됨) 온디맨드가 맞습니다. 둘을 **함께** 쓰기도 합니다(안전망으로 시간 기반 + 정확성을 위한 온디맨드).

**🔥 예상 꼬리질문**

**Q. `revalidate: 60`이면 60초마다 무조건 서버가 새로 가져오나요?**
A. 아닙니다. **요청이 있을 때** 판정합니다. 60초가 지난 뒤 **첫 요청**이 오면, 그 사용자에게는 일단 캐시된(오래된) 값을 주고 **백그라운드에서 새로 가져와** 캐시를 교체합니다(stale-while-revalidate). 그래서 트래픽이 없으면 갱신도 안 일어나고, 갱신 중인 사용자도 느려지지 않습니다.

**Q. 온디맨드 재검증의 보안은 어떻게 하나요?**
A. 재검증 엔드포인트는 아무나 호출하면 캐시를 계속 날려 원본 서버에 부하를 줄 수 있으므로, 위 예시처럼 **시크릿 토큰/서명 검증**으로 보호하고, 웹훅이라면 발신자 서명(HMAC 등)을 확인해야 합니다.

<details><summary>📝 한 줄 요약</summary>
재검증 = 시간 기반(revalidate: N, stale-while-revalidate) + 온디맨드(revalidateTag/revalidatePath, 사건 발생 시 즉시 무효화). "대충 최신"은 시간 기반, "즉시 정확"은 온디맨드.
</details>

---

## Q5. ISR(증분 정적 재생성)은 정확히 무엇인가요? 🔴

**💬 30초 답변**
ISR(Incremental Static Regeneration)은 **"정적 페이지의 장점(빠름·저렴)을 유지하면서, 전체를 다시 빌드하지 않고 페이지를 하나씩 최신으로 갱신"**하는 기법입니다. 빌드 때 정적으로 만들어 두고, `revalidate` 시간이 지나면 그 페이지만 백그라운드로 재생성해 교체합니다. 또 `generateStaticParams`에 없던 새 경로도 **첫 요청 때 생성해 캐시**할 수 있습니다. 수천 개 상품 페이지처럼 "정적으로 하고 싶지만 가끔 바뀌고, 전체 재빌드는 부담"인 경우의 정답입니다.

**📖 핵심 개념**

🎯 **비유 — 도서관 서가의 개별 교체**
전통 SSG는 "도서관 전체를 다시 인쇄해 새로 채우기"(전체 재빌드)라 책 한 권 바뀌어도 통째로 다시 찍어야 합니다. ISR은 "낡은 책 한 권만 새 판으로 교체"입니다. 손님은 항상 서가에서 즉시 책을 꺼내 보고(정적처럼 빠름), 사서는 뒤에서 유통기한 지난 책만 조용히 새 판으로 바꿔 끼웁니다.

📌 **ISR의 두 축**
1. **기존 페이지 갱신**: `revalidate` 시간 경과 후 요청이 오면 백그라운드 재생성(Q4의 시간 기반과 같은 메커니즘).
2. **신규 경로 생성**: `generateStaticParams`로 빌드 때 일부만 미리 만들고, 나머지는 **요청 시 생성 후 캐시**(`dynamicParams` 기본 true). 상품 100만 개 중 인기 1000개만 미리 만들고 나머지는 온디맨드로 정적화.

```tsx
// app/products/[id]/page.tsx
export const revalidate = 3600 // 이 라우트의 페이지들을 1시간마다 재검증

export async function generateStaticParams() {
  // 인기 상품만 미리 빌드
  const top = await fetch('https://api.example.com/products/top').then(r => r.json())
  return top.map((p: { id: string }) => ({ id: p.id }))
}

// 미리 안 만든 id로 접근 시: 첫 요청 때 생성→캐시 (dynamicParams 기본 true)
// export const dynamicParams = false // ⬅️ 목록에 없는 경로는 404로 막고 싶으면
export default async function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await fetch(`https://api.example.com/products/${id}`).then(r => r.json())
  return <div>{product.name}</div>
}
```

📌 **CSR/SSR/SSG와의 관계**: 기존 4.react_next.md Q66이 CSR/SSR/SSG를 다뤘다면, ISR은 **SSG + 부분 갱신**으로 이해하면 됩니다. "빌드 타임 정적화(SSG)"에 "런타임 부분 재생성"을 더한 것.

**🔥 예상 꼬리질문**

**Q. ISR과 SSR의 차이를 한 문장으로?**
A. SSR(동적 렌더링)은 **요청마다** HTML을 새로 만들고, ISR은 **미리 만든 정적 HTML을 재사용하되 주기적으로 백그라운드 갱신**합니다. ISR이 훨씬 빠르고 서버 부하가 적지만, "실시간 정확성"이 필수인 데이터(재고 실시간, 개인화)에는 부적합합니다.

**Q. `dynamicParams`는 뭔가요?**
A. `generateStaticParams`에 없는 경로로 접근했을 때의 동작을 정합니다. 기본 `true`면 요청 시 생성해 캐시(ISR), `false`면 404를 반환합니다. "우리 상품 목록에 없는 id는 존재하지 않아야 한다"면 `false`로 막습니다.

<details><summary>📝 한 줄 요약</summary>
ISR = SSG의 속도 + 전체 재빌드 없는 부분 갱신. revalidate로 기존 페이지를 백그라운드 재생성하고, generateStaticParams+dynamicParams로 신규 경로를 온디맨드 정적화한다.
</details>

---

## Q6. fetch가 아닌 데이터(ORM/DB)는 어떻게 캐시하나요? 🟡

**💬 30초 답변**
Next의 자동 캐싱(Request Memoization·Data Cache)은 `fetch` GET에 붙습니다. Prisma·Drizzle 같은 **ORM/DB 직접 호출**은 `fetch`가 아니라 자동 캐시가 안 되므로, **요청 내 중복 제거**는 React의 `cache()`로, **요청·배포를 넘는 영속 캐시**는 `unstable_cache`(또는 canary의 `use cache`)로 감쌉니다. "무엇으로 감싸느냐"에 따라 어느 계층을 얻는지가 달라집니다.

**📖 핵심 개념**

📌 **도구별 역할**
- `cache()` (React): **한 요청 안**에서 같은 인자로 호출되면 결과 재사용(= fetch의 Request Memoization을 DB 함수에 부여). 영속은 아님.
- `unstable_cache()` (Next): **요청·배포를 넘어 지속**되는 Data Cache에 저장. `tags`/`revalidate`로 재검증 가능.
- `use cache` (canary, experimental): 위 둘을 대체하려는 새 방향. 도입 전 버전 확인 필수.

```tsx
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'

// (1) 요청 내 중복 제거: 같은 렌더링에서 getUser(1)을 여러 번 불러도 쿼리는 1회
export const getUser = cache(async (id: number) => {
  return db.user.findUnique({ where: { id } })
})

// (2) 영속 캐시 + 태그 재검증: 요청·배포를 넘어 캐시, revalidateTag('products')로 무효화
export const getProducts = unstable_cache(
  async () => db.product.findMany(),
  ['products-list'],            // 캐시 키
  { tags: ['products'], revalidate: 3600 }
)
```

🎯 **비유**: `cache()`는 "이번 회의 동안만 쓰는 메모장"(회의 끝나면 버림), `unstable_cache()`는 "회사 공용 위키"(회의가 끝나도, 사람이 바뀌어도 남고, 갱신 규칙이 있음)입니다.

**🔥 예상 꼬리질문**

**Q. `unstable_cache`는 이름이 unstable인데 써도 되나요?**
A. 이름의 `unstable_`은 API가 바뀔 수 있다는 표시일 뿐, 실무에서 널리 쓰여 왔습니다. 다만 팀은 이 API를 `use cache`류로 **대체하는 방향**을 예고했으므로, 새 프로젝트라면 사용 버전의 문서에서 권장 방식을 확인하는 게 안전합니다.

<details><summary>📝 한 줄 요약</summary>
ORM/DB는 자동 캐시가 안 된다. 요청 내 중복 제거는 React cache(), 영속 캐시+태그 재검증은 unstable_cache(canary는 use cache).
</details>

---

## Q7. 스트리밍 SSR과 Suspense는 무엇을 해결하나요? 🔴

**💬 30초 답변**
전통적 SSR은 "서버에서 **모든 데이터가 준비될 때까지** HTML을 못 보냄"이라, 느린 API 하나가 전체 페이지를 인질로 잡아 **TTFB(첫 바이트까지 시간)**가 늘어납니다. 스트리밍 SSR은 준비된 부분부터 **조각(청크)으로 흘려보내고**, 느린 부분은 `<Suspense>`로 감싸 **로딩 UI(스켈레톤)를 먼저** 보낸 뒤 데이터가 되는 대로 그 자리에 채웁니다. App Router에서는 `loading.tsx` 파일이나 `<Suspense>` 경계로 손쉽게 적용합니다.

**📖 핵심 개념**

🎯 **비유 — 코스 요리 vs 한 상 차림**
전통 SSR은 "모든 요리가 다 될 때까지 손님을 문밖에 세워두는" 식입니다(디저트가 늦으면 애피타이저도 못 먹음). 스트리밍은 **코스 요리**입니다. 애피타이저(빠른 콘텐츠)를 먼저 내고, 스테이크(느린 데이터)는 "준비 중입니다" 안내판(스켈레톤)을 올려둔 뒤 다 되면 그 자리에 냅니다. 손님은 훨씬 빨리 식사를 시작합니다.

📌 **작동 방식**
- 서버는 페이지를 **여러 RSC 청크로 스트리밍**합니다. `<Suspense>` 경계 밖(정적/빠른 부분)은 즉시, 경계 안(느린 async 서버 컴포넌트)은 fallback을 먼저 보낸 뒤 완료되면 교체 스크립트를 흘려보냅니다.
- `app/loading.tsx`는 그 라우트 세그먼트 전체를 감싸는 **자동 Suspense 경계**입니다.
- 성능 지표상 **TTFB·FCP가 개선**되고, 사용자는 "뭔가 로딩 중"임을 즉시 인지합니다(체감 성능 ↑).

```tsx
// app/dashboard/page.tsx — 느린 위젯만 Suspense로 감싸 스트리밍
import { Suspense } from 'react'

async function SlowStats() {
  const data = await fetch('https://api.example.com/stats', { cache: 'no-store' })
    .then(r => r.json()) // 느린 API
  return <div>매출: {data.revenue}</div>
}

export default function Dashboard() {
  return (
    <main>
      <h1>대시보드</h1>          {/* 즉시 전송 (정적 셸) */}
      <Suspense fallback={<StatsSkeleton />}>
        <SlowStats />           {/* 준비되면 이 자리에 스트리밍 */}
      </Suspense>
    </main>
  )
}
```

```tsx
// app/dashboard/loading.tsx — 세그먼트 전체 로딩 UI (자동 Suspense)
export default function Loading() {
  return <div className="skeleton">불러오는 중…</div>
}
```

📌 **주의**: 스트리밍을 쓰려면 느린 데이터 페칭이 **Suspense 경계 안쪽**에 있어야 합니다. 부모 서버 컴포넌트 최상단에서 `await`로 느린 데이터를 받으면 경계 밖이라 전체가 막혀 스트리밍 이점이 사라집니다. **"느린 것을 경계 안으로 밀어 넣는 것"**이 설계 포인트입니다.

**🔥 예상 꼬리질문**

**Q. 여러 데이터를 병렬로 받고 싶은데 순차로 느려집니다. 어떻게 하나요?**
A. `await`를 연달아 쓰면 **워터폴(순차)**이 됩니다. 독립적인 요청은 `Promise.all([...])`로 병렬화하거나, 각각을 별도의 `<Suspense>` 컴포넌트로 나눠 **각자 스트리밍**되게 합니다. 병렬화만으로 총 대기시간이 "합"에서 "최댓값"으로 줄어듭니다.

**Q. 스트리밍과 SEO는 충돌하지 않나요?**
A. 스트리밍된 콘텐츠도 최종 HTML에 포함되며 크롤러는 대체로 이를 처리합니다. 다만 **핵심 SEO 콘텐츠(제목·메타·주요 텍스트)는 Suspense 밖의 즉시 렌더 영역**에 두는 게 안전합니다. 메타데이터는 `generateMetadata`로 별도 관리합니다.

<details><summary>📝 한 줄 요약</summary>
스트리밍 SSR은 준비된 조각부터 흘려보내 TTFB/FCP를 개선한다. 느린 부분을 <Suspense>(또는 loading.tsx)로 감싸 스켈레톤을 먼저 보이고, 느린 페칭은 경계 안쪽으로 밀어 넣는 게 핵심.
</details>

---

## Q8. PPR(부분 사전 렌더링)이란 무엇인가요? 🟢

**💬 30초 답변**
PPR(Partial Prerendering)은 **한 페이지 안에서 정적 부분과 동적 부분을 공존**시키는 렌더링 모델입니다. 지금까지는 페이지에 동적 요소가 하나라도 있으면 **라우트 전체가 동적**이 됐는데(Q2), PPR은 페이지의 **정적 셸을 미리 렌더해 CDN에서 즉시 제공**하고, `<Suspense>`로 표시한 **동적 홀(hole)만 요청 시 채워 스트리밍**합니다. "정적의 속도 + 동적의 유연함"을 한 응답에 담는 게 목표입니다. **작성 시점 기준 experimental**입니다.

**📖 핵심 개념**

🎯 **비유 — 미리 인쇄된 서식지 + 손으로 채우는 빈칸**
관공서 서식은 제목·안내문·표 틀(정적 셸)이 미리 인쇄돼 있고, "이름/신청일" 빈칸(동적 홀)만 그 자리에서 채웁니다. PPR은 정확히 이 방식으로, 서식지 전체를 매번 새로 인쇄(전체 동적)하지 않고 **빈칸만 채워** 속도와 개인화를 동시에 얻습니다.

📌 **기존 방식과의 차이**
- 지금까지: 동적 요소 1개 → **라우트 전체 동적**(정적 최적화 포기) 또는 스트리밍(전체가 동적 렌더 후 조각 전송).
- PPR: **정적 셸은 빌드 타임 프리렌더**(CDN 캐시 가능) → 응답 시작이 즉시 → `<Suspense>` 동적 홀만 서버에서 렌더해 같은 응답 스트림으로 채움. 즉 "정적 프리렌더 + 스트리밍"을 **한 번의 HTTP 응답**에 통합.

```tsx
// PPR: 페이지의 정적 셸 + 동적 홀
import { Suspense } from 'react'
import { cookies } from 'next/headers'

// (실험적) 라우트에서 PPR 활성화
export const experimental_ppr = true

async function Cart() {
  const cookieStore = await cookies()      // 동적 (사용자별)
  const items = await getCart(cookieStore.get('sid')?.value)
  return <span>{items.length}개</span>
}

export default function Page() {
  return (
    <main>
      <Header />                             {/* 정적 셸: 프리렌더 */}
      <ProductList />                         {/* 정적 셸: 프리렌더 */}
      <Suspense fallback={<CartSkeleton />}>
        <Cart />                             {/* 동적 홀: 요청 시 스트리밍 */}
      </Suspense>
    </main>
  )
}
```

📌 **면접에서의 위치**: PPR은 "정적/동적 이분법"을 넘어서는 최신 흐름이라, 언급하면 트렌드 파악을 보여줍니다. 단, **experimental임을 반드시 함께 말하는 것**이 정확성과 신뢰를 줍니다("아직 실험 단계라 프로덕션 도입은 신중히" 정도).

**🔥 예상 꼬리질문**

**Q. PPR과 스트리밍(Q7)은 뭐가 다른가요?**
A. 스트리밍은 "전체가 동적 렌더되지만 조각으로 전송"에 가깝고, PPR은 **정적 셸을 빌드 타임에 미리 만들어 CDN에서 즉시** 주고(응답 시작이 더 빠름) 동적 홀만 스트리밍합니다. PPR은 내부적으로 스트리밍을 활용하되 **정적 프리렌더를 결합**한 상위 개념입니다.

**Q. 어떤 페이지에 PPR이 이상적인가요?**
A. **대부분 정적이지만 일부만 개인화**되는 페이지 — 상품 상세(설명·이미지는 정적, 재고·장바구니·추천은 동적), 대시보드 셸 + 사용자별 위젯 등. 페이지 전체가 개인화되면 이점이 작습니다.

<details><summary>📝 한 줄 요약</summary>
PPR(experimental)은 한 페이지에서 정적 셸(빌드 프리렌더·CDN)과 동적 홀(Suspense·요청 시 스트리밍)을 한 응답에 결합한다. "동적 하나면 전체 동적" 한계를 깨는 최신 방향.
</details>

---

## Q9. Router Cache(클라이언트 캐시)는 왜 헷갈리나요? 🟡

**💬 30초 답변**
Router Cache는 브라우저 메모리에 **방문한 라우트의 RSC 페이로드를 저장**해, 뒤로가기·재방문·`<Link>` 프리페치를 즉시 처리하는 **클라이언트 측** 캐시입니다. 헷갈리는 이유는 ①서버 캐시(Data/Full Route Cache)와 다른 계층인데 섞어 생각하기 쉽고, ②"데이터를 서버에서 재검증했는데도 화면이 안 바뀌는" 현상이 이 캐시 때문일 때가 많기 때문입니다. Next 15에서 **동적 페이지의 기본 staleTime이 0**으로 바뀌어 이 함정이 상당히 줄었습니다.

**📖 핵심 개념**

📌 **특징**
- **위치/수명**: 브라우저 메모리, 세션 동안(페이지 새로고침 시 초기화).
- **효과**: 이미 방문한 경로로의 이동·뒤로가기가 서버 왕복 없이 즉시. `<Link>`가 뷰포트에 들어오면 프리페치해 미리 채움.
- **함정**: 서버에서 `revalidateTag`로 데이터를 갱신해도, 클라이언트가 **Router Cache에 든 옛 페이로드**를 재사용하면 사용자는 옛 화면을 볼 수 있음.

📌 **명시적 무효화 방법**
- **Server Action + `revalidatePath`/`revalidateTag`**: 서버 액션 안에서 호출하면 클라이언트 Router Cache도 무효화됨(가장 권장).
- **`router.refresh()`**: 현재 라우트의 서버 컴포넌트를 다시 가져와 갱신(클라이언트 상태는 유지).
- Next 15의 **staleTime 0 기본값**: 동적 페이지는 재사용하지 않아 옛 데이터 노출이 줄어듦.

```tsx
'use client'
import { useRouter } from 'next/navigation'

export function RefreshButton() {
  const router = useRouter()
  // 서버 데이터가 바뀐 걸 아는데 화면 갱신이 필요할 때
  return <button onClick={() => router.refresh()}>새로고침</button>
}
```

🎯 **비유**: Router Cache는 "브라우저가 들고 다니는 즉석 사진첩"입니다. 다시 그 방(라우트)에 가면 사진첩에서 바로 꺼내 보여줘 빠르지만, 방 내부가 실제로 바뀌었다면(서버 데이터 변경) 사진첩을 갱신(`refresh`/서버 액션 재검증)해야 최신을 봅니다.

**🔥 예상 꼬리질문**

**Q. Data Cache와 Router Cache를 한 문장으로 구분하면?**
A. Data Cache는 **서버**에서 여러 사용자·요청이 공유하는 데이터 저장소, Router Cache는 **각 브라우저** 안에서 그 사용자의 네비게이션을 빠르게 하는 임시 저장소입니다.

**Q. `<Link prefetch={false}>`는 언제 쓰나요?**
A. 프리페치는 뷰포트의 링크를 미리 받아 즉시성을 높이지만, **링크가 매우 많거나**(목록) 대상 페이지가 무거우면 불필요한 요청이 늘 수 있습니다. 그럴 때 `prefetch={false}`로 자동 프리페치를 끕니다.

<details><summary>📝 한 줄 요약</summary>
Router Cache는 브라우저 메모리에 RSC 페이로드를 담아 네비게이션을 즉시화하는 클라이언트 캐시. 서버 재검증 후 화면이 안 바뀌면 서버 액션 재검증이나 router.refresh()로 무효화한다. Next 15는 동적 페이지 staleTime 0이 기본.
</details>

---

## 🎯 이 문서 핵심 정리

- **캐시 4계층**: Request Memoization(요청 내)·Data Cache(서버 영속 데이터)·Full Route Cache(서버 영속 렌더링)·Router Cache(클라이언트 세션). "어느 계층 문제인가"를 먼저 나눠 생각하기.
- **정적/동적 경계**: cookies/headers/searchParams/no-store fetch/force-dynamic이 라우트를 동적으로 만든다. 기본은 정적.
- **Next 15 기본값 전환**: fetch·GET Route Handler·Router Cache 기본이 "캐시 안 함"으로 → 캐시는 opt-in. 버전을 알면 캐시 버그를 진단할 수 있다.
- **재검증**: 시간 기반(revalidate, stale-while-revalidate) + 온디맨드(revalidateTag/revalidatePath). ISR = SSG + 부분 갱신.
- **스트리밍/Suspense**로 TTFB 개선, **PPR**(experimental)로 정적 셸+동적 홀 결합.

> 💡 **면접 팁**: "SSR/SSG 해봤어요"에서 멈추지 말고, **"이 페이지는 왜 정적이고, 이 데이터는 왜 revalidate 60이며, 이 위젯은 왜 Suspense로 감쌌는지"**를 캐시 계층 언어로 설명하면 설계 능력이 드러납니다. Next 14 → 15 캐싱 기본값 변화는 특히 강한 신호입니다.
