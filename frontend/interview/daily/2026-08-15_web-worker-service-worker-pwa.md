# 브라우저 멀티스레딩과 백그라운드 처리 · Web Worker · Service Worker · PWA/오프라인

> 주제: 신입~주니어 프론트엔드가 면접에서 "JS는 싱글 스레드라 무거운 작업 하면 멈춰요" 정도를 넘어 "**메인 스레드를 막지 않고 무거운 연산을 어떻게 다른 스레드(Web Worker)로 넘기는지**, Web Worker와 Service Worker가 무엇이 다른지, Service Worker가 어떻게 네트워크 요청을 가로채(intercept) 캐싱·오프라인을 구현하는지, 그 생명주기(install/activate)와 흔한 함정은 무엇인지, PWA는 무엇으로 구성되며 왜/언제 쓰는지"를 브라우저 플랫폼 수준으로 설명할 줄 안다를 보여주는 심화 — 싱글 스레드의 한계와 이벤트 루프 복습, Web Worker(전용/공유 워커·postMessage·구조화된 복제·Transferable·언제 쓰나), Service Worker의 정체와 생명주기, fetch 이벤트 가로채기와 캐싱 전략(Cache First/Network First/SWR), PWA 구성요소(Manifest·SW·HTTPS)와 설치·오프라인, 흔한 오해와 함정
> 출처: 일일 심화 자료 (기존 3.js.md의 이벤트 루프 편, 07-22 이벤트 루프·마이크로태스크 편, 07-31 브라우저 저장소(Cache Storage) 편, 07-23 HTTP 캐싱 편의 상위/실전 보강편)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화
> ※ 본 문서의 API는 2025년 기준 모든 최신 브라우저에서 안정(stable) 지원됩니다. Service Worker/Manifest는 반드시 **HTTPS(또는 localhost)** 에서만 동작합니다.

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-js는-싱글-스레드인데-무거운-작업을-어떻게-메인-스레드를-막지-않고-처리하나요) | 싱글 스레드의 한계 · 왜 워커가 필요한가 | 🔴 |
| [D2](#d2-web-worker란-무엇이고-어떻게-쓰나요-postmessage-구조화된-복제) | Web Worker · `postMessage` · 구조화된 복제 · Transferable | 🔴 |
| [D3](#d3-web-worker는-언제-쓰고-언제-쓰지-말아야-하나요) | Web Worker를 언제 쓰나 (실전 판단) | 🟡 |
| [D4](#d4-service-worker란-무엇이고-web-worker와-무엇이-다른가요) | Service Worker의 정체 · Web Worker와의 차이 | 🔴 |
| [D5](#d5-service-worker의-생명주기installactivate를-설명해-주세요) | 생명주기 (install·activate·업데이트 함정) | 🔴 |
| [D6](#d6-service-worker로-오프라인캐싱을-어떻게-구현하나요-캐싱-전략) | fetch 가로채기 · 캐싱 전략 (Cache First/Network First/SWR) | 🔴 |
| [D7](#d7-pwaprogressive-web-app란-무엇이며-무엇으로-구성되나요) | PWA 구성요소 · Manifest · 설치 | 🟡 |
| [D8](#d8-service-workerpwa에서-흔히-겪는-오해와-함정은) | 흔한 오해와 함정 | 🟡 |

---

## D1. JS는 싱글 스레드인데, 무거운 작업을 어떻게 메인 스레드를 막지 않고 처리하나요? 🔴

**💬 30초 답변**
> 자바스크립트 실행 자체는 **하나의 메인 스레드**에서 일어납니다. 그래서 이미지 필터링, 큰 배열 정렬, 파싱 같은 **CPU 집약적(동기) 작업**을 메인 스레드에서 돌리면, 그 작업이 끝날 때까지 이벤트 루프가 멈춰 클릭·스크롤·애니메이션이 전부 얼어붙습니다(이걸 "메인 스레드 블로킹" 또는 화면 끊김 "jank"라고 합니다). `setTimeout`이나 `async/await`는 **비동기 I/O를 대기하는 문제**는 풀어주지만, **CPU 연산 자체를 나눠주지는 않습니다** — 계산은 여전히 메인 스레드에서 돕니다. 진짜로 별도 스레드에서 병렬로 돌리려면 **Web Worker**를 써서 계산을 다른 스레드로 넘겨야 합니다. 브라우저는 실제로 여러 스레드를 갖고 있고(렌더링·네트워크·컴포지터 등), Web Worker는 우리가 직접 만들 수 있는 백그라운드 JS 스레드입니다.

**📖 핵심 개념**

🎯 **비유**: 식당에 계산원(메인 스레드)이 한 명뿐입니다. 손님 응대(UI 이벤트), 주문 접수, 카드 결제를 모두 이 한 명이 처리합니다. 그런데 손님이 "재고 전체를 손으로 세어 달라"(무거운 CPU 작업)고 시키면, 계산원이 그동안 다른 손님을 전혀 못 받습니다. 해결책은 **뒤에 있는 창고 직원(Web Worker)에게 "이거 세고 결과만 알려줘"라고 쪽지(postMessage)를 넘기는 것**입니다. 계산원은 그동안 계속 손님을 받고, 창고 직원이 다 세면 결과 쪽지를 다시 보내줍니다.

📌 **비동기(async) ≠ 병렬(parallel)**: 면접에서 자주 헷갈리는 지점입니다. `fetch(...).then(...)`은 네트워크 응답을 **기다리는** 동안 메인 스레드를 놓아줍니다(논블로킹 I/O). 하지만 응답을 받아 JSON을 `JSON.parse`로 파싱하거나 큰 배열을 `.map`으로 도는 **계산 자체는 메인 스레드에서 동기로** 실행됩니다. 즉 async는 "기다림"을 양보할 뿐, "계산"을 다른 코어로 옮기지 않습니다. 계산을 옮기는 것이 Web Worker의 역할입니다.

📌 **왜 60fps가 기준인가**: 화면은 보통 초당 60번 갱신되므로, 한 프레임에 쓸 수 있는 시간은 약 **16.6ms**입니다. 이벤트 콜백 하나가 이 시간을 넘게 메인 스레드를 잡으면 프레임을 건너뛰어(dropped frame) 버벅임이 보입니다. 그래서 긴 작업은 잘게 쪼개거나(chunking), 워커로 넘기거나(offloading), 필요하면 `requestIdleCallback`으로 한가할 때 처리합니다.

```js
// 나쁨: 메인 스레드에서 무거운 계산 → 이 동안 UI 완전히 멈춤
button.addEventListener('click', () => {
  const result = heavySort(millionItems); // 예: 2초간 CPU 점유
  render(result);                         // 이 2초 동안 스크롤/클릭 다 얼어붙음
});
```

**🔥 예상 꼬리질문**

**Q. `setTimeout(fn, 0)`으로 무거운 계산을 감싸면 메인 스레드 블로킹이 풀리나요?**
A. 아니요. `setTimeout(0)`은 그 계산을 **나중 태스크로 미룰** 뿐, 결국 메인 스레드에서 동기로 실행됩니다. 실행되는 순간 여전히 UI가 멈춥니다. 다만 작업을 **여러 조각으로 나눠** 각 조각을 `setTimeout`/`requestIdleCallback`으로 흩뿌리면 중간중간 이벤트 루프가 돌 틈이 생겨 체감 반응성은 나아집니다. 그래도 근본 해법은 워커입니다.

**Q. 그럼 브라우저는 싱글 스레드가 아니네요?**
A. "자바스크립트 실행(메인 스레드)"이 하나일 뿐, 브라우저 자체는 멀티 스레드/멀티 프로세스입니다. 렌더링, 네트워크, 컴포지팅, GC 일부 등은 별도 스레드에서 돌아갑니다. 우리가 코드로 스레드를 하나 더 얻는 방법이 Web Worker입니다.

<details><summary>📝 한 줄 요약</summary>
JS 실행은 메인 스레드 하나뿐이라 CPU 집약 작업은 UI를 멈춘다. async는 "기다림"만 양보할 뿐 계산은 못 옮긴다. 계산을 진짜 다른 스레드로 넘기는 도구가 Web Worker다.
</details>

---

## D2. Web Worker란 무엇이고 어떻게 쓰나요? (`postMessage`, 구조화된 복제) 🔴

**💬 30초 답변**
> Web Worker는 **메인 스레드와 별개로 도는 백그라운드 자바스크립트 스레드**입니다. 메인 스레드와 워커는 메모리를 공유하지 않고, 오직 **메시지 전달(`postMessage`)** 로만 소통합니다. 보낸 데이터는 참조가 아니라 **구조화된 복제(structured clone)** 로 **복사**되어 전달되므로, 양쪽이 같은 객체를 건드려 생기는 경쟁 조건(race condition)이 원천적으로 없습니다. 워커에는 DOM·`window`가 없어서(대신 `self`, `fetch`, `postMessage` 등은 있음) UI를 직접 못 만지고, 순수 계산·데이터 처리에 씁니다. 대용량 바이너리는 복사 비용이 크므로 `ArrayBuffer` 같은 **Transferable 객체**를 넘겨 **복사 없이 소유권만 이전**할 수 있습니다.

**📖 핵심 개념**

🎯 **비유**: 워커는 **벽으로 분리된 옆방의 직원**입니다. 방 사이에 창문이 없어 서로의 책상(메모리)을 볼 수 없고, 오직 **우편함(postMessage)** 으로 서류 사본을 주고받습니다. 사본을 주고받으니 둘이 같은 서류를 동시에 고쳐 엉키는 일이 없습니다. 아주 두꺼운 서류(ArrayBuffer)는 복사하면 느리니, 아예 **원본을 통째로 옆방에 넘겨버리고(Transferable) 이쪽 손에서는 없애는** 방법도 있습니다.

📌 **워커의 종류**:
- **Dedicated Worker(전용 워커)**: 만든 그 페이지 하나만 쓰는 워커. 가장 흔함.
- **Shared Worker(공유 워커)**: 같은 오리진의 여러 탭/창이 공유하는 워커. 탭 간 상태 공유 등에 쓰지만 지원·디버깅이 까다로워 실무 사용은 적음.
- **Service Worker**: 이름은 비슷하지만 **성격이 완전히 다른** 특수 워커(네트워크 프록시·캐시용). → D4에서 별도로 다룸.

📌 **구조화된 복제(structured clone)의 특징**: 함수, DOM 노드, 클래스 인스턴스의 메서드 등은 복제되지 않아 오류가 납니다. 반면 객체·배열·`Date`·`Map`·`Set`·`ArrayBuffer`·순환 참조는 복제됩니다. (JSON 직렬화보다 넓은 범위를 지원.)

```js
// main.js — 메인 스레드
const worker = new Worker(
  new URL('./sort.worker.js', import.meta.url), // 번들러(Vite/Webpack)와 궁합 좋은 표준 방식
  { type: 'module' }                            // 워커에서 import/export 사용 허용
);

worker.postMessage(millionItems);               // 데이터를 "복사"해서 워커로 전달
worker.onmessage = (e) => render(e.data);        // 워커가 계산을 끝내 보낸 결과 수신
worker.onerror = (e) => console.error(e.message);
// 다 쓰면 worker.terminate();  // 메인에서 강제 종료 (자원 회수)
```

```js
// sort.worker.js — 워커 스레드 (별도 파일, DOM 없음)
self.onmessage = (e) => {
  const sorted = heavySort(e.data); // 무거운 계산을 여기서 (메인 스레드는 자유)
  self.postMessage(sorted);         // 결과를 메인으로 되돌려 보냄
};
```

```js
// Transferable — 대용량 바이너리는 복사 대신 "소유권 이전"
const buffer = new ArrayBuffer(64 * 1024 * 1024); // 64MB
worker.postMessage(buffer, [buffer]); // 2번째 인자 = 이전할 목록
// 이 시점부터 메인 스레드의 buffer는 "detached"되어 사용 불가 (byteLength === 0)
```

**🔥 예상 꼬리질문**

**Q. 워커에서 DOM을 못 만지면, 계산 결과를 어떻게 화면에 반영하나요?**
A. 워커는 계산만 하고 `postMessage`로 결과(숫자·배열·문자열 등)를 메인 스레드로 돌려보냅니다. **DOM 갱신은 언제나 메인 스레드가** 그 결과를 받아 처리합니다. 워커는 "계산 담당", 메인은 "그리기 담당"으로 역할을 나눕니다.

**Q. 구조화된 복제와 Transferable은 언제 각각 쓰나요?**
A. 일반 객체·배열은 그냥 `postMessage(data)`로 복제해 넘깁니다. 데이터가 수십 MB급 바이너리(이미지 픽셀, 오디오 버퍼 등)라 복사 비용이 부담되면, `ArrayBuffer`로 만들어 Transferable로 넘겨 복사 없이 즉시 이전합니다. 단, 이전한 쪽에서는 그 버퍼를 더 못 씁니다.

**Q. 워커를 너무 많이 만들면요?**
A. 스레드도 자원이라 무한정 만들면 오히려 컨텍스트 스위칭·메모리 비용이 큽니다. 보통 작업 종류별로 하나를 재사용하거나, 병렬 처리가 필요하면 코어 수(`navigator.hardwareConcurrency`) 정도로 **워커 풀**을 만들어 재사용합니다.

<details><summary>📝 한 줄 요약</summary>
Web Worker는 메모리를 공유하지 않고 postMessage로 소통하는 백그라운드 JS 스레드다. 데이터는 구조화된 복제로 복사되며, 대용량 바이너리는 Transferable로 소유권만 넘긴다. DOM은 못 만지므로 계산 전용이다.
</details>

---

## D3. Web Worker는 언제 쓰고, 언제 쓰지 말아야 하나요? 🟡

**💬 30초 답변**
> Web Worker의 이점은 오직 **"메인 스레드를 오래 붙잡는 CPU 집약 작업"** 을 옮길 때 나옵니다. 대표적으로 대용량 데이터 파싱·정렬·필터링, 이미지/비디오 픽셀 처리, 암호화·해싱, 압축, 대량 계산(물리 시뮬레이션, 텍스트 인덱싱) 등입니다. 반대로 **단순 네트워크 요청**은 이미 비동기라 워커로 옮겨도 이득이 거의 없고, **DOM 조작**은 워커에서 불가능하며, **작은 데이터를 자주 주고받는** 작업은 오히려 postMessage 직렬화/복사 비용이 계산 이득을 잡아먹어 손해입니다. "이 함수가 16ms를 훌쩍 넘겨 프레임을 떨어뜨리는가?"를 프로파일링(Performance 패널)으로 확인한 뒤 판단하는 게 정석입니다.

**📖 핵심 개념**

📌 **워커가 이득인 경우 (CPU-bound, 메인 스레드 점유가 김)**:
- 수만~수백만 건 데이터 정렬·집계·필터 (대시보드·표 계산)
- Canvas/이미지 픽셀 조작, 오디오 처리
- 클라이언트 사이드 암호화·해싱(예: 대용량 파일 체크섬)
- 마크다운/구문 강조 파싱, 검색 인덱스 생성

📌 **워커가 이득이 아닌 경우**:
- 단순 `fetch` — 이미 논블로킹. 워커로 감싸도 UI가 덜 멈추지 않음.
- DOM 갱신 — 워커에서 불가능(결국 메인이 함).
- 아주 작은/가벼운 연산 — postMessage 왕복·복제 비용 > 얻는 이득.
- 아주 자주(매 프레임) 큰 데이터를 주고받아야 하는 경우 — 복사 비용이 병목. (이럴 땐 Transferable이나 `SharedArrayBuffer` 검토)

📌 **실전 팁 — 라이브러리**: 워커 통신 보일러플레이트(메시지 매칭, 콜백 관리)를 직접 짜면 번거로우므로, 실무에서는 `comlink`(구글, 워커 함수를 `await`로 부르게 해줌) 같은 도구로 감싸는 경우가 많습니다. Vite/Webpack은 `new Worker(new URL(...))` 구문을 기본 지원해 별도 설정 없이 워커 파일을 번들합니다.

```js
// comlink 예시 — 워커를 마치 로컬 async 함수처럼 사용
import * as Comlink from 'comlink';
const api = Comlink.wrap(new Worker(new URL('./worker.js', import.meta.url)));
const sorted = await api.heavySort(items); // 내부적으로 postMessage 왕복을 감춰줌
```

**🔥 예상 꼬리질문**

**Q. "무거운 작업은 무조건 워커"가 정답 아닌가요?**
A. 아닙니다. 판단 기준은 "작업이 CPU 집약적이고 메인 스레드를 프레임 예산(16ms) 넘게 붙잡는가"입니다. 워커는 파일 분리·통신·복사 비용이라는 오버헤드가 있어서, 가벼운 작업엔 순손해입니다. 먼저 프로파일링으로 병목을 확인하세요.

**Q. `SharedArrayBuffer`는 뭔가요?**
A. 메인과 워커가 **같은 메모리를 실제로 공유**하는 버퍼로, 복사 없이 초고속 통신이 가능합니다. 다만 Spectre 취약점 대응으로 **교차 출처 격리(COOP/COEP 헤더)** 가 설정된 환경에서만 쓸 수 있어 도입 문턱이 높습니다. 신입 면접에선 "존재와 제약을 안다" 정도면 충분합니다.

<details><summary>📝 한 줄 요약</summary>
워커는 메인 스레드를 오래 붙잡는 CPU 집약 작업(정렬·파싱·이미지 처리 등)에만 이득이다. 단순 fetch·DOM 조작·잦은 소량 통신엔 오히려 손해다. 프로파일링으로 병목을 확인하고 결정한다.
</details>

---

## D4. Service Worker란 무엇이고, Web Worker와 무엇이 다른가요? 🔴

**💬 30초 답변**
> Service Worker(SW)는 이름은 워커지만 목적이 전혀 다릅니다. 웹 페이지와 네트워크(그리고 캐시) 사이에 앉는 **프로그래밍 가능한 네트워크 프록시**입니다. 페이지에서 나가는 모든 `fetch` 요청을 SW가 **가로채(intercept)** 서, 캐시에서 응답할지·네트워크로 보낼지·둘을 조합할지를 우리가 코드로 정할 수 있습니다. 이게 **오프라인 동작**과 정교한 캐싱, 그리고 푸시 알림·백그라운드 동기화의 기반이 됩니다. Web Worker와의 결정적 차이는 **수명**입니다. Web Worker는 만든 페이지에 종속돼 페이지가 닫히면 사라지지만, SW는 **페이지와 독립적으로** 브라우저가 필요할 때 깨우고 끝나면 재우는(event-driven) 방식이라 페이지가 없어도 살아 있습니다. 대신 반드시 **HTTPS**에서만 동작하고, DOM 접근은 둘 다 불가합니다.

**📖 핵심 개념**

🎯 **비유**: Web Worker가 "옆방의 계산 직원"이라면, Service Worker는 **건물 1층 로비의 우편 중개인**입니다. 모든 택배(네트워크 요청)가 이 중개인을 거칩니다. 중개인은 "이건 창고(캐시)에 사본이 있으니 바로 내주자", "이건 밖에서 새로 받아오되 사본도 창고에 챙겨두자", "인터넷이 끊겼으니 창고 사본으로 대체하자"를 판단합니다. 사무실(페이지)에 아무도 없어도 로비의 중개인은 (택배가 오면) 깨어나 일합니다.

📌 **Web Worker vs Service Worker 비교**:

| 항목 | Web Worker | Service Worker |
|---|---|---|
| 목적 | CPU 작업 병렬화 | 네트워크 프록시·캐시·오프라인 |
| 개수/범위 | 페이지가 만든 만큼 | 오리진(scope)당 하나가 여러 탭 제어 |
| 수명 | 만든 페이지에 종속 (닫히면 종료) | 페이지와 독립, 이벤트 기반으로 깨어남 |
| 네트워크 가로채기 | ❌ | ✅ (`fetch` 이벤트) |
| HTTPS 필수 | ❌ (http도 가능) | ✅ (localhost 예외) |
| DOM 접근 | ❌ | ❌ |
| 주요 API | `postMessage` | `install`/`activate`/`fetch`, `Cache`, Push |

📌 **SW는 "믿을 수 없는 상태(stateless)"라고 가정하라**: SW는 언제든 브라우저가 종료시켰다가 다시 띄울 수 있습니다. 따라서 SW 안의 전역 변수에 상태를 오래 저장하면 안 됩니다. 유지할 데이터는 Cache Storage나 IndexedDB 같은 **영속 저장소**에 둡니다.

📌 **등록(register)**: 페이지에서 SW 파일을 등록하면 브라우저가 백그라운드에 설치합니다. `scope`는 SW가 제어하는 URL 경로 범위로, 기본값은 SW 파일이 놓인 경로입니다(그래서 보통 사이트 루트 `/sw.js`에 둠).

```js
// 페이지 측 — SW 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js') // 루트에 두면 scope가 '/' → 사이트 전체 제어
      .then((reg) => console.log('SW 등록됨, scope:', reg.scope))
      .catch((err) => console.error('SW 등록 실패:', err));
  });
}
```

**🔥 예상 꼬리질문**

**Q. Service Worker는 왜 HTTPS에서만 되나요?**
A. SW는 네트워크 요청을 가로채고 응답을 조작할 수 있는 강력한 권한을 가집니다. 만약 중간자 공격(MITM)이 가능한 평문 HTTP에서 허용하면, 공격자가 악성 SW를 심어 사용자의 모든 요청을 영구적으로 가로챌 수 있습니다. 그래서 보안상 HTTPS(개발 편의를 위한 localhost 예외 포함)를 강제합니다.

**Q. SW가 페이지 없이도 산다는 게 무슨 뜻인가요?**
A. 예를 들어 푸시 알림이 오면, 사용자가 사이트 탭을 다 닫아둔 상태여도 브라우저가 SW를 깨워 `push` 이벤트를 처리해 알림을 띄웁니다. 처리가 끝나면 SW는 다시 잠듭니다. 이 "필요할 때만 깨어나는" 특성 때문에 전역 상태에 의존하면 안 됩니다.

**Q. SW 하나가 여러 탭을 제어하나요?**
A. 네. scope에 속한 같은 오리진의 모든 탭/페이지를 하나의 SW가 제어합니다(client가 여럿). 그래서 SW를 업데이트할 때 여러 탭의 처리를 고려해야 합니다(D5).

<details><summary>📝 한 줄 요약</summary>
Service Worker는 페이지와 네트워크 사이에 앉는 프로그래밍 가능한 프록시로, fetch를 가로채 캐싱·오프라인·푸시를 구현한다. Web Worker(CPU 병렬화)와 달리 페이지와 독립적으로 이벤트 기반으로 살고, HTTPS를 강제하며 오리진당 여러 탭을 제어한다.
</details>

---

## D5. Service Worker의 생명주기(install/activate)를 설명해 주세요 🔴

**💬 30초 답변**
> SW는 등록 후 **다운로드 → 설치(install) → 활성화(activate) → 유휴/실행** 단계를 거칩니다. `install`은 처음 등록되거나 SW 파일이 바뀌었을 때 한 번 실행되며, 보통 여기서 **핵심 정적 파일을 캐시에 미리 담습니다(precache)**. `activate`는 이 SW가 페이지 제어를 넘겨받는 시점으로, 보통 **옛 버전 캐시를 정리**합니다. 가장 헷갈리는 함정은 **업데이트**입니다. 새 SW는 설치돼도 기존 SW가 제어 중인 탭이 하나라도 열려 있으면 곧바로 활성화되지 못하고 **'waiting(대기)' 상태**로 멈춰 있습니다. 모든 탭을 닫았다 다시 열어야 새 SW가 활성화되죠. 이를 즉시 넘기려면 `skipWaiting()`과 `clients.claim()`을 씁니다.

**📖 핵심 개념**

📌 **단계별 정리**:
1. **register** — 페이지가 SW를 등록. 브라우저가 SW 스크립트를 내려받아 파싱.
2. **install** — SW의 첫 설치(또는 파일 변경 감지 시). `event.waitUntil()`로 캐시 준비가 끝날 때까지 이 단계를 붙잡음.
3. **waiting** — 새 SW가 설치됐지만, 구 SW가 제어하는 페이지가 살아 있으면 여기서 대기.
4. **activate** — 제어권 인수. 옛 캐시 청소. 여기서도 `waitUntil()`로 정리가 끝날 때까지 대기.
5. **idle ↔ fetch/push/...** — 이후엔 이벤트가 올 때만 깨어나 처리하고 다시 잠듦.

📌 **바이트 단위 업데이트 감지**: 사용자가 사이트를 재방문하면 브라우저가 `sw.js`를 다시 받아 **기존과 바이트가 다른지** 비교합니다. 다르면 새 SW로 install을 시작합니다. 그래서 SW 파일 자체는 **캐시되지 않도록(no-cache)** 서빙하는 게 중요합니다(안 그러면 업데이트가 영원히 안 걸림).

📌 **`skipWaiting` / `clients.claim`의 트레이드오프**: 이 둘을 쓰면 새 SW가 대기 없이 즉시 모든 탭을 제어합니다. 배포를 빨리 반영하지만, **한 탭에서 구 버전 코드가 돌던 중 SW만 새 버전으로 바뀌어** 캐시 스키마 불일치 등 미묘한 버그가 날 수 있습니다. 그래서 실무에선 "새 버전 있어요, 새로고침할까요?" UI를 띄워 사용자 동의 후 `skipWaiting`을 부르는 패턴을 많이 씁니다.

```js
// sw.js — 생명주기 이벤트
const CACHE = 'app-v3'; // 배포마다 버전 올림
const PRECACHE = ['/', '/index.html', '/styles.css', '/app.js', '/offline.html'];

self.addEventListener('install', (event) => {
  // 설치가 끝나기 전에 핵심 파일을 캐시에 담아둠 (오프라인 대비)
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
    // .then(() => self.skipWaiting()) // 즉시 활성화하고 싶다면
  );
});

self.addEventListener('activate', (event) => {
  // 옛 버전 캐시 정리 (이름이 현재 버전과 다른 캐시 삭제)
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()) // 열려 있는 탭까지 즉시 제어
  );
});
```

**🔥 예상 꼬리질문**

**Q. 코드를 배포했는데 사용자에게 반영이 안 돼요. 왜죠?**
A. SW가 옛 파일을 캐시로 계속 내주고 있고, 새 SW는 waiting 상태에 갇혀 있을 가능성이 큽니다. ① `sw.js`가 캐시되지 않게 서빙되는지, ② 캐시 버전 문자열을 올렸는지, ③ 새 버전 알림 후 `skipWaiting`으로 넘기는 로직이 있는지 확인합니다. 개발 중엔 DevTools > Application > Service Workers의 "Update on reload"가 유용합니다.

**Q. `event.waitUntil()`은 왜 필요한가요?**
A. install/activate는 비동기 작업(캐시 채우기 등)이 끝나기 전에 브라우저가 SW를 종료시킬 수 있습니다. `waitUntil(promise)`는 그 Promise가 끝날 때까지 해당 단계를 **살아 있게 붙잡아** 작업 완료를 보장합니다.

**Q. `self.skipWaiting()`과 `clients.claim()`의 차이는?**
A. `skipWaiting()`은 waiting 단계를 건너뛰고 새 SW를 **즉시 활성화**시킵니다. `clients.claim()`은 활성화된 SW가 **이미 열려 있던 페이지들까지 지금 바로 제어**하도록 합니다(원래는 다음 로드부터 제어). 보통 즉시 반영을 원하면 둘을 함께 씁니다.

<details><summary>📝 한 줄 요약</summary>
SW는 install(정적 파일 precache) → waiting(구 SW가 살아 있으면 대기) → activate(옛 캐시 정리) 순으로 산다. 새 배포가 안 걸리는 건 대개 waiting에 갇혀서다. skipWaiting/clients.claim으로 즉시 넘기되, 사용자 동의 후 반영하는 패턴이 안전하다.
</details>

---

## D6. Service Worker로 오프라인/캐싱을 어떻게 구현하나요? (캐싱 전략) 🔴

**💬 30초 답변**
> 핵심은 SW의 **`fetch` 이벤트**입니다. 페이지의 모든 요청이 이 이벤트로 들어오고, `event.respondWith(...)`로 우리가 응답을 직접 만들어 돌려줍니다. 응답 소스는 **Cache Storage**(요청/응답 쌍을 저장하는 SW 전용 캐시)와 네트워크입니다. 리소스 성격에 따라 전략을 고릅니다: 자주 안 바뀌는 정적 에셋(로고·폰트·빌드된 JS/CSS)은 **Cache First**(캐시 먼저, 없으면 네트워크), 항상 최신이어야 하는 API 데이터는 **Network First**(네트워크 먼저, 실패 시 캐시), 속도와 신선도 둘 다 원하면 **Stale-While-Revalidate**(캐시로 즉시 응답하고 뒤에서 네트워크로 갱신)를 씁니다. 그리고 네트워크·캐시 모두 실패하면 미리 캐시해 둔 `offline.html` 같은 **폴백**을 내줍니다.

**📖 핵심 개념**

📌 **세 가지 대표 전략**:
- **Cache First (Cache, falling back to network)** — 캐시에 있으면 즉시 반환(가장 빠름), 없으면 네트워크로 받아 캐시에 저장. 해시가 박힌 정적 빌드 파일(`app.abc123.js`)처럼 내용이 바뀌면 파일명이 바뀌는 리소스에 이상적.
- **Network First (Network, falling back to cache)** — 네트워크를 먼저 시도(최신 보장), 실패(오프라인)하면 캐시로 폴백. 뉴스·타임라인·잔액 등 최신성이 중요한 API에 적합.
- **Stale-While-Revalidate** — 캐시본을 즉시 돌려주면서(빠름) 동시에 네트워크 요청을 보내 캐시를 갱신(다음 방문 때 최신). 아바타·설정처럼 "약간 오래돼도 되지만 결국 갱신되면 좋은" 리소스에 적합. HTTP 캐시 헤더의 `stale-while-revalidate`와 개념이 같음.

📌 **Cache Storage vs HTTP 캐시 vs 다른 저장소**: Cache Storage는 **JS로 완전히 제어**하는 캐시로, 브라우저의 자동 HTTP 캐시와 별개입니다. `Request`를 키로 `Response`를 저장하며, 무엇을 넣고 언제 지울지 우리가 코드로 결정합니다. (대량 구조화 데이터는 IndexedDB, 인증 토큰 등 민감정보는 아예 캐시하지 않는 게 원칙 — 07-31 저장소 편 참고.)

📌 **실무에선 Workbox**: 이 전략들을 직접 짜면 엣지 케이스(부분 응답, opaque 응답, 캐시 만료·정리)가 많습니다. 그래서 구글의 **Workbox** 라이브러리로 라우트별 전략을 선언적으로 지정하는 경우가 많습니다. Next.js·Vite 등에는 PWA 플러그인이 Workbox를 감싸 제공합니다.

```js
// sw.js — 요청 성격에 따라 전략 분기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1) API 요청: Network First (최신 우선, 오프라인이면 캐시)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();               // 응답은 1회용 스트림 → 복제 필수
          caches.open('api').then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))        // 네트워크 실패 시 캐시 폴백
    );
    return;
  }

  // 2) 정적 에셋(GET): Cache First (빠름, 없으면 네트워크 후 저장)
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open('assets').then((c) => c.put(request, copy));
          return res;
        }).catch(() => caches.match('/offline.html')) // 최종 폴백(페이지 요청 등)
      )
    );
  }
});
```

**🔥 예상 꼬리질문**

**Q. `response.clone()`은 왜 하나요?**
A. `Response`(와 `Request`)의 본문은 **한 번만 읽을 수 있는 스트림**입니다. 캐시에 저장하려고 본문을 읽으면 정작 브라우저에 돌려줄 본문이 소진돼 버립니다. 그래서 캐시에 넣을 것과 반환할 것, 두 벌이 필요하니 `clone()`으로 복제합니다.

**Q. 무엇을 캐시하면 안 되나요?**
A. 인증 토큰이 담긴 응답, 사용자별 민감 데이터, `POST` 같은 변경성 요청의 응답 등은 캐시하면 보안·정합성 문제가 생깁니다. 또 다른 오리진의 CORS 없는 응답은 "opaque"라 상태 코드를 못 봐서 실패한 응답까지 캐시할 위험이 있어 주의합니다.

**Q. 오프라인일 때 SPA 라우팅은 어떻게 처리하나요?**
A. 앱 셸(App Shell) 패턴을 씁니다. 껍데기 HTML(`index.html`)과 핵심 JS/CSS를 install 때 precache 해두고, 내비게이션 요청이 오면 이 셸을 캐시에서 내줍니다. 라우팅은 클라이언트 JS가 처리하고, 데이터는 위 전략(Network First 등)으로 채웁니다.

<details><summary>📝 한 줄 요약</summary>
fetch 이벤트에서 respondWith로 응답을 만든다. 정적 에셋은 Cache First, 최신 API는 Network First, 속도+신선도는 Stale-While-Revalidate. Response는 1회용 스트림이라 캐시엔 clone()을 넣고, 최종 폴백으로 offline.html을 준다.
</details>

---

## D7. PWA(Progressive Web App)란 무엇이며, 무엇으로 구성되나요? 🟡

**💬 30초 답변**
> PWA는 **웹 기술로 만든 앱을, 네이티브 앱에 가깝게 설치·오프라인 동작·재방문 유도까지 되게 만든 것**입니다. 특정 프레임워크가 아니라 몇 가지 웹 표준을 조합한 **접근 방식**이죠. 최소 구성은 세 가지입니다: ① **Web App Manifest**(앱 이름·아이콘·시작 URL·표시 모드를 담은 JSON — 홈 화면 설치와 전체화면 실행을 가능케 함), ② **Service Worker**(캐싱·오프라인·푸시), ③ **HTTPS**(SW의 전제). 이게 갖춰지면 사용자가 브라우저에서 "홈 화면에 추가/설치"로 아이콘을 만들고, 주소창 없는 독립 창으로 앱처럼 실행하며, 오프라인에서도 열립니다. 앱스토어 심사·설치 마찰 없이 배포된다는 게 큰 장점입니다.

**📖 핵심 개념**

📌 **Web App Manifest 핵심 필드**:
- `name` / `short_name` — 설치 시 표시될 앱 이름.
- `start_url` — 앱을 열 때 로드할 URL.
- `display` — `standalone`(주소창 없는 독립 창), `fullscreen`, `minimal-ui`, `browser`.
- `icons` — 홈 화면·스플래시용 아이콘(여러 해상도, 특히 512×512 및 `purpose: "maskable"` 권장).
- `theme_color` / `background_color` — 상단바 색·스플래시 배경색.

```html
<!-- HTML <head>에 연결 -->
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#0b5cff" />
```

```json
// manifest.webmanifest
{
  "name": "My Study App",
  "short_name": "Study",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0b5cff",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

📌 **설치(Installability) 조건**: 브라우저가 설치를 제안하려면 대체로 HTTPS + 유효한 manifest(이름·아이콘·start_url·display) + 등록된 SW가 필요합니다. Chrome 계열은 `beforeinstallprompt` 이벤트를 잡아 "앱 설치" 버튼을 직접 노출할 수 있습니다. iOS Safari는 "홈 화면에 추가"로 설치되지만 지원 범위·제약이 데스크톱/안드로이드와 다릅니다.

📌 **PWA가 추가로 열어주는 기능**: 푸시 알림(Push API + Notifications), 백그라운드 동기화(Background Sync — 오프라인에서 보낸 요청을 온라인 복구 시 재전송), 홈 화면 실행, 스플래시 화면 등. 다만 기능별 브라우저 지원 편차가 크므로 "핵심은 웹으로 되게 하고, PWA 기능은 향상(progressive enhancement)으로 얹는다"가 원칙입니다.

📌 **언제 PWA가 적합한가**: 재방문이 잦고 오프라인·설치가 UX에 가치를 더하는 서비스(뉴스, 이메일, 노트, 커머스, 대시보드). 반대로 일회성 랜딩 페이지엔 과합니다. 네이티브만의 깊은 OS 통합(고급 블루투스, 백그라운드 상시 실행 등)이 필요하면 여전히 네이티브가 유리합니다.

**🔥 예상 꼬리질문**

**Q. PWA와 반응형 웹의 차이는?**
A. 반응형 웹은 "화면 크기에 맞춰 레이아웃이 유연한 것"입니다. PWA는 거기에 **설치 가능성·오프라인·백그라운드 기능**을 더한 개념입니다. 좋은 PWA는 보통 반응형이지만, 반응형이라고 다 PWA는 아닙니다.

**Q. manifest만 있으면 설치되나요?**
A. 보통은 부족합니다. 브라우저별로 다르지만 대체로 HTTPS + 유효 manifest + 동작하는 SW(오프라인 처리)가 갖춰져야 설치 프롬프트가 뜹니다. Lighthouse의 PWA 감사로 요건 충족 여부를 점검할 수 있습니다.

**Q. iOS에서도 PWA가 잘 되나요?**
A. 설치·오프라인 등 기본은 되지만, 푸시·백그라운드 등 일부 기능의 지원과 제약이 데스크톱/안드로이드와 다릅니다. 그래서 타깃 플랫폼에서 실제로 필요한 기능이 되는지 확인하고, 안 되는 기능은 우아하게 대체(graceful degradation)하도록 설계합니다.

<details><summary>📝 한 줄 요약</summary>
PWA = 웹으로 만든 앱을 설치·오프라인·재방문까지 되게 하는 접근 방식. 최소 구성은 Manifest(설치·아이콘) + Service Worker(캐싱·오프라인·푸시) + HTTPS. 재방문·오프라인이 가치 있는 서비스에 적합하고, 기능은 progressive enhancement로 얹는다.
</details>

---

## D8. Service Worker/PWA에서 흔히 겪는 오해와 함정은? 🟡

**💬 30초 답변**
> 가장 큰 함정은 **캐시가 사용자를 옛 버전에 가둬버리는 것**입니다. SW가 낡은 파일을 계속 내주는데 새 SW는 waiting에 갇혀 배포가 반영 안 되는 상황이죠. `sw.js`를 캐시 없이 서빙하고, 캐시 버전을 배포마다 올리며, 업데이트 알림·`skipWaiting` 흐름을 갖춰야 합니다. 그 밖에 자주 하는 실수는 ① SW 전역 변수에 상태를 저장(언제든 종료됨), ② 민감 데이터·인증 응답을 캐시(보안 문제), ③ `Response` 스트림을 `clone` 없이 두 번 읽기, ④ Web Worker면 되는데 Service Worker를 쓰거나 그 반대로 혼동, ⑤ HTTP(비 HTTPS)에서 왜 SW가 안 뜨는지 헤매는 것 등입니다.

**📖 핵심 개념**

📌 **오해 1 — "SW는 항상 켜져 있다"**: 아닙니다. 이벤트 기반이라 필요할 때 깨어나고 유휴 시 종료됩니다. 전역 상태는 사라진다고 가정하고, 유지할 것은 Cache/IndexedDB에 둡니다.

📌 **오해 2 — "SW를 등록하면 바로 제어한다"**: 최초 등록 시엔 그 페이지 로드가 이미 시작된 뒤라 **첫 방문에서는 제어 안 함**이 기본입니다(다음 로드부터). 즉시 제어하려면 `clients.claim()`이 필요합니다.

📌 **오해 3 — "Web Worker와 Service Worker는 비슷한 거다"**: 이름만 비슷하고 목적이 다릅니다(D4 표). 면접에서 이 둘을 정확히 구분하면 좋은 인상을 줍니다: Web Worker=CPU 병렬화, Service Worker=네트워크 프록시/오프라인.

📌 **디버깅 팁**: Chrome DevTools > **Application** 탭에서 Service Workers(상태·update·unregister), Cache Storage(캐시 내용), Manifest(설치 요건)를 눈으로 확인합니다. 개발 중엔 "Update on reload", "Bypass for network"를 켜면 캐시 혼란을 줄일 수 있습니다. 완전 초기화는 "Clear site data".

📌 **탈출구(kill switch)를 준비하라**: 잘못 배포된 SW가 사용자를 망가진 캐시에 가두는 사고를 대비해, 언제든 캐시를 비우고 자신을 해제(`registration.unregister()`)하는 최소한의 안전장치 SW를 배포할 수 있게 준비해 두는 것이 좋습니다.

**🔥 예상 꼬리질문**

**Q. 로컬(localhost)에선 SW가 되는데 배포하니 안 돼요.**
A. 십중팔구 **HTTPS 문제**입니다. SW는 보안 컨텍스트(HTTPS)에서만 동작하고 localhost만 예외로 허용됩니다. 배포 도메인의 인증서·리다이렉트(http→https)를 확인하세요.

**Q. 사용자가 "예전 화면이 계속 나온다"고 합니다. 어떻게 대응하죠?**
A. ① 캐시 버전 문자열을 올려 새 배포 유도, ② activate에서 옛 캐시 삭제 확인, ③ 새 버전 감지 시 "새로고침" 배너 노출 후 `skipWaiting`+`clients.claim`으로 전환, ④ 최악의 경우 kill-switch SW로 캐시를 비우고 unregister. 그리고 정적 에셋은 파일명 해싱을 써서 캐시 무효화를 파일 단위로 자연스럽게 처리합니다.

**Q. Service Worker가 SEO에 영향을 주나요?**
A. 검색 크롤러는 보통 SW 캐시를 거치지 않고 원본을 받으므로 SW 자체가 SEO를 좌우하진 않습니다. 다만 SW가 잘못 구성돼 크롤러에 깨진/오래된 응답을 주지 않도록, 그리고 오프라인 폴백이 실제 콘텐츠를 가리지 않도록 주의합니다.

<details><summary>📝 한 줄 요약</summary>
최대 함정은 캐시가 사용자를 옛 버전에 가두는 것 — sw.js 무캐시 서빙, 캐시 버전업, 업데이트 흐름으로 방어한다. SW 전역 상태 의존·민감정보 캐시·clone 누락·Web/Service Worker 혼동·HTTPS 누락이 단골 실수다. DevTools Application 탭과 kill-switch를 갖춰라.
</details>

---

## 🎯 이 문서 한눈에 정리

- **싱글 스레드의 한계**: JS 실행은 메인 스레드 하나. CPU 집약 작업은 UI를 멈춘다. async는 "기다림"만 양보할 뿐 계산은 못 옮긴다 → **Web Worker**로 계산을 다른 스레드로.
- **Web Worker**: 메모리 비공유, `postMessage`(구조화된 복제)로 소통, 대용량은 Transferable. DOM 불가 = 계산 전용. 정렬·파싱·이미지 처리 같은 무거운 작업에만 이득.
- **Service Worker**: 페이지와 네트워크 사이의 프로그래밍 가능한 프록시. `fetch` 가로채기로 캐싱·오프라인·푸시. 페이지와 독립적으로 이벤트 기반으로 살고 **HTTPS 필수**.
- **생명주기**: install(precache) → waiting(구 SW 살아 있으면 대기) → activate(옛 캐시 정리). 배포 반영 실패는 대개 waiting 함정 → `skipWaiting`/`clients.claim`.
- **캐싱 전략**: 정적=Cache First, 최신 API=Network First, 속도+신선도=Stale-While-Revalidate, 최종 폴백=offline.html. `Response`는 1회용 → `clone()`.
- **PWA**: Manifest + Service Worker + HTTPS. 설치·오프라인·재방문. 기능은 progressive enhancement로 얹는다.
- **함정**: 캐시가 옛 버전에 가둠, SW 전역 상태 의존, 민감정보 캐시, clone 누락, Web/Service Worker 혼동, HTTPS 누락. DevTools Application 탭으로 진단.
