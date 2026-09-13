# 브라우저 저장소 심화 · 쿠키 · Web Storage · IndexedDB · Cache Storage

> 주제: 신입~주니어 프론트엔드가 면접에서 "localStorage에 토큰 저장했어요"를 넘어 "브라우저가 제공하는 저장소들이 각각 어떤 특성(용량·수명·동기/비동기·서버 전송·오리진 격리)을 갖고, 언제 무엇을 써야 하는지, 왜 인증 토큰을 함부로 localStorage에 두면 안 되는지"를 원리로 설명할 줄 안다를 보여주는 심화 — 쿠키(속성·SameSite·수명), Web Storage(localStorage/sessionStorage), IndexedDB, Cache Storage, 저장소 선택 기준과 보안, 용량 한도와 Storage 관리(persistence/eviction)
> 출처: 일일 심화 자료 (기존 5.common.md Q77 "브라우저 캐싱", Q83 "세션·쿠키 보안", 2026-07-21 웹 보안 자료의 토큰 저장 전략을 CS 기초 관점에서 저장소별로 확장한 편)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-브라우저에서-데이터를-저장하는-방법에는-무엇이-있고-어떻게-다른가요) | 브라우저 저장소 종류와 차이 | 🔴 |
| [D2](#d2-localstorage와-sessionstorage의-차이는-무엇인가요) | localStorage vs sessionStorage | 🔴 |
| [D3](#d3-쿠키란-무엇이고-어떤-속성들이-있나요) | 쿠키와 속성(SameSite·HttpOnly 등) | 🔴 |
| [D4](#d4-쿠키와-web-storage는-언제-무엇을-쓰나요) | 쿠키 vs Web Storage 선택 | 🔴 |
| [D5](#d5-인증-토큰은-어디에-저장해야-하나요-localstorage-vs-쿠키) | 토큰 저장 위치(보안) | 🔴 |
| [D6](#d6-indexeddb는-무엇이고-언제-쓰나요) | IndexedDB | 🟡 |
| [D7](#d7-cache-storage와-service-worker는-저장소로서-어떤-역할인가요) | Cache Storage · Service Worker | 🟡 |
| [D8](#d8-저장소-용량-한도와-데이터가-지워지는-eviction-규칙은-어떻게-되나요) | 용량 한도 · eviction · persistence | 🟢 |
| [D9](#d9-web-storage-사용-시-실무에서-주의할-점은) | Web Storage 실무 함정 | 🟡 |

---

## D1. 브라우저에서 데이터를 저장하는 방법에는 무엇이 있고, 어떻게 다른가요? 🔴

**💬 30초 답변**
> 크게 **쿠키(Cookie)**, **Web Storage(localStorage·sessionStorage)**, **IndexedDB**, **Cache Storage** 네 가지가 있습니다. 핵심 축은 ① **용량**(쿠키 ~4KB, Web Storage ~5MB, IndexedDB·Cache는 수십 MB~수 GB), ② **수명**(세션 한정 vs 영속 vs 만료일 지정), ③ **서버 전송 여부**(쿠키만 매 요청에 자동 첨부, 나머지는 클라이언트 전용), ④ **동기 vs 비동기**(Web Storage는 동기 blocking, IndexedDB·Cache는 비동기), ⑤ **저장 자료형**(Web Storage·쿠키는 문자열만, IndexedDB는 구조화된 객체)입니다. 이 특성 차이로 용도가 갈립니다.

**📖 핵심 개념**

🎯 **비유**: 저장소들은 "가방 종류"와 같습니다. 쿠키는 **매번 서버에 들고 가는 작은 명찰**(용량 작고 자동 첨부), Web Storage는 **집 서랍**(꺼내 쓰기 쉽지만 서버엔 안 감), IndexedDB는 **집 안의 캐비닛형 정리 서랍장**(구조화된 대용량 보관), Cache Storage는 **자주 쓰는 물건을 문 앞에 미리 꺼내둔 선반**(네트워크 응답을 통째로 보관).

📌 **한눈 비교표**

| 특성 | 쿠키 | localStorage | sessionStorage | IndexedDB | Cache Storage |
|---|---|---|---|---|---|
| 용량 | ~4KB/도메인 | ~5~10MB | ~5~10MB | 수백MB~GB | 수백MB~GB |
| 수명 | 만료일/세션 지정 | 영구(수동 삭제 전까지) | 탭 닫으면 삭제 | 영구 | 영구 |
| 서버 자동 전송 | ✅ 매 요청 첨부 | ❌ | ❌ | ❌ | ❌ |
| API 방식 | 문자열(`document.cookie`) | 동기 | 동기 | 비동기(이벤트/Promise) | 비동기(Promise) |
| 저장 형태 | 문자열 | 문자열 | 문자열 | 구조화 객체(키-값) | Request/Response 쌍 |
| JS 접근 차단 | HttpOnly면 불가 | 항상 가능 | 항상 가능 | 가능 | 가능 |

📌 **공통 원칙 — 오리진(Origin) 격리**: 모든 저장소는 **오리진(scheme + host + port) 단위로 샌드박싱**됩니다. `https://a.com`이 저장한 데이터를 `https://b.com`이나 `http://a.com`(스킴 다름)은 읽을 수 없습니다. 쿠키는 예외적으로 오리진이 아니라 **도메인/경로(Domain/Path) 스코프**로 동작해 스킴·포트를 (기본적으로) 구분하지 않는 등 규칙이 다릅니다.

**🔥 예상 꼬리질문**
- Q. `WebSQL`은 왜 안 쓰나요? → A. 표준화가 폐기(deprecated)돼 더 이상 권장되지 않습니다. 구조화 저장이 필요하면 IndexedDB를 씁니다.
- Q. 어떤 게 가장 빠른가요? → A. Web Storage는 동기라 소량이면 즉시 접근하지만 **메인 스레드를 블로킹**합니다. 대량/빈번한 접근은 비동기인 IndexedDB가 UI 끊김이 적습니다.

<details><summary>📝 한 줄 요약</summary>쿠키(작고·서버자동전송) / Web Storage(중간·동기·클라전용) / IndexedDB(대용량·비동기·구조화) / Cache(응답 저장). 선택축 = 용량·수명·서버전송·동기여부·자료형, 모두 오리진 격리.</details>

---

## D2. localStorage와 sessionStorage의 차이는 무엇인가요? 🔴

**💬 30초 답변**
> 둘 다 **Web Storage API**로 쓰는 법(`setItem`/`getItem`)과 용량(~5MB), 문자열만 저장, 동기 방식은 같습니다. 차이는 **수명과 범위**입니다. `localStorage`는 **명시적으로 지우기 전까지 영구** 보존되고 **같은 오리진의 모든 탭·창이 공유**합니다. `sessionStorage`는 **탭(브라우징 컨텍스트) 단위로 격리**되어 그 탭을 닫으면 사라지고, 다른 탭과 공유되지 않습니다. "로그인 유지 체크"처럼 오래 남길 값은 localStorage, "이 탭에서만 쓰는 임시 폼 데이터"는 sessionStorage가 맞습니다.

**📖 핵심 개념**

🎯 **비유**: localStorage는 **집 공용 게시판**(가족 누구나 보고 안 지우면 계속 남음), sessionStorage는 **내 책상 위 포스트잇**(내 자리에서만 보이고 자리를 뜨면 버려짐).

📌 **탭 공유 규칙 디테일**: sessionStorage는 "탭을 새로고침(F5)"해도 유지되지만 "탭을 닫으면" 삭제됩니다. 링크를 `target="_blank"`로 새 탭에 열면 원본 세션 스토리지가 **복제(copy)**될 수 있으나(초기값만), 이후에는 서로 독립적입니다. 완전히 새로 연 탭은 빈 sessionStorage로 시작합니다.

📌 **`storage` 이벤트**: localStorage(및 sessionStorage) 값이 바뀌면 **같은 오리진의 다른 탭에서** `window`에 `storage` 이벤트가 발생합니다. 값을 바꾼 **바로 그 탭에서는 발생하지 않는 것**이 핵심 — 탭 간 동기화(예: 한 탭에서 로그아웃하면 다른 탭도 로그아웃)에 유용합니다.

```js
// 공통 API (localStorage / sessionStorage 동일)
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme'); // 'dark'
localStorage.removeItem('theme');
localStorage.clear();

// 객체는 반드시 직렬화(문자열만 저장 가능)
const user = { id: 1, name: 'Buzz' };
localStorage.setItem('user', JSON.stringify(user));
const parsed = JSON.parse(localStorage.getItem('user')); // {id:1, name:'Buzz'}

// 탭 간 동기화: 다른 탭에서의 변경 감지
window.addEventListener('storage', (e) => {
  if (e.key === 'auth' && e.newValue === null) {
    // 다른 탭에서 로그아웃됨 → 이 탭도 로그아웃 처리
    location.reload();
  }
});
```

**🔥 예상 꼬리질문**
- Q. sessionStorage는 서로 다른 창(window)끼리 공유되나요? → A. 아니요. 탭/창 각각의 브라우징 컨텍스트에 묶입니다. 같은 사이트라도 다른 탭이면 별개입니다.
- Q. `storage` 이벤트가 값 바꾼 탭 자신에서도 오나요? → A. 오지 않습니다. 그래서 한 탭 안에서의 반응이 필요하면 직접 상태를 갱신하거나 `BroadcastChannel`을 씁니다.
- Q. sessionStorage인데 새로고침해도 남는 이유는? → A. 새로고침은 브라우징 컨텍스트를 유지하기 때문입니다. 탭을 완전히 닫아야 세션이 종료됩니다.

<details><summary>📝 한 줄 요약</summary>둘 다 Web Storage(문자열·동기·~5MB). local=영구+전탭공유, session=탭 단위+탭 닫으면 삭제. 다른 탭 변경은 `storage` 이벤트로 감지(자기 탭 제외).</details>

---

## D3. 쿠키란 무엇이고, 어떤 속성들이 있나요? 🔴

**💬 30초 답변**
> 쿠키는 서버가 `Set-Cookie` 헤더로 브라우저에 심고, 이후 브라우저가 **같은 도메인 요청마다 `Cookie` 헤더로 자동 첨부**하는 작은(~4KB) 문자열입니다. 상태를 저장하지 않는 HTTP에 **세션·로그인 상태를 유지**시키는 용도가 대표적입니다. 핵심 속성은 수명을 정하는 `Expires`/`Max-Age`, 전송 스코프인 `Domain`/`Path`, 그리고 보안 속성인 **`HttpOnly`(JS 접근 차단 → XSS로 탈취 방지)**, **`Secure`(HTTPS에서만 전송)**, **`SameSite`(교차 사이트 전송 제어 → CSRF 방어)**입니다.

**📖 핵심 개념**

🎯 **비유**: 쿠키는 **놀이공원 손목 밴드**입니다. 입장할 때(로그인) 직원이 채워주고(`Set-Cookie`), 놀이기구 탈 때마다 자동으로 보여줍니다(매 요청 자동 첨부). `HttpOnly`는 "손님이 직접 밴드를 떼서 볼 수 없게" 봉인한 것과 같습니다.

📌 **주요 속성 정리**

- `Expires=<날짜>` / `Max-Age=<초>`: 만료 시점. 둘 다 없으면 **세션 쿠키**(브라우저 닫으면 삭제). `Max-Age`가 `Expires`보다 우선.
- `Domain=example.com`: 쿠키가 전송될 도메인. 생략 시 현재 호스트에만. 지정하면 **서브도메인 포함**(`api.example.com`도 전송).
- `Path=/admin`: 해당 경로 이하에서만 전송.
- `Secure`: **HTTPS 연결에서만** 전송(중간자 탈취 방지).
- `HttpOnly`: **JavaScript(`document.cookie`)로 접근 불가**. XSS가 나도 쿠키를 훔치기 어렵게 함. 인증 쿠키의 필수 방어.
- `SameSite`: 교차 사이트 요청에 쿠키를 붙일지 제어.
  - `Strict`: 외부 사이트에서 온 요청엔 절대 안 붙임(가장 안전, 외부 링크로 진입 시 로그인 풀린 것처럼 보일 수 있음).
  - `Lax`(현대 브라우저 기본값): 최상위 내비게이션(링크 클릭 등 GET)엔 붙지만, 교차 사이트 POST·iframe·fetch엔 안 붙음. CSRF를 상당 부분 막음.
  - `None`: 교차 사이트에도 전송. 반드시 `Secure`와 함께여야 함(서드파티 쿠키).

```http
Set-Cookie: session=abc123; Max-Age=3600; Domain=example.com; Path=/;
            Secure; HttpOnly; SameSite=Lax
```

```js
// 클라이언트에서 쿠키 읽기/쓰기 (HttpOnly 쿠키는 여기서 안 보임)
document.cookie = "theme=dark; max-age=86400; path=/; SameSite=Lax";
console.log(document.cookie); // "theme=dark" (HttpOnly 쿠키는 제외됨)
// 참고: 최신 브라우저는 비동기 Cookie Store API(cookieStore.get/set)도 제공
```

📌 **`__Host-` / `__Secure-` 접두사**: 쿠키 이름을 `__Host-`로 시작하면 브라우저가 `Secure` + `Path=/` + `Domain` 미지정(현재 호스트 고정)을 강제해 하위도메인 공격 표면을 줄입니다. 보안 쿠키의 모범 사례.

**🔥 예상 꼬리질문**
- Q. `HttpOnly`면 XSS로부터 완전히 안전한가요? → A. **쿠키 값 탈취**는 막지만, 공격자가 이미 브라우저에서 실행 중이면 그 쿠키가 자동 첨부되는 요청을 **대신 보내는(CSRF-유사)** 행위는 가능합니다. CSP·입력 검증 등 다층 방어가 필요합니다.
- Q. 서드파티 쿠키가 사라진다는 게 무슨 의미인가요? → A. 브라우저들이 교차 사이트 추적 방지를 위해 `SameSite=None` 서드파티 쿠키를 차단/제한하는 방향입니다. 광고·임베드 인증 등이 영향받아 대체 방식(파티셔닝 등)이 논의됩니다.
- Q. 쿠키 4KB 제한이 왜 중요한가요? → A. 매 요청에 실려 나가므로 커지면 **모든 요청의 오버헤드**가 됩니다. 큰 데이터를 쿠키에 넣으면 안 되는 이유입니다.

<details><summary>📝 한 줄 요약</summary>쿠키=서버가 심고 매 요청 자동 첨부되는 ~4KB 문자열. 보안 3속성 필수: HttpOnly(XSS 탈취방지)·Secure(HTTPS만)·SameSite(CSRF 방어). `__Host-` 접두사는 모범사례.</details>

---

## D4. 쿠키와 Web Storage는 언제 무엇을 쓰나요? 🔴

**💬 30초 답변**
> 판단 기준은 **"이 데이터가 서버에 자동으로 가야 하는가"**입니다. 서버가 매 요청마다 알아야 하는 값(세션 ID, 인증 상태)은 **쿠키**가 맞습니다. 자동 첨부되고 `HttpOnly`로 보호할 수 있기 때문입니다. 반대로 서버는 몰라도 되고 **클라이언트에서만 쓰는 값**(다크모드 설정, 최근 검색어, UI 상태)은 **Web Storage**가 맞습니다. 매 요청에 쓸데없이 실려 네트워크를 낭비하지 않기 때문입니다. 용량이 크면(수 MB 이상) IndexedDB로 갑니다.

**📖 핵심 개념**

📌 **결정 흐름**
1. 서버가 매 요청마다 필요로 하는가? → **예: 쿠키**(가급적 HttpOnly).
2. 클라이언트 전용 + 작은 값(설정·플래그)인가? → **localStorage/sessionStorage**.
3. 클라이언트 전용 + 대용량/구조화 데이터인가? → **IndexedDB**.
4. 네트워크 응답(파일·API)을 오프라인용으로 저장? → **Cache Storage**.

📌 **흔한 실수**: "간편하다"는 이유로 인증 토큰을 localStorage에 넣는 것. 서버 전송이 필요하면 매번 JS로 헤더에 붙여야 하고, 무엇보다 **XSS에 그대로 노출**됩니다(D5 참고).

**🔥 예상 꼬리질문**
- Q. 다크모드 설정은 어디에? → A. 클라 전용이므로 localStorage. 단, SSR에서 첫 페인트 깜빡임(FOUC)을 막으려면 서버도 알아야 해서 **쿠키에 두는 패턴**도 많습니다(서버 렌더 시 테마 반영).
- Q. 장바구니는? → A. 비로그인 임시 장바구니는 localStorage로 클라 보관, 로그인 후엔 서버 DB로 병합하는 하이브리드가 일반적입니다.

<details><summary>📝 한 줄 요약</summary>"서버가 매 요청 알아야 하나?"가 갈림길. 예→쿠키(HttpOnly), 아니오+작음→Web Storage, 아니오+대용량→IndexedDB, 응답 저장→Cache. 토큰을 편하다고 localStorage에 넣지 말 것.</details>

---

## D5. 인증 토큰은 어디에 저장해야 하나요? (localStorage vs 쿠키) 🔴

**💬 30초 답변**
> 결론부터 말하면 **`HttpOnly` + `Secure` + `SameSite` 쿠키가 가장 안전**합니다. localStorage에 토큰을 두면 **어떤 XSS 스크립트든 `localStorage.getItem`으로 토큰을 통째로 탈취**할 수 있습니다. 반면 HttpOnly 쿠키는 JS에서 읽을 수 없어 XSS로 값을 빼내기 어렵습니다. 쿠키는 대신 **CSRF에 노출**되므로 `SameSite=Lax/Strict`와 CSRF 토큰으로 막습니다. 정리하면 localStorage=XSS 취약, 쿠키=CSRF는 대비 가능한 XSS 방어. 그래서 실무에선 쿠키 방식을 기본으로 권장합니다.

**📖 핵심 개념**

📌 **위협 모델 대비표**

| 저장 위치 | XSS 취약성 | CSRF 취약성 | 서버 전송 |
|---|---|---|---|
| localStorage | **높음**(JS가 직접 읽음) | 낮음(자동 첨부 아님) | 수동(헤더에 직접) |
| HttpOnly 쿠키 | **낮음**(JS 접근 불가) | 있음 → SameSite/CSRF토큰으로 방어 | 자동 첨부 |

🎯 **비유**: localStorage 토큰은 **현관 열쇠를 신발장 위에 그냥 둔 것** — 집에 들어온 도둑(XSS)이 바로 집어갑니다. HttpOnly 쿠키는 **금고 안 열쇠** — 도둑이 있어도 금고를 못 열어 꺼내가기 어렵습니다(대신 금고째 심부름 시키는 CSRF는 별도 자물쇠로 막음).

📌 **자주 나오는 반론 정리**
- "localStorage + 짧은 만료 + 리프레시 토큰이면 되지 않나?" → XSS가 나면 짧은 창이라도 탈취·악용됩니다. 근본적으로 JS 접근 가능이 문제.
- "SPA라 쿠키 CSRF가 신경 쓰인다" → `SameSite=Lax` 기본에 상태 변경 요청은 CSRF 토큰(더블 서브밋)이나 커스텀 헤더 검증으로 막습니다.
- **가장 중요한 전제**: 어떤 방식이든 **XSS 자체를 없애는 것**(출력 이스케이프·CSP·신뢰할 수 없는 HTML 삽입 금지)이 최우선입니다.

```js
// ❌ 안티패턴: XSS에 그대로 노출
localStorage.setItem('accessToken', token);
const t = localStorage.getItem('accessToken'); // 악성 스크립트도 동일하게 읽음

// ✅ 권장: 서버가 HttpOnly 쿠키로 발급, 클라는 토큰을 만지지 않음
// (서버) Set-Cookie: token=...; HttpOnly; Secure; SameSite=Lax; Path=/
// (클라) 요청 시 credentials만 포함하면 쿠키 자동 전송
fetch('/api/me', { credentials: 'include' });
```

**🔥 예상 꼬리질문**
- Q. 그럼 왜 많은 튜토리얼이 localStorage를 쓰나요? → A. 구현이 간단하고 CORS·쿠키 설정이 까다로워서입니다. 편의성 때문이지 보안 권장이 아닙니다.
- Q. 모바일 앱 웹뷰나 서드파티 도메인 API면? → A. 쿠키 도메인/`SameSite` 제약이 커서 헤더 토큰 방식이 불가피할 수 있습니다. 그때는 **XSS 방어를 극도로 강화**(CSP, 의존성 관리)해야 합니다.
- Q. `sessionStorage`에 두면 낫나요? → A. 탭 닫으면 지워져 노출 창이 줄 뿐, XSS에 읽히는 근본 문제는 동일합니다.

<details><summary>📝 한 줄 요약</summary>토큰은 HttpOnly+Secure+SameSite 쿠키가 기본 권장(XSS 탈취 방어). localStorage는 XSS에 그대로 노출. 쿠키의 CSRF는 SameSite+CSRF토큰으로 대비. 대전제는 XSS 자체 제거.</details>

---

## D6. IndexedDB는 무엇이고, 언제 쓰나요? 🟡

**💬 30초 답변**
> IndexedDB는 브라우저에 내장된 **비동기·트랜잭션 기반의 클라이언트 NoSQL 데이터베이스**입니다. Web Storage와 달리 **수백 MB~GB 대용량**을 저장하고, 문자열뿐 아니라 **객체·Blob·파일 같은 구조화 데이터**를 키-값(+인덱스)으로 담을 수 있습니다. 비동기라 대량 데이터를 다뤄도 **메인 스레드를 막지 않습니다**. 오프라인 지원 PWA, 대용량 캐시, 로컬 우선(local-first) 앱에서 씁니다. 다만 저수준 API가 번거로워 실무에선 보통 **`idb`, `Dexie.js` 같은 래퍼**를 씁니다.

**📖 핵심 개념**

🎯 **비유**: Web Storage가 "메모지 한 장"이라면 IndexedDB는 **색인이 달린 파일 캐비닛**입니다. 서랍(object store)마다 자료를 넣고, 색인(index)으로 "이메일이 X인 사용자"처럼 조건 검색까지 가능합니다.

📌 **핵심 개념 용어**: 데이터베이스 안에 여러 **object store**(테이블 격)가 있고, 각 레코드는 **key**로 식별되며, **index**로 특정 필드 기준 조회를 합니다. 모든 읽기/쓰기는 **transaction** 안에서 일어납니다. 원본 API는 콜백/이벤트 기반이라 Promise 래퍼가 흔합니다.

```js
// 저수준 원본 API 예시 (실무는 idb 등 래퍼 권장)
const req = indexedDB.open('myDB', 1);
req.onupgradeneeded = (e) => {
  const db = e.target.result;
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('byEmail', 'email', { unique: true });
};
req.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction('users', 'readwrite');
  tx.objectStore('users').put({ id: 1, name: 'Buzz', email: 'a@b.com' });
};
```

📌 **언제 IndexedDB인가**: ① 데이터가 5MB를 넘거나, ② 문자열이 아닌 구조화 객체/파일을 저장하거나, ③ 오프라인에서 조회/필터가 필요하거나, ④ 대량 접근 시 UI 끊김을 피하고 싶을 때. 반대로 작은 설정값 하나면 굳이 IndexedDB를 쓸 필요 없이 localStorage가 간단합니다.

**🔥 예상 꼬리질문**
- Q. localStorage에 큰 JSON을 넣으면 안 되나요? → A. 동기라 파싱 중 UI가 멈추고 용량 한도(~5MB)에 걸립니다. 커지면 IndexedDB가 맞습니다.
- Q. IndexedDB는 SQL을 쓰나요? → A. 아니요. 키-값 + 인덱스 기반 NoSQL입니다. 복잡한 조인은 앱 코드로 처리합니다.
- Q. Web Worker에서 접근되나요? → A. 됩니다. 비동기라 워커에서 백그라운드 처리에 적합합니다.

<details><summary>📝 한 줄 요약</summary>IndexedDB=브라우저 내장 비동기 NoSQL. 대용량·구조화 객체·인덱스 검색·트랜잭션 지원, 메인 스레드 안 막음. PWA/오프라인/대용량에 사용, 실무는 idb·Dexie 래퍼로.</details>

---

## D7. Cache Storage와 Service Worker는 저장소로서 어떤 역할인가요? 🟡

**💬 30초 답변**
> **Cache Storage**(`caches` API)는 **HTTP 요청(Request)-응답(Response) 쌍을 통째로 저장**하는 비동기 저장소입니다. 주로 **Service Worker**와 함께 쓰여, 네트워크 요청을 가로채 캐시에서 먼저 응답하거나 오프라인 대비 자산을 미리 저장합니다. HTTP 캐시(브라우저 자동 캐시)와 달리 **개발자가 명시적으로 넣고 꺼내는 프로그래머블 캐시**라는 점이 핵심입니다. PWA의 오프라인 동작, 앱 셸 캐싱, 커스텀 캐시 전략(cache-first, network-first 등)에 씁니다.

**📖 핵심 개념**

🎯 **비유**: HTTP 캐시가 "브라우저가 알아서 관리하는 냉장고"라면, Cache Storage는 **내가 직접 라벨 붙여 채우고 비우는 팬트리**입니다. 무엇을 언제 넣고 어떤 요청에 어떻게 응답할지 코드로 정합니다.

📌 **Service Worker의 정체**: 페이지와 네트워크 사이에서 도는 **백그라운드 스크립트(프록시)**입니다. `fetch` 이벤트를 가로채 Cache Storage와 조합해 응답 출처를 결정합니다. 반드시 **HTTPS(또는 localhost)**에서만 동작합니다.

```js
// Service Worker: 설치 시 앱 셸 미리 캐싱 + 요청 가로채기
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('v1').then((cache) =>
      cache.addAll(['/', '/index.html', '/app.css', '/app.js'])
    )
  );
});

self.addEventListener('fetch', (e) => {
  // cache-first 전략: 캐시에 있으면 캐시, 없으면 네트워크
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
```

📌 **HTTP 캐시 vs Cache Storage 구분**: HTTP 캐시는 `Cache-Control`/`ETag` 등 헤더에 따라 **브라우저가 자동 관리**(개발자가 직접 항목을 못 지움). Cache Storage는 **JS로 명시적 제어**(`caches.open`, `cache.put`, `cache.delete`). 둘은 별개 계층입니다.

**🔥 예상 꼬리질문**
- Q. 대표적 캐시 전략은? → A. cache-first(정적 자산), network-first(최신성 중요한 API), stale-while-revalidate(캐시 즉시 응답 후 백그라운드 갱신) 등.
- Q. Cache Storage에 API JSON도 넣나요? → A. 넣을 수 있지만 구조적 질의·대량 데이터는 IndexedDB가 낫습니다. Cache는 "응답 통째 저장"에 강합니다.
- Q. Service Worker 없이 Cache Storage만 써도 되나요? → A. 됩니다(`caches`는 window에서도 접근 가능). 다만 요청 가로채기 이점은 Service Worker와 함께일 때 큽니다.

<details><summary>📝 한 줄 요약</summary>Cache Storage=요청/응답 쌍을 통째로 저장하는 프로그래머블 비동기 캐시. Service Worker(HTTPS 프록시)와 함께 오프라인·커스텀 캐시 전략 구현. HTTP 캐시(자동)와는 별개 계층.</details>

---

## D8. 저장소 용량 한도와 데이터가 지워지는(eviction) 규칙은 어떻게 되나요? 🟢

**💬 30초 답변**
> Web Storage는 오리진당 대략 **5~10MB** 고정 한도이고, IndexedDB·Cache Storage는 개별 고정값이 아니라 **디스크 여유 공간에 비례한 공용 쿼터**(브라우저마다 다르지만 남은 저장공간의 일정 비율)를 나눠 씁니다. 저장공간이 부족해지면 브라우저는 **덜 쓰인 오리진의 데이터부터 자동 삭제(eviction)**할 수 있습니다. 이걸 막으려면 `navigator.storage.persist()`로 **영속(persistent) 권한**을 요청하면 되고, `navigator.storage.estimate()`로 현재 사용량·쿼터를 확인할 수 있습니다.

**📖 핵심 개념**

📌 **저장 지속성 등급(대략)**: 기본은 **best-effort(최선 노력)** — 공간 압박 시 지워질 수 있습니다. `persist()`가 승인되면 **persistent** — 사용자가 직접 지우기 전까지 자동 eviction 대상에서 제외됩니다. 승인 여부는 브라우저가 사용 빈도·설치 여부(PWA) 등을 보고 판단합니다.

```js
// 사용량/쿼터 확인
const { usage, quota } = await navigator.storage.estimate();
console.log(`${usage} / ${quota} bytes 사용 중`);

// 영속 저장 요청 (자동 삭제 방지)
const persisted = await navigator.storage.persist();
console.log(persisted ? '영속 저장 승인됨' : 'best-effort 상태');
```

📌 **한도 초과 시 동작**: Web Storage에 한도 초과로 쓰면 **`QuotaExceededError` 예외**가 던져집니다. 그래서 `setItem`은 try/catch로 감싸는 것이 안전합니다. IndexedDB/Cache도 쿼터 초과 시 쓰기가 실패합니다.

```js
try {
  localStorage.setItem('big', hugeString);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // 오래된 캐시 정리 등 폴백 처리
  }
}
```

📌 **시크릿(프라이빗) 모드**: 많은 브라우저에서 시크릿 모드는 저장소를 **세션 종료 시 폐기**하거나 용량을 크게 줄입니다. 일부 환경에선 Web Storage 접근이 예외를 던지기도 하므로, 저장소 접근을 방어적으로 감싸는 습관이 안전합니다.

**🔥 예상 꼬리질문**
- Q. localStorage 5MB는 문자 수인가요 바이트인가요? → A. 문자열은 UTF-16으로 저장돼 문자당 대략 2바이트를 차지하므로, 체감 저장량은 "글자 수"보다 적을 수 있습니다.
- Q. 사용자가 데이터를 지우는 경로는? → A. 브라우저 설정의 "사이트 데이터 삭제", 특정 사이트 쿠키/저장소 삭제 등. 개발자가 막을 수 없으므로 **저장소는 신뢰할 수 있는 원본이 아니라 캐시**로 취급해야 합니다.

<details><summary>📝 한 줄 요약</summary>Web Storage ~5~10MB 고정, IndexedDB/Cache는 디스크 비례 공용 쿼터. 공간 부족 시 덜 쓴 오리진부터 자동 삭제. persist()로 영속 요청, estimate()로 사용량 확인, 초과 시 QuotaExceededError.</details>

---

## D9. Web Storage 사용 시 실무에서 주의할 점은? 🟡

**💬 30초 답변**
> 다섯 가지를 챙깁니다. ① **문자열만 저장**되므로 객체는 `JSON.stringify`/`parse` 필요, ② API가 **동기 blocking**이라 큰 값을 넣으면 렌더가 멈춤, ③ **XSS에 그대로 노출**되므로 민감정보(토큰·개인정보) 금지, ④ 다른 탭 변경은 `storage` 이벤트로만 알 수 있고 **자기 탭엔 안 옴**, ⑤ 시크릿 모드/용량 초과/`JSON.parse` 실패 등으로 **예외가 날 수 있어** 접근을 방어적으로 감싸야 합니다. 그래서 실무에선 보통 안전한 get/set 유틸로 감쌉니다.

**📖 핵심 개념**

📌 **방어적 래퍼 예시**

```js
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback; // 파싱 실패/접근 불가 시 안전값
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      // QuotaExceededError, 시크릿 모드 차단 등
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  },
};
```

📌 **React/SSR 주의**: Next.js 같은 SSR 환경에선 서버에 `window`·`localStorage`가 없어 **렌더 중 접근하면 오류**가 납니다. `useEffect`(클라이언트에서만 실행) 안에서 접근하거나 `typeof window !== 'undefined'` 가드를 둡니다. 또 초기 렌더는 저장값을 모르므로 **하이드레이션 불일치(FOUC)**에 유의합니다.

```jsx
// SSR-safe: 마운트 후에만 저장소 접근
useEffect(() => {
  const saved = storage.get('theme', 'light');
  setTheme(saved);
}, []);
```

**🔥 예상 꼬리질문**
- Q. localStorage 값이 바뀔 때 React 상태를 어떻게 동기화하나요? → A. 같은 탭이면 set 시 상태도 함께 갱신, 다른 탭이면 `storage` 이벤트 리스너로 반영합니다.
- Q. 민감하지 않지만 큰 데이터는? → A. IndexedDB로 옮겨 동기 blocking과 용량 한도를 피합니다.

<details><summary>📝 한 줄 요약</summary>Web Storage 실무 5주의: 문자열만(직렬화)·동기 blocking·XSS 노출(민감정보 금지)·자기 탭 storage 이벤트 없음·예외 가능(방어적 래퍼). SSR은 window 가드+useEffect 접근.</details>

---

## 🎯 오늘의 핵심 정리

- **선택의 갈림길은 "서버가 매 요청 알아야 하는가"**: 예 → 쿠키(HttpOnly), 아니오·소량 → Web Storage, 아니오·대용량 → IndexedDB, 응답 저장 → Cache Storage.
- **쿠키 보안 3속성은 반드시 암기**: `HttpOnly`(XSS 탈취 방어), `Secure`(HTTPS 전송), `SameSite`(CSRF 방어). `__Host-` 접두사는 모범 사례.
- **인증 토큰은 HttpOnly 쿠키가 기본 권장** — localStorage는 XSS에 그대로 노출. 단 어떤 방식이든 XSS 제거가 대전제.
- **localStorage vs sessionStorage**: 수명(영구 vs 탭)과 공유 범위(전 탭 vs 탭 단위), 그리고 탭 간 동기화의 `storage` 이벤트.
- **동기 vs 비동기**: Web Storage는 동기라 대용량에 부적합, IndexedDB·Cache는 비동기라 메인 스레드를 막지 않음.
- **저장소는 신뢰 원본이 아니라 캐시**: 용량 초과·자동 eviction·사용자 삭제·시크릿 모드로 언제든 사라질 수 있으니 방어적으로 다룬다.
