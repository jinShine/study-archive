# 웹 인증·인가 심화 (세션 vs 토큰 · JWT · Access/Refresh · OAuth 2.0 · SSR 인증)

> 주제: 신입~주니어 프론트엔드가 면접에서 "로그인 붙여봤어요 / localStorage에 토큰 저장했어요"를 넘어 "인증과 인가를 구분하고, 세션·토큰 방식의 트레이드오프를 설명하며, JWT의 구조와 검증 원리를 알고, Access/Refresh 토큰을 나눠 만료·갱신 흐름을 코드로 설계하고, OAuth 2.0(Authorization Code + PKCE) 소셜 로그인 흐름을 그릴 줄 알며, SSR/Next.js 환경의 인증까지 다룰 줄 안다"를 보여주는 심화 — 인증 vs 인가, 세션 vs 토큰, JWT 구조·서명·검증, Access/Refresh Token 전략, 토큰 저장 위치와 XSS/CSRF, 401 재발급 인터셉터와 리프레시 로테이션, OAuth 2.0 + PKCE, Next.js App Router 인증
> 출처: 일일 심화 자료 (기존 5.common.md Q83 "세션 관리·쿠키 보안"의 심화·확장편, daily 웹 보안(7/21)·브라우저 저장소(7/31) 자료와 상호 보완 · daily 미다룸 주제) · OAuth 2.0/2.1·PKCE·JWT는 IETF 표준(RFC 6749/7519/7636·OAuth 2.0 Security BCP) 기준
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-인증authentication과-인가authorization의-차이는-뭔가요) | 인증 vs 인가 · 401 vs 403 | 🔴 |
| [D2](#d2-세션-기반-인증과-토큰-기반-인증의-차이를-설명해-주세요) | 세션 vs 토큰 · stateful/stateless · 확장성 | 🔴 |
| [D3](#d3-jwt는-어떻게-생겼고-어떻게-검증되나요) | JWT 구조(header.payload.signature) · 서명 · 검증 | 🔴 |
| [D4](#d4-access-token과-refresh-token을-왜-나누나요) | Access/Refresh 분리 · 수명 · 갱신 흐름 | 🔴 |
| [D5](#d5-토큰은-어디에-저장하는-게-안전한가요) | localStorage vs HttpOnly 쿠키 vs 메모리 · BFF | 🔴 |
| [D6](#d6-access-token이-만료되면-프론트에서-어떻게-처리하나요) | 401 재시도 인터셉터 · 리프레시 동시성 큐 · 로테이션 | 🔴 |
| [D7](#d7-소셜-로그인oauth-20은-어떤-흐름으로-동작하나요) | OAuth 2.0 · Authorization Code + PKCE · 스코프 | 🟡 |
| [D8](#d8-ssrnextjs-환경에서는-인증을-어떻게-다루나요) | 쿠키 기반 · 미들웨어 · 서버 컴포넌트 · CSR과 차이 | 🟡 |

---

## D1. 인증(Authentication)과 인가(Authorization)의 차이는 뭔가요? 🔴

**💬 30초 답변**
> **인증(Authentication)** 은 "당신이 누구인지"를 확인하는 것이고, **인가(Authorization)** 는 "확인된 당신이 무엇을 할 수 있는지"를 결정하는 것입니다. 로그인해서 신원을 증명하는 게 인증, 그 사용자가 관리자 페이지에 들어갈 권한이 있는지 확인하는 게 인가입니다. 인증이 먼저, 인가가 나중입니다. HTTP 상태 코드로는 인증 실패가 **401 Unauthorized**, 인가 실패가 **403 Forbidden**입니다.

**📖 핵심 개념**

🎯 **비유**: 회사 출입에 비유하면, **인증**은 정문에서 사원증을 찍어 "이 사람이 우리 직원이 맞다"를 확인하는 것이고, **인가**는 그 사원증으로 "서버실 문은 열리는데 임원실 문은 안 열리는" 권한 차이입니다. 이름표(인증)를 달았다고 모든 방에 들어갈 수 있는 건 아닙니다(인가).

📌 **핵심 구분**

| | 인증 (Authentication, AuthN) | 인가 (Authorization, AuthZ) |
|---|---|---|
| 질문 | "누구세요?" | "그거 할 수 있어요?" |
| 시점 | 먼저 | 인증 후 |
| 수단 | 아이디/비번, 소셜 로그인, 생체 | 역할(role)·권한(permission)·스코프 |
| 실패 코드 | **401** Unauthorized | **403** Forbidden |

📌 **401 vs 403 (자주 헷갈리는 포인트)**
- **401 Unauthorized**: "너 누군지 모르겠어" → 로그인 안 했거나 토큰이 없거나 만료됨. 프론트는 보통 **로그인 페이지로 리다이렉트**하거나 **토큰 재발급**을 시도합니다.
- **403 Forbidden**: "너 누군지는 아는데, 이건 권한이 없어" → 로그인은 됐지만 권한 부족. 재발급해도 소용없고 **"권한 없음" 안내**를 보여줍니다.

> 💡 이름의 아이러니: `401`의 표준 이름이 "Unauthorized"지만 실제 의미는 "**Unauthenticated(인증 안 됨)**"에 가깝습니다. 면접에서 이걸 짚으면 좋습니다.

**🔥 예상 꼬리질문**
- Q. 401을 받으면 프론트는 무조건 로그아웃시켜야 하나요? → A. 아닙니다. Access Token 만료일 수 있으니 먼저 **Refresh Token으로 재발급을 시도**하고, 재발급도 실패하면(refresh도 만료/무효) 그때 로그아웃·로그인 페이지로 보냅니다(D6).
- Q. 인가는 프론트에서 하나요 서버에서 하나요? → A. **최종 판단은 반드시 서버**입니다. 프론트의 권한 체크(메뉴 숨김 등)는 UX일 뿐이고, 클라이언트 코드는 조작 가능하므로 서버가 매 요청 권한을 검증해야 합니다.
- Q. RBAC이 뭔가요? → A. Role-Based Access Control. 권한을 사용자마다 일일이 주지 않고 **역할(admin·editor·viewer)** 에 묶어 관리하는 인가 모델입니다.

<details><summary>📝 한 줄 요약</summary>인증=누구인지 확인(먼저, 실패 401), 인가=무엇을 할 수 있는지 결정(나중, 실패 403). 인가 최종 판단은 반드시 서버. 401은 사실상 "인증 안 됨".</details>

---

## D2. 세션 기반 인증과 토큰 기반 인증의 차이를 설명해 주세요? 🔴

**💬 30초 답변**
> HTTP는 **무상태(stateless)** 라 매 요청이 독립적이라서, 로그인 상태를 유지하려면 별도 장치가 필요합니다. **세션 방식**은 서버가 로그인 정보를 메모리·DB에 저장(stateful)하고 브라우저엔 **세션 ID**만 쿠키로 줍니다. **토큰 방식(JWT)** 은 로그인 정보를 서명된 토큰 자체에 담아 클라이언트가 보관하고, 서버는 아무것도 저장하지 않고(stateless) 요청마다 **서명만 검증**합니다. 세션은 서버가 상태를 쥐고 있어 즉시 무효화가 쉽지만 확장 시 세션 공유가 필요하고, 토큰은 서버 확장이 쉽지만 발급된 토큰을 만료 전에 강제로 죽이기 어렵습니다.

**📖 핵심 개념**

🎯 **비유**: **세션**은 클럽 입구에서 손목 밴드를 채우고 손님 명단을 **입구 데스크(서버)에 보관**하는 방식입니다. 밴드 번호(세션 ID)만 보고 데스크에서 대조합니다 — 데스크가 명단을 지우면 즉시 입장 불가. **토큰(JWT)** 은 위조 방지 홀로그램이 박힌 **VIP 초대장**을 손님에게 통째로 쥐여주는 방식입니다. 데스크는 명단이 없고 초대장의 홀로그램(서명)만 확인합니다 — 빠르지만, 한 번 준 초대장은 만료 전엔 회수가 어렵습니다.

📌 **세션 vs 토큰 정리 (면접 핵심 표)**

| | 세션 (서버 저장) | 토큰 JWT (클라 보관) |
|---|---|---|
| 상태 | **Stateful** (서버가 세션 저장) | **Stateless** (서버 저장 없음) |
| 저장 위치 | 서버 메모리/Redis/DB + 쿠키에 세션 ID | 클라이언트(쿠키/메모리/스토리지) |
| 검증 방법 | 세션 저장소 조회(대조) | **서명 검증**(조회 불필요) |
| 확장성 | 서버 여러 대면 세션 공유 필요(Redis 등) | 서버 무상태 → 수평 확장 쉬움 |
| 무효화(로그아웃) | 서버에서 세션 삭제 → **즉시** | 만료 전 강제 무효화 어려움(블랙리스트 필요) |
| 데이터 위치 | 서버가 소유 → 신뢰 | 클라가 소유 → 서명으로 위·변조만 방지 |
| 대표 사용처 | 전통 웹, 서버 렌더링 앱 | SPA·모바일·MSA·서드파티 API |

📌 **"stateless가 항상 좋다"는 오해**
JWT의 stateless는 확장성엔 유리하지만 공짜가 아닙니다. **"발급 후 만료 전 무효화가 어렵다"** 는 게 핵심 약점입니다. 로그아웃·계정 정지·권한 변경을 즉시 반영하려면 결국 서버에 **리프레시 토큰 저장소나 블랙리스트**를 두게 되는데, 그러면 순수 stateless의 이점이 일부 사라집니다. 그래서 실무에선 "**짧은 수명의 Access Token(stateless) + 서버가 관리하는 Refresh Token(stateful성)**"의 하이브리드가 표준입니다(D4).

**🔥 예상 꼬리질문**
- Q. 왜 요즘 SPA는 토큰을 많이 쓰나요? → A. 프론트(다른 도메인)와 API 서버가 분리되고, 모바일 앱·서드파티까지 같은 API를 쓰는 구조에서 **서버 무상태 + 도메인 독립성**이 유리하기 때문입니다. 다만 보안상 세션(HttpOnly 쿠키)이 더 안전할 때도 많아, "무조건 JWT"는 안티패턴입니다.
- Q. JWT로 로그아웃은 어떻게 구현하나요? → A. 클라에서 토큰을 지우면 그 클라만 못 쓰지만, 토큰 자체는 만료까지 유효합니다. 즉시·강제 무효화가 필요하면 **Refresh Token을 서버에서 폐기**하고 Access Token 수명을 짧게(수 분) 두거나, **서버 블랙리스트/버전 필드**를 둡니다.
- Q. 세션 방식의 확장 문제는 어떻게 해결하나요? → A. **Redis 같은 중앙 세션 저장소**를 두거나 sticky session(같은 서버로 고정)을 씁니다. 중앙 저장소 방식이 일반적입니다.

<details><summary>📝 한 줄 요약</summary>무상태 HTTP의 로그인 유지 = 세션 or 토큰. 세션=서버 저장(stateful, 즉시 무효화 쉬움, 확장 시 공유 필요), 토큰=클라 보관(stateless, 확장 쉬움, 무효화 어려움). 실무는 짧은 Access + 서버 관리 Refresh 하이브리드.</details>

---

## D3. JWT는 어떻게 생겼고 어떻게 검증되나요? 🔴

**💬 30초 답변**
> JWT(JSON Web Token)는 `.`으로 구분된 **세 부분** — Header, Payload, Signature — 으로 이루어진 문자열입니다. Header와 Payload는 그냥 **Base64URL로 인코딩**된 JSON이라 **누구나 디코딩해서 볼 수 있고**, 보안은 세 번째 **Signature(서명)** 가 담당합니다. 서버는 Header+Payload를 비밀키로 다시 서명해 보고 토큰의 서명과 일치하는지만 확인하면, DB 조회 없이 "이 토큰이 위·변조되지 않았다"를 검증할 수 있습니다. 그래서 **Payload에 민감정보(비번 등)를 넣으면 안 됩니다.**

**📖 핵심 개념**

🎯 **비유**: JWT는 **밀랍 봉인이 찍힌 편지**입니다. 편지 내용(Payload)은 봉투가 투명해서 누구나 읽을 수 있지만, 밀랍 도장(Signature)은 발급자만 가진 인장(비밀키)으로만 찍을 수 있습니다. 내용을 몰래 고치면 도장이 안 맞으니 위조가 들통납니다.

📌 **JWT의 3부분**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJzdWIiOiIxMjMiLCJyb2xlIjoiYWRtaW4ifQ . SflKxwRJSMeKKF2QT4...
└──────── Header ────────┘  └──────── Payload ────────┘  └──── Signature ────┘
```

1. **Header**: 서명 알고리즘과 타입. 예: `{ "alg": "HS256", "typ": "JWT" }`
2. **Payload(Claims)**: 담고 싶은 정보. 표준 클레임과 커스텀 클레임이 섞임.
   - `sub`(subject, 사용자 ID), `iat`(issued at, 발급 시각), `exp`(expiration, 만료 시각), `iss`(발급자), `aud`(대상)
   - 커스텀: `role`, `email` 등 (민감정보 금지)
3. **Signature**: `HMACSHA256( base64url(header) + "." + base64url(payload), secret )` 처럼, 앞 두 부분을 비밀키로 서명한 값.

```js
// 검증의 개념 (서버 측 의사코드)
const [header, payload, signature] = token.split('.');
const expected = HMAC_SHA256(`${header}.${payload}`, SECRET_KEY);
if (expected !== signature) throw new Error('위조된 토큰!');   // 서명 불일치
if (Date.now() >= decode(payload).exp * 1000) throw new Error('만료됨'); // exp 확인
// 통과 → payload의 sub·role을 신뢰
```

📌 **서명 알고리즘: HS256 vs RS256**
- **HS256 (대칭키/HMAC)**: 서명·검증에 **같은 비밀키**를 사용. 단순하지만 검증하는 모든 주체가 비밀키를 알아야 함 → 발급자·검증자가 같은 서버일 때.
- **RS256 (비대칭키/RSA)**: **개인키로 서명, 공개키로 검증**. 검증자는 공개키만 있으면 됨 → 발급 서버와 검증 서버가 다르거나(MSA), 서드파티가 검증할 때(OAuth 제공자) 안전.

📌 **JWT 보안 3원칙**
1. **민감정보 금지**: Payload는 Base64URL일 뿐 암호화가 아님 → 비번·주민번호 등 절대 금지.
2. **HTTPS 필수**: 평문으로 오가면 토큰 자체가 탈취됨.
3. **`alg: none` 공격 방어**: 서버가 알고리즘을 토큰의 Header에서 그대로 신뢰하면, 공격자가 `alg: none`으로 서명 없는 토큰을 넣을 수 있음 → 서버는 **허용 알고리즘을 고정**해야 함.

> ⚠️ **흔한 오해**: "JWT는 암호화되어 있다" → **아닙니다.** 기본 JWT(JWS)는 **서명(무결성)** 만 하고 **암호화(기밀성)** 는 하지 않습니다. 내용을 숨기려면 별도의 JWE를 써야 합니다. 면접에서 "Base64는 인코딩이지 암호화가 아니다"를 정확히 말하면 좋습니다.

**🔥 예상 꼬리질문**
- Q. JWT Payload를 클라에서 디코딩해서 써도 되나요? → A. UI 표시용(예: 사용자 이름·역할로 메뉴 렌더)으로는 괜찮지만, **신뢰의 근거로 삼으면 안 됩니다.** 서버는 매 요청 서명을 다시 검증하고, 프론트의 디코딩 결과는 언제든 조작될 수 있다고 봐야 합니다.
- Q. 서명이 있는데 왜 만료(exp)가 필요하죠? → A. 서명은 위·변조만 막지 탈취를 막지 못합니다. 토큰이 유출돼도 피해 시간을 줄이려면 짧은 만료가 필요합니다(그래서 Access Token은 수 분~수십 분, D4).
- Q. `alg: none` 공격이 뭔가요? → A. Header의 alg를 `none`으로 바꿔 서명을 생략한 토큰을 서버가 받아들이게 하는 공격. 서버가 검증 알고리즘을 화이트리스트로 고정하면 방어됩니다.

<details><summary>📝 한 줄 요약</summary>JWT = Header.Payload.Signature(Base64URL). 앞 둘은 누구나 디코딩 가능(암호화 아님), 보안은 Signature(서명)가 담당. 서버는 DB 조회 없이 서명·exp만 검증. HS256(대칭)·RS256(비대칭). 민감정보 금지·HTTPS·alg 고정.</details>

---

## D4. Access Token과 Refresh Token을 왜 나누나요? 🔴

**💬 30초 답변**
> 하나의 토큰으로 수명을 길게 두면 **탈취 시 피해가 크고**, 짧게 두면 **너무 자주 로그인**해야 하는 딜레마가 생깁니다. 이를 풀려고 역할을 둘로 나눕니다. **Access Token**은 실제 API 요청에 쓰는 토큰으로 **수명이 짧고(수 분~수십 분)**, **Refresh Token**은 Access Token이 만료됐을 때 새로 발급받는 데만 쓰는 토큰으로 **수명이 깁니다(며칠~수 주)**. Access가 탈취돼도 금방 만료되고, 자주 쓰이는 Access와 달리 Refresh는 재발급 시에만 오가서 노출 빈도가 낮습니다. Refresh까지 만료·폐기되면 그때 다시 로그인합니다.

**📖 핵심 개념**

🎯 **비유**: **Access Token**은 놀이공원의 **일일 자유이용권 손목밴드**입니다 — 매 놀이기구(API)에서 보여주지만 하루면 끝납니다. **Refresh Token**은 매표소에서 밴드를 새로 받을 수 있는 **연간 회원카드**입니다 — 놀이기구에선 안 쓰고 매표소(재발급 서버)에서만 씁니다. 밴드(Access)를 잃어버려도 하루치 피해지만, 회원카드(Refresh)를 잃으면 크니까 더 안전하게 보관합니다.

📌 **왜 나누는가 — 두 요구의 충돌 해결**

| | Access Token | Refresh Token |
|---|---|---|
| 용도 | API 요청 인증 | Access 재발급 전용 |
| 수명 | 짧음 (예: 15분) | 김 (예: 7~30일) |
| 노출 빈도 | 높음(매 요청) | 낮음(재발급 시만) |
| 탈취 시 피해 | 작음(곧 만료) | 큼(오래 유효) → 더 안전하게 저장 |
| 저장 권장 | 메모리/변수 | **HttpOnly·Secure 쿠키**(권장) |

📌 **표준 갱신 흐름**

```
1. 로그인 성공 → 서버가 Access(짧게) + Refresh(길게) 발급
2. 클라: Access를 Authorization 헤더에 담아 API 호출
3. Access 만료 → API가 401 응답
4. 클라: Refresh Token으로 /auth/refresh 호출
5. 서버: Refresh 검증 OK → 새 Access(+ 새 Refresh) 발급  ← 로테이션
6. 클라: 원래 실패했던 요청을 새 Access로 재시도
7. Refresh도 만료/무효 → 재발급 실패 → 로그인 페이지로
```

📌 **Refresh Token Rotation(회전) — 현대 표준**
재발급할 때마다 **Refresh Token도 새것으로 교체하고 이전 것은 폐기**하는 기법입니다. 만약 폐기된 옛 Refresh가 다시 쓰이면(= 누군가 훔쳐서 사용) 서버는 "**토큰 재사용 감지**"로 판단해 해당 사용자의 **모든 토큰을 무효화**해 세션을 강제 종료합니다. 이게 탈취를 조기에 차단하는 핵심 방어입니다. 공용 클라이언트(SPA)에는 특히 권장됩니다.

**🔥 예상 꼬리질문**
- Q. Access Token 수명은 얼마가 적당한가요? → A. 정답은 없지만 실무에서 **5~30분**이 흔합니다. 짧을수록 탈취 피해는 줄지만 재발급 트래픽이 늘어 트레이드오프입니다.
- Q. Refresh Token은 어디에 저장하나요? → A. 노출 빈도가 낮고 피해가 크므로 **HttpOnly·Secure·SameSite 쿠키**가 권장됩니다(JS가 못 읽어 XSS에 강함). Access는 메모리에 두는 조합이 안전합니다(D5).
- Q. Rotation을 안 쓰면 어떤 위험이 있나요? → A. Refresh가 탈취되면 만료까지 계속 새 Access를 찍어낼 수 있습니다. Rotation + 재사용 감지가 있으면 탈취가 곧 발각되어 세션이 끊깁니다.
- Q. 재발급 중에 여러 API 요청이 동시에 401이 나면요? → A. 리프레시를 한 번만 하도록 **동시성 제어(락/큐)** 가 필요합니다(D6).

<details><summary>📝 한 줄 요약</summary>Access(짧게, API용) + Refresh(길게, 재발급 전용)로 "탈취 피해↓ vs 잦은 로그인↓" 딜레마 해결. Access 401 → Refresh로 재발급 → 원요청 재시도. Rotation(재발급 시 Refresh 교체+재사용 감지)이 현대 표준.</details>

---

## D5. 토큰은 어디에 저장하는 게 안전한가요? 🔴

**💬 30초 답변**
> 완벽한 정답은 없고 **트레이드오프**입니다. **localStorage**는 쓰기 쉽지만 **JS로 접근 가능**해서 XSS 한 방에 토큰이 통째로 털립니다. **HttpOnly 쿠키**는 JS가 못 읽어 XSS엔 강하지만, 자동 전송되는 특성 때문에 **CSRF 대비(SameSite)** 가 필요합니다. 실무에서 널리 권장되는 조합은 **Refresh Token은 HttpOnly·Secure·SameSite 쿠키에, Access Token은 자바스크립트 메모리(변수)에** 두는 것입니다. 메모리는 새로고침하면 사라지지만, 그때 쿠키의 Refresh로 조용히 재발급하면 됩니다. 더 강한 격리가 필요하면 **BFF 패턴**으로 토큰을 브라우저에 아예 노출하지 않습니다.

**📖 핵심 개념**

📌 **저장 위치별 비교**

| 저장소 | XSS 취약 | CSRF 취약 | 새로고침 유지 | 서버 자동 전송 | 비고 |
|---|---|---|---|---|---|
| localStorage | ❌ 취약(JS 접근) | 안전 | 유지 | 수동(헤더) | 편하지만 XSS에 약함 |
| sessionStorage | ❌ 취약 | 안전 | 탭 닫으면 소멸 | 수동 | |
| **HttpOnly 쿠키** | ✅ 강함(JS 차단) | ⚠️ SameSite로 방어 | 유지 | 자동 | Refresh 저장에 권장 |
| **JS 메모리(변수)** | ⚠️ 실행 중 노출 | 안전 | ❌ 소멸 | 수동 | Access 저장에 권장 |

📌 **권장 조합: "Access는 메모리, Refresh는 HttpOnly 쿠키"**
- **Access Token → 메모리**: 새로고침하면 날아가지만 어차피 수명이 짧고, XSS로 `localStorage.getItem`처럼 쉽게 긁히지 않습니다(전역에 안 두면 접근 표면이 작음). 앱 시작 시 쿠키의 Refresh로 **silent refresh**해서 채웁니다.
- **Refresh Token → HttpOnly·Secure·SameSite 쿠키**: JS가 못 읽으니 XSS로 탈취 불가. `SameSite=Lax/Strict`로 CSRF도 크게 완화. `Secure`로 HTTPS에서만 전송.

🎯 **비유**: Access는 **지갑 속 현금**(당장 쓰지만 잃어도 소액), Refresh는 **은행 금고 속 통장**(꺼내 쓰기 번거롭지만 안전하게 보관)입니다. 지갑은 잃어도 하루치, 통장은 금고(HttpOnly)에 둡니다.

📌 **BFF(Backend For Frontend) 패턴 — 가장 강한 격리**
프론트 전용 백엔드 서버를 하나 두고, **모든 토큰은 그 서버 세션에만 저장**합니다. 브라우저는 BFF와 **세션 쿠키(HttpOnly)** 로만 통신하고, 실제 Access/Refresh 토큰은 **브라우저에 절대 노출되지 않습니다.** BFF가 대신 API 서버에 토큰을 붙여 호출합니다. 토큰이 JS 세계에 없으니 XSS로도 탈취가 불가능해, 보안 요구가 높은 서비스(금융 등)에서 채택합니다. OAuth 2.0 보안 권고(BCP)도 브라우저 SPA에는 BFF 방향을 권장하는 흐름입니다.

> ⚠️ **핵심 통찰**: 저장 위치 논쟁의 전제는 "**XSS가 없다**"입니다. XSS가 뚫리면 메모리 토큰도, 쿠키를 통한 요청 위조도 다 위험해집니다. 그래서 저장 위치 최적화보다 **XSS를 원천 차단(이스케이프·CSP·의존성 관리)** 하는 게 1순위입니다(7/21 웹 보안 자료 연결).

**🔥 예상 꼬리질문**
- Q. 그냥 localStorage에 다 넣으면 왜 안 되나요? → A. XSS가 한 번이라도 성공하면 `localStorage`의 토큰을 통째로 외부로 전송당합니다. HttpOnly 쿠키의 토큰은 같은 XSS로도 읽을 수 없어 방어선이 하나 더 있습니다.
- Q. HttpOnly 쿠키면 CSRF는 어떻게 막나요? → A. `SameSite=Lax/Strict`로 교차 사이트 자동 첨부를 제한하고, 필요 시 **CSRF 토큰(Double Submit)** 을 병행합니다(7/21 자료 D5 연결).
- Q. 메모리에 두면 새로고침 시 로그아웃되지 않나요? → A. 앱 로드 시 쿠키의 Refresh로 **조용히 재발급(silent refresh)** 해서 Access를 복구하면 사용자는 로그인 상태를 유지합니다.

<details><summary>📝 한 줄 요약</summary>localStorage=XSS 취약, HttpOnly 쿠키=XSS 강함·CSRF는 SameSite로. 권장 조합: Access=메모리(짧게), Refresh=HttpOnly·Secure·SameSite 쿠키. 최고 격리는 BFF(토큰을 브라우저에 노출 안 함). 대전제는 XSS 원천 차단.</details>

---

## D6. Access Token이 만료되면 프론트에서 어떻게 처리하나요? 🔴

**💬 30초 답변**
> 보통 HTTP 클라이언트(axios·fetch 래퍼)의 **응답 인터셉터**에서 **401을 감지**하면, Refresh Token으로 새 Access를 발급받은 뒤 **원래 실패한 요청을 새 토큰으로 자동 재시도**합니다. 사용자는 만료를 눈치채지 못합니다. 이때 핵심 함정은 **여러 요청이 동시에 401이 날 때** 재발급을 **여러 번 중복 호출**하는 것인데, 이를 막으려고 "재발급이 진행 중이면 다른 요청들은 큐에 대기시켰다가, 새 토큰이 나오면 한꺼번에 재시도"하는 **동시성 제어**를 넣습니다. 재발급까지 실패하면 로그아웃 처리합니다.

**📖 핵심 개념**

📌 **기본 401 재시도 인터셉터 (axios 예시)**

```js
// 요청 인터셉터: 최신 Access Token을 헤더에 부착
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;
let queue = [];   // 재발급 대기 중인 요청들

// 응답 인터셉터: 401이면 재발급 후 재시도
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);       // 401 아니거나 이미 재시도했으면 그냥 실패
    }

    if (isRefreshing) {
      // 이미 재발급 중 → 끝날 때까지 대기(큐에 넣기)
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject, original });
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();  // Refresh 쿠키로 재발급
      accessToken = newToken;
      queue.forEach(({ resolve, original }) => {    // 대기 요청 일괄 재시도
        original.headers.Authorization = `Bearer ${newToken}`;
        resolve(api(original));
      });
      queue = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);                          // 원래 요청 재시도
    } catch (e) {
      queue.forEach(({ reject }) => reject(e));
      queue = [];
      logout();                                      // 재발급 실패 → 로그아웃
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
```

📌 **왜 동시성 제어가 필요한가 (핵심 함정)**
페이지 로드 시 3개의 API를 병렬 호출했는데 Access가 막 만료됐다면, **셋 다 401**이 납니다. 제어가 없으면 재발급을 **3번** 호출하고, Refresh Rotation을 쓰는 경우 첫 재발급이 이전 Refresh를 폐기해버려 **나머지 재발급이 "재사용 감지"로 실패 → 강제 로그아웃**되는 버그가 생깁니다. 그래서 `isRefreshing` 플래그 + 큐로 **재발급을 딱 한 번만** 수행하고 나머지는 대기시켜야 합니다.

📌 **선제적 갱신(proactive refresh)** 🟢
401을 기다리지 않고, Access의 `exp`를 디코딩해 **만료 직전에 미리 갱신**하는 방식도 있습니다. 사용자가 요청할 때 이미 유효한 토큰이 있어 지연이 줄지만, 타이머 관리가 늘어 복잡도가 올라갑니다. 반응형(401 기반)과 선제형을 상황에 맞게 씁니다.

**🔥 예상 꼬리질문**
- Q. 재발급 요청 자체가 401이면 무한 루프 아닌가요? → A. `original._retry` 플래그로 **재시도는 한 번만** 하도록 막고, 재발급 엔드포인트는 인터셉터 대상에서 제외하거나 별도 처리해 루프를 끊습니다.
- Q. Refresh를 HttpOnly 쿠키에 두면 프론트가 어떻게 재발급을 호출하나요? → A. 재발급 요청에 `withCredentials: true`(쿠키 자동 전송)를 켜면 됩니다. 프론트는 토큰 값을 몰라도 브라우저가 쿠키를 붙여 보냅니다.
- Q. 여러 탭이 열려 있으면요? → A. 한 탭이 갱신한 토큰을 `BroadcastChannel`이나 storage 이벤트로 다른 탭과 공유해 중복 갱신을 줄일 수 있습니다.

<details><summary>📝 한 줄 요약</summary>응답 인터셉터에서 401 감지 → Refresh로 재발급 → 원요청 자동 재시도(사용자 무감). 핵심 함정: 동시 401 시 재발급 중복 → isRefreshing 플래그+큐로 한 번만. 재발급 실패 시 로그아웃. 무한 루프는 _retry로 차단.</details>

---

## D7. 소셜 로그인(OAuth 2.0)은 어떤 흐름으로 동작하나요? 🟡

**💬 30초 답변**
> OAuth 2.0은 사용자의 **비밀번호를 우리 서비스에 넘기지 않고**, 구글·카카오 같은 **인가 서버**가 대신 "이 사람 맞다"를 확인해 **인가 코드/토큰**을 발급하는 위임 프로토콜입니다. 현대 표준 흐름은 **Authorization Code Grant + PKCE**입니다. 사용자를 제공자 로그인 페이지로 보내고, 동의하면 **인가 코드(Authorization Code)** 를 우리 앱으로 리다이렉트해 주며, 앱(또는 백엔드)이 그 코드를 **Access Token으로 교환**합니다. 코드를 토큰으로 바꾸는 이 한 단계 덕분에 토큰이 URL에 직접 노출되지 않아 안전합니다.

**📖 핵심 개념**

🎯 **비유**: OAuth는 **호텔 발렛 파킹**입니다. 차 주인(사용자)이 마스터키(비밀번호)를 넘기지 않고, 주차만 가능한 **발렛키(제한된 권한 토큰)** 만 건네는 것과 같습니다. 서비스는 사용자의 구글 비번을 절대 모른 채, 구글이 발급한 "이 정보만 접근 가능" 토큰만 받습니다.

📌 **핵심 등장인물(역할)**
- **Resource Owner**: 사용자(당신).
- **Client**: 우리 앱(로그인 붙이는 서비스).
- **Authorization Server**: 구글/카카오 등 — 로그인·동의·토큰 발급 담당.
- **Resource Server**: 사용자 정보를 가진 API 서버(구글 프로필 API 등).

📌 **Authorization Code + PKCE 흐름**

```
1. 사용자가 "구글로 로그인" 클릭
2. 앱: 인가 서버로 이동 (client_id, redirect_uri, scope,
       state, code_challenge 포함)   ← PKCE: code_verifier의 해시를 미리 보냄
3. 사용자: 구글에서 로그인 + 권한 동의
4. 구글: redirect_uri로 Authorization Code 전달(+ state)
5. 앱/백엔드: code + code_verifier 를 구글에 보내 토큰 교환
6. 구글: code_challenge와 code_verifier 검증 OK → Access(+Refresh, ID) Token 발급
7. 앱: 토큰으로 사용자 정보 조회 → 로그인 완료
```

📌 **PKCE(Proof Key for Code Exchange)가 왜 필요한가**
PKCE("픽시")는 인가 코드가 중간에 가로채여도 토큰 교환을 막는 장치입니다. 앱이 매번 랜덤한 **code_verifier**를 만들고 그 해시(**code_challenge**)를 처음 요청에 보냅니다. 나중에 코드를 토큰으로 바꿀 때 원본 verifier를 함께 제출해야 하므로, **코드만 훔친 공격자는 verifier를 몰라 토큰을 못 받습니다.** 원래 모바일·SPA용이었지만, 지금은 **모든 클라이언트에 PKCE 권장**이 표준 방향이고, 보안이 약한 **Implicit Grant는 폐기(deprecated)** 되어 OAuth 2.1에선 빠졌습니다.

📌 **state 파라미터**: 요청·응답을 잇는 랜덤 값으로, 리다이렉트가 우리가 시작한 요청이 맞는지 확인해 **CSRF를 방지**합니다.

📌 **OAuth vs OIDC**: OAuth 2.0은 본래 **인가(권한 위임)** 프로토콜입니다. "누구인지"까지 표준화한 **인증** 레이어가 **OpenID Connect(OIDC)** 이고, 여기서 사용자 신원을 담은 **ID Token(JWT)** 이 나옵니다. "소셜 로그인"은 정확히는 OIDC까지 얹은 것입니다.

**🔥 예상 꼬리질문**
- Q. Implicit Grant는 왜 안 쓰나요? → A. Access Token을 URL 프래그먼트로 바로 돌려줘 **히스토리·리퍼러에 노출**되고 재발급도 어렵습니다. 지금은 **Authorization Code + PKCE**로 대체되었습니다.
- Q. 코드 교환(토큰 발급)은 프론트에서 하나요? → A. 클라이언트 시크릿이 필요한 경우 **백엔드에서** 교환해야 안전합니다. 시크릿이 없는 공용 클라이언트(SPA)는 PKCE로 보완하지만, 가능하면 백엔드(BFF)에서 교환·보관하는 게 권장됩니다.
- Q. scope가 뭔가요? → A. 앱이 요청하는 권한 범위(예: 이메일·프로필 읽기)로, 사용자는 동의 화면에서 이를 보고 허용합니다. 인가(Authorization)의 구체적 단위입니다.

<details><summary>📝 한 줄 요약</summary>OAuth 2.0 = 비번을 넘기지 않고 인가 서버가 대신 확인해 토큰 위임. 표준 흐름=Authorization Code + PKCE(코드→토큰 교환, verifier로 코드 탈취 방어). state로 CSRF 방지, Implicit은 폐기. 신원까지 담으면 OIDC(ID Token).</details>

---

## D8. SSR/Next.js 환경에서는 인증을 어떻게 다루나요? 🟡

**💬 30초 답변**
> CSR(순수 SPA)은 브라우저 JS가 토큰을 헤더에 붙여 API를 호출하지만, SSR/Next.js는 **서버가 먼저 HTML을 렌더**하므로 그 서버 렌더 시점에도 인증 정보를 알아야 합니다. 이때 자바스크립트 메모리 토큰은 서버에서 접근할 수 없으니, **쿠키 기반**이 자연스럽습니다. 요청에 자동으로 실려 오는 **HttpOnly 쿠키**를 서버 컴포넌트·미들웨어·서버 액션에서 읽어 인증 상태를 판단합니다. Next.js App Router에서는 **미들웨어**로 보호 라우트 접근을 가로채 리다이렉트하고, **서버 컴포넌트**에서 `cookies()`로 세션을 확인하는 패턴이 일반적입니다.

**📖 핵심 개념**

📌 **CSR 인증 vs SSR 인증**

| | CSR (SPA) | SSR (Next.js) |
|---|---|---|
| 렌더 위치 | 브라우저 | 서버(먼저) → 브라우저 |
| 인증 정보 접근 | JS가 헤더에 토큰 부착 | 서버가 요청 쿠키를 읽음 |
| 토큰 저장 | 메모리 + Refresh 쿠키 | **HttpOnly 쿠키가 자연스러움** |
| 보호 라우트 | 클라 라우터 가드 | **미들웨어 / 서버에서 리다이렉트** |

📌 **Next.js App Router 인증 패턴**

```tsx
// middleware.ts — 보호 라우트를 서버 진입 전에 가로채기
export function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  const isProtected = req.nextUrl.pathname.startsWith('/dashboard');
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/dashboard/:path*'] };
```

```tsx
// 서버 컴포넌트 — 요청 쿠키로 세션 확인
import { cookies } from 'next/headers';

export default async function Page() {
  const token = (await cookies()).get('session')?.value;
  const user = token ? await verifySession(token) : null;   // 서버에서 검증
  if (!user) redirect('/login');
  return <Dashboard user={user} />;
}
```

📌 **주의점**
- **미들웨어는 "존재 확인" 위주로 가볍게**: 미들웨어는 모든 매칭 요청에서 도니, 무거운 DB 검증보다 **토큰 유무·형식 위주**로 빠르게 처리하고, 실제 신뢰가 필요한 검증은 서버 컴포넌트·API에서 합니다.
- **최종 인가는 데이터 접근 지점에서**: 미들웨어만 믿지 말고, 실제 데이터를 다루는 서버 액션·Route Handler에서도 매번 세션과 권한을 확인해야 합니다(다층 방어).
- **하이드레이션 불일치 주의**: 서버가 "로그인됨"으로 렌더했는데 클라가 다르게 판단하면 깜빡임·불일치가 생기므로, 인증 상태의 소스를 **쿠키(서버·클라 공통)** 로 일관되게 둡니다.

> 💡 **왜 SSR에선 쿠키인가**: 서버는 브라우저의 메모리 변수나 localStorage에 접근할 수 없습니다. 요청과 함께 **자동 전송되는 쿠키**만이 서버 렌더 시점에 인증 정보를 전달할 수 있어, SSR 인증은 자연스럽게 HttpOnly 쿠키(또는 서버 세션) 중심이 됩니다.

**🔥 예상 꼬리질문**
- Q. SSR에서 localStorage 토큰을 쓰면 왜 문제인가요? → A. localStorage는 **브라우저에만** 존재해 서버 렌더 시점엔 비어 있습니다. 그래서 서버는 로그인 여부를 모른 채 렌더하고, 클라에서만 뒤늦게 반영되어 **깜빡임·불일치**가 납니다. 쿠키는 요청에 실려 서버도 읽습니다.
- Q. 미들웨어에서 토큰 서명까지 검증해도 되나요? → A. Edge 런타임 제약(Node 전용 라이브러리 제한)과 성능을 고려해 가볍게 하고, 무거운 검증은 서버 컴포넌트/Route Handler로 미루는 편이 일반적입니다.
- Q. App Router에서 로그인 처리는 어디서 하나요? → A. **서버 액션이나 Route Handler**에서 자격 증명을 검증하고, `cookies().set()`으로 HttpOnly 세션 쿠키를 심는 방식이 App Router의 표준 패턴입니다.

<details><summary>📝 한 줄 요약</summary>SSR은 서버가 먼저 렌더 → 서버가 읽을 수 있는 HttpOnly 쿠키 기반이 자연스러움(메모리/localStorage는 서버 접근 불가). Next.js: 미들웨어로 보호 라우트 가로채기 + 서버 컴포넌트에서 cookies()로 검증. 최종 인가는 데이터 지점마다 다층으로.</details>

---

## 🎯 오늘의 핵심 5줄 정리

1. **인증(누구세요, 401) vs 인가(권한 있나요, 403)** 를 구분하고, 인가의 최종 판단은 항상 서버에서 한다.
2. **세션(stateful, 즉시 무효화 쉬움)** 과 **토큰(stateless, 확장 쉬움)** 은 트레이드오프이며, 실무는 "짧은 Access + 서버 관리 Refresh" 하이브리드가 표준.
3. **JWT = Header.Payload.Signature**, 앞 둘은 Base64URL(암호화 아님)이라 누구나 읽으니 민감정보 금지, 보안은 서명이 담당.
4. **Access(메모리, 짧게) + Refresh(HttpOnly 쿠키, 길게)** 로 나누고, 401 인터셉터로 자동 재발급하되 **동시성 제어**와 **Refresh Rotation**을 반드시 고려.
5. **OAuth 2.0은 Authorization Code + PKCE**가 현대 표준(Implicit 폐기), **SSR은 쿠키 기반**(서버가 읽을 수 있어야 하므로).

> 📌 연결 자료: 웹 보안(2026-07-21, XSS/CSRF/CSP·쿠키 플래그) · 브라우저 저장소(2026-07-31, 쿠키/localStorage 특성) · 네트워크·HTTP(2026-07-23, HTTPS/CORS credentials) · 기존 5.common.md Q83(세션·쿠키 보안)
