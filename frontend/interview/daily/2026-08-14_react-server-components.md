# React Server Components 심화 · 서버/클라이언트 경계 · 직렬화 · Server Actions

> 주제: 신입~주니어 프론트엔드가 면접에서 "Next.js App Router 써봤어요 / 'use client' 붙여봤어요"를 넘어 "**서버 컴포넌트(RSC)가 SSR과 무엇이 다른지**, 컴포넌트가 서버와 클라이언트 중 어디서 실행되는지, 그 경계를 넘을 때 무엇이 **직렬화**되고 무엇이 안 되는지, 왜 이벤트 핸들러/useState/useEffect는 서버 컴포넌트에서 못 쓰는지, RSC에서 데이터를 어떻게 가져오고 워터폴을 어떻게 피하는지, Server Actions로 폼·뮤테이션을 어떻게 처리하는지"를 아키텍처 수준으로 설명할 줄 안다를 보여주는 심화 — RSC의 정체와 등장 배경, 서버 vs 클라이언트 컴포넌트 경계와 `'use client'`, 직렬화 경계(무엇을 props로 넘길 수 있나), RSC에서의 데이터 페칭과 워터폴, 컴포지션 패턴(children으로 서버 컴포넌트 끼우기), Server Actions(`'use server'`)와 `useActionState`/`useFormStatus`, RSC 페이로드(Flight) 전송, 흔한 오해와 함정
> 출처: 일일 심화 자료 (기존 4.react_next.md의 SSR/CSR·Next.js 편, 07-25 Next.js 캐싱·스트리밍·PPR 편, 07-30 Fiber 편의 상위 아키텍처 보강편)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화
> ※ 본 문서는 React 19 안정(stable) 버전과 Next.js App Router(13.4+ 안정, 15 기준) 관례를 따릅니다. RSC는 "React 기능"이고, 이를 실전에서 구현한 대표 프레임워크가 Next.js App Router입니다. 두 층을 구분해서 설명합니다.

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-react-server-componentsrsc란-무엇이고-ssr과-뭐가-다른가요) | RSC란 무엇이고 SSR과 뭐가 다른가? | 🔴 |
| [D2](#d2-서버-컴포넌트와-클라이언트-컴포넌트의-경계는-어떻게-나뉘나요-use-client) | 서버 vs 클라이언트 컴포넌트 경계 · `'use client'` | 🔴 |
| [D3](#d3-서버에서-클라이언트로-넘길-수-있는-props와-없는-props는-직렬화-경계) | 직렬화 경계 — 넘길 수 있는 props / 없는 props | 🔴 |
| [D4](#d4-서버-컴포넌트에서는-데이터를-어떻게-가져오나요-워터폴은-어떻게-피하나요) | RSC 데이터 페칭 · 워터폴 방지 | 🔴 |
| [D5](#d5-클라이언트-컴포넌트-안에-서버-컴포넌트를-넣을-수-있나요-컴포지션-패턴) | 컴포지션 패턴 (children으로 서버 컴포넌트) | 🟡 |
| [D6](#d6-server-actionsuse-server란-무엇이고-폼-처리를-어떻게-하나요) | Server Actions · 폼 처리 · `useActionState` | 🔴 |
| [D7](#d7-rsc는-서버에서-클라이언트로-무엇을-어떻게-보내나요-flight-페이로드) | RSC 페이로드(Flight)와 스트리밍 | 🟢 |
| [D8](#d8-rsc에서-흔히-하는-오해와-함정은) | 흔한 오해와 함정 | 🟡 |

---

## D1. React Server Components(RSC)란 무엇이고, SSR과 뭐가 다른가요? 🔴

**💬 30초 답변**
> Server Component는 **오직 서버에서만 실행되고, 절대 클라이언트로 자바스크립트 번들이 전송되지 않는 컴포넌트**입니다. 서버에서 렌더링되어 결과(직렬화된 UI 트리)만 클라이언트로 흘려보냅니다. 핵심은 SSR과의 차이인데, **기존 SSR은 컴포넌트를 서버에서 "HTML로 한 번" 그린 뒤, 같은 컴포넌트 코드를 클라이언트로도 보내 하이드레이션(hydration)합니다.** 즉 SSR 컴포넌트의 JS는 결국 브라우저로 갑니다. 반면 **RSC는 서버에서만 돌고 그 컴포넌트의 코드 자체가 번들에 포함되지 않습니다.** 그래서 무거운 라이브러리(마크다운 파서, ORM, 날짜 포맷터 등)를 서버 컴포넌트에서 쓰면 클라이언트 번들이 0바이트 늘어납니다. 요약하면 SSR은 "초기 렌더링을 서버에서 하는 것", RSC는 "컴포넌트를 실행하는 위치 자체를 서버로 옮기는 것"입니다.

**📖 핵심 개념**

🎯 **비유**: 식당에 비유하면, **CSR**은 밀키트를 통째로 집에 보내 손님(브라우저)이 직접 요리하는 것, **SSR**은 요리를 완성해 사진(HTML)과 함께 밀키트도 같이 보내 손님이 데워 먹게(하이드레이션) 하는 것, **RSC**는 **주방(서버)에서 조리를 끝내 접시(직렬화된 UI)만 내보내고, 레시피와 조리도구(컴포넌트 JS)는 주방에 두는 것**입니다. 손님은 조리도구를 받지 않으니 짐(번들)이 가볍습니다.

📌 **왜 나왔나 — 해결하려는 문제**: SPA가 커질수록 ① 클라이언트 번들이 비대해지고(모든 컴포넌트 JS를 다운로드), ② 데이터 페칭이 컴포넌트 마운트 후 `useEffect`에서 일어나 **요청 워터폴**과 로딩 스피너 지옥이 생깁니다. RSC는 데이터 접근(DB·파일시스템)을 서버 컴포넌트 안으로 끌어와 **네트워크 왕복 없이** 데이터를 읽고, 그 컴포넌트 코드는 클라이언트로 보내지 않아 번들을 줄입니다.

📌 **RSC ≠ SSR, 하지만 함께 쓴다**: RSC는 SSR을 대체하지 않습니다. 실제 App Router에서는 두 가지가 겹칩니다 — 서버 컴포넌트를 렌더해 RSC 페이로드를 만들고(RSC), 첫 요청에서는 그것을 HTML로도 그려 보냅니다(SSR). 즉 "RSC로 트리를 만들고 → 그 결과를 SSR로 HTML화 → 클라이언트 컴포넌트만 하이드레이션"이 한 파이프라인에서 일어납니다.

📌 **App Router의 기본값**: Next.js App Router에서 `app/` 아래 컴포넌트는 **기본적으로 전부 서버 컴포넌트**입니다. 클라이언트 컴포넌트로 만들려면 파일 맨 위에 `'use client'`를 명시해야 합니다. (Pages Router에는 RSC가 없습니다.)

```jsx
// app/page.tsx — 파일 상단에 지시어가 없으면 서버 컴포넌트 (기본값)
// 이 컴포넌트의 JS는 클라이언트 번들에 포함되지 않는다.
import db from '@/lib/db';          // ORM/DB 클라이언트를 직접 import 가능
import { marked } from 'marked';    // 무거운 라이브러리도 번들에 안 들어감

export default async function Page() {
  // 서버 컴포넌트는 async 가능 — 컴포넌트가 곧 데이터 로더
  const post = await db.post.findFirst();      // 네트워크 왕복 없이 DB 직접 접근
  const html = marked(post.markdown);          // 무거운 파싱을 서버에서
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}
```

**🔥 예상 꼬리질문**

**Q. 그럼 RSC를 쓰면 SSR은 안 해도 되나요?**
A. 아니요. RSC는 "어디서 실행되나(위치)"의 문제이고 SSR은 "첫 요청에 HTML을 그려 보내느냐(초기 렌더)"의 문제입니다. App Router는 RSC의 결과를 SSR로 HTML화해 함께 보냅니다. 둘은 대체가 아니라 협업 관계입니다.

**Q. 서버 컴포넌트는 리렌더링되면 어떻게 되나요?**
A. 서버 컴포넌트에는 상태(state)가 없으므로 자체적으로 리렌더링되지 않습니다. 사용자가 다른 라우트로 이동하거나 데이터를 무효화(revalidate)해 서버에 새 요청이 갈 때, 서버가 다시 실행되어 갱신된 RSC 페이로드를 내려주고 클라이언트가 그 결과를 트리에 병합합니다. 이때 클라이언트 컴포넌트의 상태는 보존됩니다.

**Q. RSC의 가장 큰 이점 두 가지만 말한다면?**
A. ① **제로 번들 비용** — 서버 컴포넌트 코드는 클라이언트로 전송되지 않아 무거운 의존성을 자유롭게 씀. ② **데이터에 직접 접근** — DB·파일시스템·시크릿을 컴포넌트 안에서 안전하게 읽어 워터폴과 API 계층을 줄임.

<details><summary>📝 한 줄 요약</summary>
RSC는 "서버에서만 실행되고 JS가 클라이언트로 안 가는 컴포넌트"로, 컴포넌트의 실행 위치를 서버로 옮겨 번들을 줄이고 데이터에 직접 접근한다. SSR(초기 HTML 렌더)과는 다른 개념이며 함께 동작한다.
</details>

---

## D2. 서버 컴포넌트와 클라이언트 컴포넌트의 경계는 어떻게 나뉘나요? (`'use client'`) 🔴

**💬 30초 답변**
> `'use client'`는 파일 맨 위에 적는 지시어(directive)로, **"여기서부터 클라이언트 경계가 시작된다"**를 선언합니다. 그 파일과, 그 파일이 import하는 모듈들이 **클라이언트 번들에 포함**되어 브라우저에서 실행됩니다. 규칙은 이렇습니다 — **상태(`useState`)·이펙트(`useEffect`)·브라우저 API·이벤트 핸들러(onClick 등)를 쓰려면 클라이언트 컴포넌트여야** 합니다. 서버 컴포넌트는 이런 것들을 못 씁니다(서버엔 DOM도, 사용자 상호작용도 없으니까요). 반대로 **DB 접근·시크릿·`async` 컴포넌트·서버 전용 라이브러리**는 서버 컴포넌트에서만 가능합니다. 즉 `'use client'`는 "상호작용이 필요한 잎(leaf)"에만 붙이고, 트리의 위쪽은 서버 컴포넌트로 두는 것이 이상적입니다.

**📖 핵심 개념**

🎯 **비유**: 건물의 **방화문**입니다. `'use client'` 문을 지나면 그 안쪽(하위 트리에서 import되는 모듈들)은 전부 "클라이언트 구역"이 됩니다. 문 하나만 잘 배치하면 클라이언트 구역을 작게 유지할 수 있습니다.

📌 **경계는 "전염성(contagious)"이 있다**: 어떤 파일에 `'use client'`가 있으면, 그 파일이 `import`하는 모든 컴포넌트도 클라이언트 모듈로 취급됩니다(하위 컴포넌트에 다시 `'use client'`를 쓸 필요 없음). 그래서 경계는 **트리의 위쪽이 아니라 아래쪽(잎)에 두는 것**이 번들 관점에서 유리합니다.

📌 **서버 컴포넌트에서 못 하는 것 / 클라이언트에서 못 하는 것**:

| | 서버 컴포넌트 (기본) | 클라이언트 컴포넌트 (`'use client'`) |
|---|---|---|
| `useState`/`useReducer` | ❌ | ✅ |
| `useEffect`/`useLayoutEffect` | ❌ | ✅ |
| 이벤트 핸들러 (`onClick` 등) | ❌ | ✅ |
| 브라우저 API (`window`, `localStorage`) | ❌ | ✅ |
| `async`/`await` 컴포넌트 | ✅ | ❌ (컴포넌트 자체는 async 불가, `use`로 처리) |
| DB·파일시스템·시크릿 직접 접근 | ✅ | ❌ (클라이언트로 노출되면 안 됨) |
| 서버 전용/무거운 라이브러리 import | ✅ (번들 0) | ⚠️ (번들에 포함됨) |
| Context Provider 사용 | ⚠️ (값 소비 제한) | ✅ |

📌 **`'use client'`는 "클라이언트 전용"이 아니다**: 흔한 오해. 클라이언트 컴포넌트도 첫 요청에서는 **서버에서 SSR로 HTML을 한 번 그립니다.** 그다음 브라우저에서 하이드레이션되어 상호작용이 붙습니다. 즉 `'use client'`는 "이 컴포넌트는 클라이언트에서도 실행된다(=번들에 포함된다)"는 뜻이지 "서버에서 안 그린다"는 뜻이 아닙니다.

```jsx
// components/LikeButton.tsx
'use client';                 // ← 이 잎 컴포넌트만 클라이언트 경계
import { useState } from 'react';

export default function LikeButton({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);   // 상태 → 클라이언트 필수
  return <button onClick={() => setCount(c => c + 1)}>❤️ {count}</button>;
}
```
```jsx
// app/post/page.tsx — 서버 컴포넌트가 무거운 데이터 처리를 하고,
// 상호작용이 필요한 잎만 클라이언트 컴포넌트로 위임
import LikeButton from '@/components/LikeButton';
import db from '@/lib/db';

export default async function Post() {
  const post = await db.post.findFirst();
  return (
    <article>
      <h1>{post.title}</h1>
      <LikeButton initial={post.likes} />   {/* 클라이언트 잎 */}
    </article>
  );
}
```

**🔥 예상 꼬리질문**

**Q. `'use client'`를 최상위 레이아웃에 붙이면 어떻게 되나요?**
A. 그 아래 import되는 트리 전체가 클라이언트 번들에 포함되어 RSC의 번들 절감 이점이 대부분 사라집니다. App Router의 기본 이점을 살리려면 경계를 되도록 잎에 두어야 합니다.

**Q. 서버 컴포넌트를 클라이언트 컴포넌트 안에서 import하면요?**
A. 그렇게 `import`하면 해당 컴포넌트도 클라이언트 모듈로 끌려 들어가 서버 컴포넌트 특성을 잃습니다. 서버 컴포넌트를 클라이언트 트리 안에 두려면 import가 아니라 **`children`(또는 props)로 전달**해야 합니다(→ D5).

**Q. 클라이언트 컴포넌트를 서버 컴포넌트가 렌더하는 건 되나요?**
A. 됩니다. 그게 정상 패턴입니다. 서버 컴포넌트(부모)가 클라이언트 컴포넌트(자식)를 렌더하고, 직렬화 가능한 props를 내려주면 됩니다.

<details><summary>📝 한 줄 요약</summary>
`'use client'`는 클라이언트 경계를 여는 지시어로, 상태·이펙트·이벤트·브라우저 API가 필요한 잎에만 붙인다. 경계는 아래로 전염되며, 클라이언트 컴포넌트도 첫 렌더는 서버에서 SSR된다.
</details>

---

## D3. 서버에서 클라이언트로 넘길 수 있는 props와 없는 props는? (직렬화 경계) 🔴

**💬 30초 답변**
> 서버 컴포넌트가 클라이언트 컴포넌트에 props를 넘기면, 그 값은 **네트워크를 타고 직렬화(serialize)되어 전송**됩니다. 그래서 **직렬화 가능한 값만 넘길 수 있습니다** — 문자열·숫자·불리언·null·배열·평범한 객체·Date·Map/Set, 그리고 특별히 React 엘리먼트(JSX)와 Promise, Server Action 함수(참조)는 넘길 수 있습니다. 반대로 **함수(일반 함수·이벤트 핸들러)·클래스 인스턴스·심볼**은 직렬화가 안 돼서 넘기면 에러가 납니다. 이유는 명확합니다 — 서버에서 만든 함수의 클로저·실행 컨텍스트는 클라이언트로 옮길 수 없으니까요. 그래서 "서버 컴포넌트에서 만든 `onClick` 핸들러를 클라이언트 버튼에 넘긴다"는 안 됩니다.

**📖 핵심 개념**

🎯 **비유**: 서버→클라이언트 경계는 **국제 우편**입니다. 상자에 담아 부칠 수 있는 것(데이터: 편지·사진)만 보낼 수 있고, "우리 집 강아지의 실제 행동(함수의 실행 로직)"은 우편으로 못 보냅니다. 대신 "이 주소로 편지를 보내면 내가 처리할게"라는 **주소표(Server Action 참조)**는 보낼 수 있습니다.

📌 **넘길 수 있는 것 / 없는 것**:

| 넘길 수 있음 ✅ | 넘길 수 없음 ❌ |
|---|---|
| string, number, boolean, null, undefined | 일반 함수 / 이벤트 핸들러 |
| 평범한 객체 `{}`, 배열 `[]` | 클래스 인스턴스 (예: `new MyClass()`) |
| Date, Map, Set, BigInt, TypedArray | Symbol (전역 심볼 제외) |
| React 엘리먼트(JSX), `children` | DB 커넥션·스트림 등 서버 리소스 |
| Promise (클라이언트에서 `use`로 언랩) | getter/프로토타입 메서드가 핵심인 객체 |
| **Server Action** (`'use server'` 함수 참조) | 클로저를 담은 콜백 |

📌 **함수는 왜 안 되는데 Server Action은 되나?**: 일반 함수는 서버의 메모리·클로저에 묶여 있어 전송 불가입니다. 하지만 **Server Action**은 함수 자체를 보내는 게 아니라 **"이 액션을 가리키는 ID(참조)"**를 보냅니다. 클라이언트가 그 액션을 호출하면 React가 내부적으로 서버에 POST 요청을 보내 실제 함수를 서버에서 실행합니다. 즉 넘어가는 건 코드가 아니라 "호출 티켓"입니다.

```jsx
// ❌ 서버 컴포넌트에서 만든 일반 함수를 클라이언트에 넘기면 에러
export default function Server() {
  const handleClick = () => console.log('hi'); // 서버 클로저
  return <ClientButton onClick={handleClick} />; // 🚫 직렬화 불가 → 런타임 에러
}

// ✅ 직렬화 가능한 데이터만 넘긴다
export default async function Server() {
  const user = await getUser();                  // 평범한 객체
  return <ClientProfile name={user.name} joinedAt={user.joinedAt} />; // OK
}
```

**🔥 예상 꼬리질문**

**Q. 큰 객체 전체를 클라이언트 컴포넌트에 넘기면 문제가 되나요?**
A. 됩니다. props는 직렬화되어 RSC 페이로드에 실려 네트워크로 전송되므로, 필요 없는 큰 데이터를 통째로 넘기면 페이로드가 커집니다. 클라이언트가 실제로 쓰는 필드만 골라 넘기는 게 좋습니다.

**Q. 클라이언트 컴포넌트에서 서버 컴포넌트로 데이터를 "위로" 넘길 수는 있나요?**
A. 직접적인 props 전달은 방향이 서버→클라이언트라 불가합니다. 클라이언트에서 서버 로직을 실행하려면 Server Action을 호출하거나(뮤테이션), URL/검색 파라미터·라우트 변경을 통해 서버가 다시 렌더되게 합니다.

**Q. `Date`는 되는데 왜 클래스 인스턴스는 안 되나요?**
A. React의 직렬화기가 Date·Map·Set 같은 내장 타입은 알아서 복원할 수 있지만, 사용자 정의 클래스는 프로토타입·메서드를 복원할 방법이 없어(로직이 함수라서) 지원하지 않습니다. 필요하면 평범한 객체로 변환(`toJSON` 등)해 넘깁니다.

<details><summary>📝 한 줄 요약</summary>
서버→클라이언트 props는 직렬화되어 전송되므로 데이터(문자열·객체·JSX·Promise·Server Action 참조)만 넘길 수 있고, 함수·클래스 인스턴스·심볼은 못 넘긴다. Server Action은 코드가 아닌 "호출 참조"라서 예외적으로 가능하다.
</details>

---

## D4. 서버 컴포넌트에서는 데이터를 어떻게 가져오나요? 워터폴은 어떻게 피하나요? 🔴

**💬 30초 답변**
> 서버 컴포넌트는 **`async` 함수 컴포넌트**라서 컴포넌트 본문에서 바로 `await`로 데이터를 가져옵니다. `useEffect`+`useState`+로딩 스피너 패턴이 필요 없습니다. DB나 API를 직접 `await`하고 그 결과로 JSX를 만들면 됩니다. 주의점은 **요청 워터폴**입니다 — 부모가 데이터를 `await`한 뒤에야 자식이 렌더되고 자식이 또 `await`하면 순차적으로 느려집니다. 해결책은 ① **의존 없는 요청은 `Promise.all`로 병렬화**, ② **`<Suspense>`로 감싸 독립적인 부분을 스트리밍**해 느린 데이터가 빠른 UI를 막지 않게 하는 것입니다. Next.js에서는 `fetch`가 자동 캐싱·중복 제거(request memoization)되어 같은 요청을 여러 컴포넌트가 해도 한 번만 나갑니다.

**📖 핵심 개념**

🎯 **비유**: 워터폴은 **줄 서서 한 명씩** 물을 받는 것이고, `Promise.all`은 **여러 수도꼭지를 동시에** 트는 것입니다. `<Suspense>`는 "먼저 준비된 음식부터 손님상에 내는 코스 요리"입니다.

📌 **워터폴이 생기는 코드 vs 병렬 코드**:

```jsx
// ❌ 순차 워터폴 — user를 기다린 뒤에야 posts 요청 시작 (총 A+B 시간)
async function Page() {
  const user = await getUser();        // A초
  const posts = await getPosts();      // B초 — user와 무관한데 뒤에서 기다림
  return <Profile user={user} posts={posts} />;
}

// ✅ 병렬 — 두 요청을 동시에 (총 max(A, B) 시간)
async function Page() {
  const [user, posts] = await Promise.all([getUser(), getPosts()]);
  return <Profile user={user} posts={posts} />;
}
```

📌 **`<Suspense>`로 스트리밍**: 페이지의 빠른 부분을 먼저 보내고, 느린 부분은 준비되는 대로 스트리밍합니다. 서버 컴포넌트가 반환하는 Promise를 React가 이해해서, 준비 안 된 자리는 `fallback`을 먼저 보내고 나중에 실제 콘텐츠로 교체합니다.

```jsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <Header />                                  {/* 즉시 렌더 */}
      <Suspense fallback={<FeedSkeleton />}>
        <SlowFeed />                              {/* 느린 데이터 — 준비되면 스트리밍 */}
      </Suspense>
    </>
  );
}
async function SlowFeed() {
  const items = await getFeed();                 // 여기서 await해도 Header는 안 막힘
  return <ul>{items.map(i => <li key={i.id}>{i.text}</li>)}</ul>;
}
```

📌 **요청 중복 제거(Request Memoization)**: Next.js App Router에서 같은 렌더 패스 동안 동일한 `fetch(url)` 호출은 자동으로 캐시되어 한 번만 실행됩니다. 그래서 "레이아웃과 페이지가 각각 같은 사용자 정보를 fetch"해도 중복 요청이 안 나갑니다. (이 캐싱 계층·revalidate 전략은 07-25 Next.js 편에서 상세히 다룸.)

**🔥 예상 꼬리질문**

**Q. 클라이언트 컴포넌트에서 데이터 페칭은 이제 안 하나요?**
A. 여전히 필요합니다. 사용자 상호작용에 따라 바뀌는 데이터, 실시간/폴링, 무한 스크롤 등은 클라이언트에서 TanStack Query 같은 도구로 가져옵니다. RSC는 "초기·서버에서 알 수 있는 데이터"에 강하고, 클라이언트 페칭은 "상호작용 후 데이터"에 강합니다. (서버/클라이언트 상태 구분은 07-19 편 참고.)

**Q. 서버 컴포넌트에서 에러가 나면요?**
A. `error.tsx`(에러 바운더리)로 잡고, 데이터 없음은 `not-found.tsx`로 처리합니다. `<Suspense>`는 로딩을, 에러 바운더리는 실패를 담당합니다.

**Q. `await` 대신 Promise를 자식에게 넘겨도 되나요?**
A. 네. 서버에서 `await`하지 않고 Promise를 클라이언트 컴포넌트 props로 넘긴 뒤, 클라이언트에서 React 19의 `use(promise)`로 언랩하면 워터폴을 더 줄일 수 있습니다(요청은 일찍 시작, 대기는 필요한 곳에서).

<details><summary>📝 한 줄 요약</summary>
서버 컴포넌트는 async라 본문에서 바로 await로 데이터를 읽는다. 워터폴은 Promise.all 병렬화와 <Suspense> 스트리밍으로 피하고, Next.js는 동일 fetch를 자동 중복 제거한다.
</details>

---

## D5. 클라이언트 컴포넌트 안에 서버 컴포넌트를 넣을 수 있나요? (컴포지션 패턴) 🟡

**💬 30초 답변**
> 클라이언트 컴포넌트가 서버 컴포넌트를 **`import`해서 자식으로 렌더하는 것은 안 됩니다** — import하는 순간 그 서버 컴포넌트도 클라이언트 번들로 끌려 들어가 버리니까요. 대신 **`children`(또는 props로 JSX 슬롯)으로 끼워 넣으면 됩니다.** 서버 컴포넌트(부모)가 서버 컴포넌트를 미리 렌더해 그 결과를 클라이언트 컴포넌트의 `children`으로 전달하면, 클라이언트 컴포넌트는 "이미 렌더된 트리를 자리에 꽂기만" 합니다. 이 패턴 덕분에 예를 들어 클라이언트 상태를 가진 `<Tabs>`(상호작용) 안에 무거운 서버 컴포넌트 콘텐츠를 넣을 수 있습니다. 핵심 원리: **부모-자식 관계는 되지만, "클라이언트가 서버를 import"하는 방향은 안 된다. `children`은 이 방향 문제를 우회한다.**

**📖 핵심 개념**

🎯 **비유**: 클라이언트 컴포넌트는 **액자(프레임)**, 서버 컴포넌트는 **완성된 그림**입니다. 액자가 그림을 직접 "그리려(import)" 하면 물감·붓(서버 코드)이 액자 쪽으로 넘어와야 하니 안 됩니다. 대신 **다 그려진 그림을 액자에 끼우면(children)** 됩니다.

📌 **왜 import는 안 되고 children은 되나**: React가 트리를 만들 때, `children`으로 전달된 서버 컴포넌트는 **부모(서버)가 이미 렌더**해서 직렬화된 UI로 존재합니다. 클라이언트 컴포넌트는 그 자리(슬롯)에 결과를 배치할 뿐 서버 코드를 실행하지 않습니다. 반면 `import`하면 클라이언트 모듈 그래프에 서버 컴포넌트가 포함되어 버립니다.

```jsx
// ✅ 좋은 패턴 — 클라이언트 껍데기에 서버 콘텐츠를 children으로 주입
// components/Card.tsx  (클라이언트 — 상호작용/애니메이션 담당)
'use client';
import { useState } from 'react';
export default function Card({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}>{open ? '접기' : '펼치기'}</button>
      {open && children}          {/* 서버 컴포넌트 결과가 여기 꽂힌다 */}
    </div>
  );
}

// app/page.tsx  (서버 — 부모가 서버 콘텐츠를 렌더해서 넘김)
import Card from '@/components/Card';
import ServerHeavy from '@/components/ServerHeavy';  // 서버 컴포넌트
export default function Page() {
  return (
    <Card>
      <ServerHeavy />            {/* 부모(서버)가 렌더 → children으로 전달 → OK */}
    </Card>
  );
}
```

**🔥 예상 꼬리질문**

**Q. `children` 말고 다른 prop 이름의 슬롯도 되나요?**
A. 됩니다. `children`뿐 아니라 `header={<ServerComp/>}`처럼 이름 있는 JSX prop 슬롯으로도 서버 컴포넌트를 전달할 수 있습니다. 핵심은 "JSX(엘리먼트)로 전달"이지 "import"가 아니라는 점입니다.

**Q. 이 패턴이 성능상 왜 중요한가요?**
A. 상호작용이 필요한 껍데기(Provider, Modal, Tabs, Theme 토글 등)만 클라이언트로 두고, 그 안의 무거운 콘텐츠는 서버 컴포넌트로 유지할 수 있어 클라이언트 번들을 최소화합니다. Context Provider를 클라이언트로 만들고 `children`으로 앱 전체(서버 트리)를 감싸는 게 대표 사례입니다.

<details><summary>📝 한 줄 요약</summary>
클라이언트 컴포넌트가 서버 컴포넌트를 import하면 클라이언트 번들로 끌려온다. 대신 부모 서버 컴포넌트가 렌더해 children/JSX 슬롯으로 주입하면, 상호작용 껍데기 안에 서버 콘텐츠를 둘 수 있다.
</details>

---

## D6. Server Actions(`'use server'`)란 무엇이고, 폼 처리를 어떻게 하나요? 🔴

**💬 30초 답변**
> Server Action은 **`'use server'` 지시어가 붙은, 클라이언트에서 호출하면 서버에서 실행되는 비동기 함수**입니다. 기존엔 폼을 제출하려면 API 라우트(엔드포인트)를 만들고 클라이언트에서 `fetch`하는 배관이 필요했는데, Server Action은 **그 함수를 그냥 `<form action={myAction}>`에 넘기거나 이벤트에서 호출**하면 React가 내부적으로 서버에 요청을 보내 실행해 줍니다. 서버에서 DB 뮤테이션을 하고 `revalidatePath`로 캐시를 무효화하면 관련 화면이 갱신됩니다. React 19에서는 폼 상태를 다루는 `useActionState`(액션 결과·pending 관리)와 `useFormStatus`(제출 중 여부)를 함께 씁니다. 요약: **Server Action = "타입 안전한, 배관 없는 서버 함수 호출"**입니다.

**📖 핵심 개념**

🎯 **비유**: 예전에는 주방(서버)에 주문하려면 전화선을 직접 깔고(API 라우트), 번호를 눌러(fetch) 주문했습니다. Server Action은 **테이블마다 놓인 호출벨** 같아서, 버튼만 누르면 주방이 알아서 처리합니다 — 전화선 배관을 개발자가 안 깔아도 됩니다.

📌 **정의 위치 두 가지**: ① 파일 맨 위에 `'use server'`를 적으면 그 파일의 export 함수 전부가 Server Action(서버 모듈). ② 서버 컴포넌트 안에서 함수 본문 맨 위에 `'use server'`를 적으면 그 함수만 인라인 Server Action.

📌 **점진적 향상(Progressive Enhancement)**: `<form action={action}>`에 Server Action을 붙이면 자바스크립트가 로드되기 전이나 실패해도 폼이 동작합니다(브라우저 기본 폼 제출로 서버 액션 실행). 이건 클라이언트 `onSubmit`+`fetch` 방식이 못 주는 이점입니다.

```jsx
// app/todos/actions.ts
'use server';                          // 이 파일의 export는 전부 Server Action
import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

export async function addTodo(formData: FormData) {
  const text = String(formData.get('text') ?? '').trim();
  if (!text) return;
  await db.todo.create({ data: { text } });   // 서버에서 DB 뮤테이션
  revalidatePath('/todos');                    // 캐시 무효화 → 목록 갱신
}
```
```jsx
// app/todos/page.tsx  (서버 컴포넌트)
import { addTodo } from './actions';
export default async function Page() {
  const todos = await db.todo.findMany();
  return (
    <>
      <form action={addTodo}>               {/* 배관 없이 서버 함수를 폼에 연결 */}
        <input name="text" />
        <button type="submit">추가</button>
      </form>
      <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>
    </>
  );
}
```

📌 **React 19 폼 훅**: 제출 상태·결과 메시지를 다룰 때 사용합니다.

```jsx
'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { addTodo } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();          // 부모 <form>의 제출 중 여부
  return <button disabled={pending}>{pending ? '추가 중…' : '추가'}</button>;
}

export function TodoForm() {
  // [상태, 폼에 넘길 액션, isPending] — 액션 반환값이 state로 들어옴
  const [state, formAction, isPending] = useActionState(addTodo, null);
  return (
    <form action={formAction}>
      <input name="text" />
      <SubmitButton />
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

**🔥 예상 꼬리질문**

**Q. Server Action은 보안상 안전한가요? 아무나 호출할 수 있나요?**
A. Server Action은 서버에 노출된 엔드포인트로 컴파일되므로 **공개 API처럼 취급**해야 합니다. 즉 액션 내부에서 반드시 인증·인가·입력 검증(zod 등)을 해야 합니다. "클라이언트에서만 호출된다"고 신뢰하면 안 됩니다.

**Q. `revalidatePath`/`revalidateTag`는 무슨 역할인가요?**
A. 뮤테이션 후 Next.js의 캐시(Data Cache·Full Route Cache)를 무효화해, 다음 렌더에서 최신 데이터를 다시 가져오게 합니다. 이게 없으면 DB는 바뀌었는데 화면은 캐시된 옛 데이터를 보여줄 수 있습니다. (캐시 계층 상세는 07-25 편.)

**Q. 낙관적 업데이트(optimistic update)는 어떻게 하나요?**
A. React 19의 `useOptimistic` 훅으로 서버 응답 전에 UI를 먼저 갱신하고, 액션이 끝나면 실제 상태로 수렴시킵니다. 폼 제출 체감 속도를 높이는 데 씁니다.

**Q. Server Action 대신 API 라우트를 써야 할 때는?**
A. 외부(모바일 앱·서드파티)에서 호출하는 공개 REST/웹훅, 파일 스트리밍 응답 등은 여전히 Route Handler(API 라우트)가 적합합니다. Server Action은 "내 앱의 폼·뮤테이션"에 최적입니다.

<details><summary>📝 한 줄 요약</summary>
Server Action은 `'use server'`가 붙어 클라이언트에서 호출하면 서버에서 실행되는 함수로, API 배관 없이 form action에 연결해 뮤테이션한다. 공개 엔드포인트로 취급해 인증·검증은 필수이며, React 19의 useActionState/useFormStatus로 상태를 다룬다.
</details>

---

## D7. RSC는 서버에서 클라이언트로 무엇을, 어떻게 보내나요? (Flight 페이로드) 🟢

**💬 30초 답변**
> 서버 컴포넌트를 렌더한 결과는 HTML이 아니라 **"RSC 페이로드"**라는 특수한 직렬화 포맷(내부 코드명 **Flight**)으로 전송됩니다. 이 페이로드는 렌더된 서버 컴포넌트 트리, 클라이언트 컴포넌트가 들어갈 자리(placeholder)와 그 컴포넌트를 가리키는 참조(어떤 JS 청크를 로드할지), 그리고 props를 담은 **줄 단위로 스트리밍되는 텍스트**입니다. 브라우저의 React가 이 페이로드를 읽어 실제 트리로 재구성하고, placeholder 자리에 클라이언트 컴포넌트를 하이드레이션합니다. 첫 방문에서는 서버가 이 페이로드로 HTML도 함께 만들어(SSR) 보내 빠른 첫 화면을 주고, 이후 라우트 이동 시에는 HTML 전체가 아니라 **RSC 페이로드만** 받아 트리를 부분 갱신합니다. 그래서 페이지 이동이 전체 새로고침 없이 매끄럽습니다.

**📖 핵심 개념**

🎯 **비유**: RSC 페이로드는 **조립 설명서 + 완성된 부품 사진**입니다. 서버 부분은 이미 조립돼 사진(직렬화 UI)으로 오고, 클라이언트 부분은 "여기에 3번 부품(이 JS 청크)을 끼우세요"라는 표시로 옵니다. 브라우저는 사진은 그대로 붙이고, 표시된 자리에만 부품을 끼워(하이드레이션) 완성합니다.

📌 **HTML이 아니라 페이로드인 이유**: HTML만 보내면 클라이언트가 트리를 "React가 이해하는 구조"로 되살릴 수 없고, 부분 갱신(라우트 이동)도 못 합니다. RSC 페이로드는 React 트리를 그대로 표현하므로, 클라이언트 상태를 유지한 채 서버 트리만 교체하는 "부분 리렌더"가 가능합니다.

📌 **스트리밍과의 결합**: 페이로드는 한 번에 완성되어 오지 않고 준비된 조각부터 흘러옵니다(`<Suspense>` 경계 단위). 그래서 느린 데이터가 준비되기 전에도 나머지 UI가 먼저 그려집니다(→ D4). (스트리밍·TTFB는 07-25 편과 연결.)

📌 **하이드레이션 대상 축소**: 서버 컴포넌트는 하이드레이션이 필요 없습니다(상호작용이 없으니까). 클라이언트 컴포넌트만 하이드레이션하므로, 전통적 SSR보다 **하이드레이션 비용(브라우저에서 JS 실행량)**이 줄어듭니다. 이게 INP·TBT 같은 상호작용 지표에 유리합니다. (렌더링 성능 지표는 07-20 편.)

**🔥 예상 꼬리질문**

**Q. 페이로드가 HTML보다 항상 작나요?**
A. 상황에 따라 다릅니다. 다만 라우트 이동 시 전체 문서 대신 변경된 트리의 페이로드만 받으므로 이동 트래픽은 작습니다. 핵심 이점은 크기보다 "React가 이해하는 구조라 부분 갱신이 가능하다"는 점입니다.

**Q. Flight 포맷을 직접 알아야 하나요?**
A. 실무·면접에서 내부 바이트 포맷을 외울 필요는 없습니다. "서버 컴포넌트는 HTML이 아니라 React 트리를 표현하는 직렬화 페이로드로 스트리밍되고, 클라이언트 컴포넌트 자리엔 참조가 들어간다"는 개념만 설명하면 충분합니다.

<details><summary>📝 한 줄 요약</summary>
RSC 결과는 HTML이 아니라 React 트리를 표현하는 직렬화 페이로드(Flight)로 스트리밍되며, 클라이언트 컴포넌트 자리엔 로드할 청크 참조가 담긴다. 덕분에 라우트 이동 시 부분 갱신이 가능하고 하이드레이션 대상이 줄어든다.
</details>

---

## D8. RSC에서 흔히 하는 오해와 함정은? 🟡

**💬 30초 답변**
> 대표적 오해 다섯 가지입니다. ① **"`'use client'`면 서버에서 안 그린다"** — 아닙니다, 클라이언트 컴포넌트도 첫 요청엔 SSR로 HTML을 그립니다. ② **"RSC가 SSR을 대체한다"** — 아닙니다, 위치(RSC)와 초기 렌더(SSR)는 다른 층이고 함께 씁니다. ③ **"서버 컴포넌트에서 useState/useEffect를 쓸 수 있다"** — 못 씁니다, 상태·이펙트·브라우저 API는 클라이언트 전용. ④ **"클라이언트에 함수를 props로 넘길 수 있다"** — 일반 함수는 직렬화 불가, Server Action만 예외. ⑤ **"환경변수·시크릿을 서버 컴포넌트에서 쓰면 클라이언트로 샌다"** — 서버 컴포넌트 코드는 클라이언트로 안 가므로 안전하지만, 클라이언트 컴포넌트에서 시크릿을 참조하면 번들에 포함돼 노출됩니다.

**📖 핵심 개념**

📌 **함정 1 — `'use client'`를 트리 위쪽에 남발**: 최상위 레이아웃/Provider에 `'use client'`를 붙이면 아래 트리가 전부 클라이언트가 되어 RSC 이점이 사라집니다. Provider는 `children`을 받는 얇은 클라이언트 껍데기로 만들고, 실제 콘텐츠는 서버로 유지하세요(→ D5).

📌 **함정 2 — 서버 전용 코드가 클라이언트로 새는 것**: DB 클라이언트·시크릿을 쓰는 모듈을 클라이언트 컴포넌트가 import하면 번들에 포함되어 노출·에러가 납니다. `server-only` 패키지를 import해두면 실수로 클라이언트에서 쓸 때 빌드 에러로 막아 줍니다.

```jsx
// lib/db.ts — 실수로 클라이언트에서 import되면 빌드 시점에 에러로 잡힌다
import 'server-only';
import { PrismaClient } from '@prisma/client';
export default new PrismaClient();
```

📌 **함정 3 — 서버 컴포넌트에 이벤트 핸들러**: `<button onClick={...}>`를 서버 컴포넌트에 쓰면 에러입니다. 상호작용이 필요한 부분만 잘라 `'use client'` 잎으로 분리하세요.

📌 **함정 4 — `window`/`localStorage` 접근**: 서버 컴포넌트엔 브라우저 전역이 없습니다. 브라우저 API는 클라이언트 컴포넌트의 `useEffect`나 이벤트 안에서만 접근하세요. (브라우저 저장소는 07-31 편.)

📌 **함정 5 — Server Action을 신뢰 경계로 착각**: Server Action은 공개 엔드포인트입니다. 내부에서 세션 확인·권한 검사·입력 검증을 반드시 하세요(→ D6). (인증·인가는 08-04 편.)

**🔥 예상 꼬리질문**

**Q. "서버 컴포넌트를 쓰면 클라이언트 상태 관리 라이브러리가 필요 없다"는 맞나요?**
A. 부분적으로만 맞습니다. 서버에서 알 수 있는 데이터는 RSC로 가져와 전역 상태가 줄지만, 상호작용·클라이언트 전용 UI 상태(모달 열림, 폼 입력, 탭 등)는 여전히 클라이언트 상태로 관리합니다. (07-19 상태 설계 편 참고.)

**Q. 서버 컴포넌트와 클라이언트 컴포넌트, 무엇을 기본으로 삼아야 하나요?**
A. **서버 컴포넌트를 기본**으로 두고, "상호작용/상태/브라우저 API가 필요한 순간"에만 잎을 클라이언트로 전환하는 게 App Router의 권장 멘탈 모델입니다. 클라이언트 경계는 최대한 작고 아래로.

<details><summary>📝 한 줄 요약</summary>
`'use client'`는 서버 렌더를 끄지 않고, RSC는 SSR을 대체하지 않으며, 서버 컴포넌트엔 상태·이펙트·이벤트·브라우저 API·일반 함수 props가 없다. 서버 컴포넌트를 기본으로, 클라이언트 경계는 작고 아래로, Server Action은 공개 엔드포인트로 취급하라.
</details>

---

## 🎯 오늘의 핵심 5문장 (면접 직전 암기)

1. **RSC는 "서버에서만 실행되고 JS가 클라이언트로 안 가는 컴포넌트"**로, 컴포넌트의 실행 위치를 서버로 옮겨 번들을 줄이고 데이터에 직접 접근한다 — SSR(초기 HTML 렌더)과는 다른 층이며 함께 동작한다.
2. **App Router는 기본이 서버 컴포넌트**이고, 상태·이펙트·이벤트·브라우저 API가 필요한 **잎에만 `'use client'`**를 붙인다. 경계는 아래로 전염되므로 작고 낮게 둔다.
3. **서버→클라이언트 props는 직렬화되어 전송**되므로 데이터(문자열·객체·JSX·Promise·Server Action 참조)만 넘길 수 있고, **일반 함수·클래스 인스턴스는 못 넘긴다.**
4. **서버 컴포넌트는 async라 본문에서 바로 `await`**로 데이터를 읽고, 워터폴은 `Promise.all` 병렬화와 `<Suspense>` 스트리밍으로 피한다. 클라이언트가 서버 컴포넌트를 쓰려면 import가 아니라 **`children`으로 주입**한다.
5. **Server Action(`'use server'`)**은 배관 없이 `form action`에 연결하는 서버 함수지만 **공개 엔드포인트**이므로 인증·검증은 필수다. React 19의 `useActionState`/`useFormStatus`/`useOptimistic`로 폼 상태를 다룬다.
