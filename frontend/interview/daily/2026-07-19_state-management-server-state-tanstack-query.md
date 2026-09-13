# 상태 관리 심화 (서버 상태 vs 클라이언트 상태 · TanStack Query 캐시 전략)

> 주제: 신입~주니어가 면접에서 "useState/Redux 써봤어요"를 넘어 "상태를 성격별로 나눠 설계하고, 서버 상태는 캐시 전략으로 다룬다"를 보여주는 심화 — 클라이언트 상태 vs 서버 상태, 전역 상태 관리 지형(Redux/Zustand/Jotai/Context), TanStack Query의 캐시 생명주기·무효화·낙관적 업데이트
> 출처: 일일 심화 자료 (기존 4.react_next.md Q58 "컴포넌트 간 통신"의 상태관리 확장편 · daily 미다룸 주제)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

## 📑 목차

| # | 질문 | 우선순위 |
|---|------|:---:|
| [D1](#d1-클라이언트-상태와-서버-상태의-차이가-뭔가요) | 클라이언트 상태 vs 서버 상태 | 🔴 |
| [D2](#d2-서버-데이터를-usestate--useeffect로-관리하면-뭐가-문제인가요) | `useState+useEffect` 패턴의 한계 | 🔴 |
| [D3](#d3-전역-상태-관리-라이브러리들은-어떻게-다른가요-redux-zustand-jotai-recoil) | 전역 상태 라이브러리 지형 | 🔴 |
| [D4](#d4-context-api로-전역-상태-관리하면-안-되나요) | Context API vs 상태관리 라이브러리 | 🔴 |
| [D5](#d5-tanstack-query의-staletime과-gctime의-차이를-설명할-수-있나요) | `staleTime` vs `gcTime` · 캐시 생명주기 | 🔴 |
| [D6](#d6-캐시-무효화invalidation-전략을-설명할-수-있나요) | 캐시 무효화(invalidateQueries) 전략 | 🔴 |
| [D7](#d7-낙관적-업데이트optimistic-update를-구현해-본-적-있나요) | 낙관적 업데이트(useMutation) | 🟡 |
| [D8](#d8-tanstack-query-v5에서-바뀐-점과-자주-쓰는-옵션을-아나요) | v5 변경점 · 실무 옵션 | 🟢 |

---

## D1. 클라이언트 상태와 서버 상태의 차이가 뭔가요? 🔴

**💬 30초 답변**
> 상태는 성격에 따라 **클라이언트 상태**와 **서버 상태**로 나눌 수 있습니다. 클라이언트 상태는 모달 열림 여부, 입력값, 다크모드처럼 **내 브라우저 안에서 내가 완전히 소유하고 동기적으로 아는** 값입니다. 서버 상태는 사용자 목록, 게시글처럼 **원본이 서버에 있고, 비동기로 가져오며, 나 말고 다른 사람도 바꿀 수 있어 언제든 낡을(stale) 수 있는** 값입니다. 이 둘은 다루는 문제가 완전히 다르기 때문에, 서버 상태는 Redux 같은 클라이언트 상태 도구가 아니라 TanStack Query 같은 **서버 상태 전용 도구**로 관리하는 게 요즘 정석입니다.

**📖 핵심 개념**

🎯 **비유**: 클라이언트 상태는 **내 방 안의 물건**입니다. 내가 옮기면 그대로 있죠. 서버 상태는 **공용 도서관의 책**입니다. 내가 빌려와 책상에 복사본을 두지만, 원본은 도서관에 있고 다른 사람이 내용을 고칠 수도, 반납/대출 상태가 바뀔 수도 있습니다. 그래서 "내 복사본이 최신인가?"를 계속 신경 써야 합니다.

📌 **두 상태의 대비**

| 구분 | 클라이언트 상태 | 서버 상태 |
|---|---|---|
| 소유권 | 내가 100% 소유 | 서버가 원본, 나는 복사본 |
| 접근 방식 | 동기적(즉시) | 비동기적(fetch, 로딩·에러 존재) |
| 최신성 | 항상 최신 | 언제든 낡을 수 있음(stale) |
| 예시 | 모달 open, 폼 입력, 테마 | API로 받은 목록·상세 데이터 |
| 필요한 것 | 저장·업데이트 | 캐싱, 재검증, 로딩/에러, 중복요청 제거 |

📌 **왜 구분이 중요한가** — 서버 상태에는 클라이언트 상태에 없는 고유 문제들이 딸려 옵니다: 캐싱, 백그라운드 재요청, 같은 데이터를 여러 컴포넌트가 요청할 때 **중복 요청 제거(dedup)**, 페이지네이션·무한스크롤, "다른 탭에서 수정됐을 때" 동기화 등. 이걸 `useState`로 하나하나 직접 짜면 보일러플레이트가 폭발합니다.

> 💡 면접 포인트: "상태 관리 어떻게 하세요?"에 곧바로 "Redux요"가 아니라, **"먼저 상태를 클라이언트/서버로 나눕니다"**라고 답하면 설계 관점이 있다는 인상을 줍니다.

**🔥 예상 꼬리질문**
- Q. URL(쿼리스트링)도 상태인가요? → A. 네. 필터·페이지 번호·탭 같은 값은 **URL 상태**로 두면 공유·새로고침·뒤로가기에 강합니다. "모든 상태를 React state로 넣지 말라"는 원칙과 연결됩니다.
- Q. 폼 상태는 어디에 속하나요? → A. 편집 중인 값은 클라이언트 상태이고, 제출 후 서버가 돌려주는 결과는 서버 상태입니다. 그래서 폼은 React Hook Form(클라이언트) + Query/Mutation(서버) 조합을 많이 씁니다.
- Q. 서버 상태 도구를 쓰면 Redux는 필요 없나요? → A. 서버 데이터를 Query가 가져가면 전역 클라이언트 상태가 크게 줄어, Redux 없이 Context나 Zustand 정도로 충분해지는 경우가 많습니다.

<details><summary>📝 한 줄 요약</summary>
상태를 "내가 소유한 클라이언트 상태"와 "서버가 원본이라 언제든 낡는 서버 상태"로 나누고, 서버 상태는 전용 캐싱 도구로 다루는 게 핵심.
</details>

---

## D2. 서버 데이터를 `useState + useEffect`로 관리하면 뭐가 문제인가요? 🔴

**💬 30초 답변**
> 동작은 하지만 **직접 처리해야 할 게 너무 많습니다.** 로딩·에러·데이터 상태 3종을 매번 손으로 만들고, 컴포넌트가 언마운트된 뒤 setState되는 문제, 같은 API를 여러 곳에서 부를 때의 중복 요청, 캐싱 부재로 화면 이동마다 다시 로딩, race condition(늦게 도착한 이전 요청이 최신 데이터를 덮어씀) 등을 전부 직접 방어해야 합니다. TanStack Query 같은 도구는 이 문제들을 **선언적으로** 해결해 줘서 보일러플레이트가 사라집니다.

**📖 핵심 개념**

📌 **손으로 짠 전형적 코드 — 숨은 문제들**

```jsx
function UserList() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;            // race condition 방어를 직접 해야 함
    setIsLoading(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((json) => { if (!ignore) setData(json); })
      .catch((e) => { if (!ignore) setError(e); })
      .finally(() => { if (!ignore) setIsLoading(false); });
    return () => { ignore = true; }; // 언마운트/의존성 변경 시 정리
  }, []);
  // 캐싱 없음 → 다른 화면 갔다 오면 처음부터 다시 로딩
  // 중복 제거 없음 → 이 컴포넌트가 3개면 요청도 3번
  // 재검증 없음 → 창 다시 포커스해도 최신화 안 됨
}
```

📌 **같은 걸 TanStack Query로** — 관심사가 "무엇을 가져올지"에만 집중됩니다.

```jsx
import { useQuery } from "@tanstack/react-query";

function UserList() {
  const { data, isPending, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((r) => r.json()),
  });

  if (isPending) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <List items={data} />;
}
// 캐싱·중복 제거·재검증·race condition 방어가 전부 내장
```

📌 라이브러리가 대신 해 주는 것: **캐싱 · 중복 요청 제거 · 백그라운드 재검증(stale-while-revalidate) · 자동 재시도 · 로딩/에러 상태 · 페이지네이션/무한스크롤 · 창 포커스 시 갱신.**

> 💡 stale-while-revalidate(SWR) 전략: "일단 캐시된 낡은 데이터를 즉시 보여주고(빠른 UX), 뒤에서 조용히 새로 받아 교체한다." TanStack Query·SWR 라이브러리의 핵심 아이디어입니다.

**🔥 예상 꼬리질문**
- Q. race condition이 구체적으로 뭔가요? → A. 검색어를 빠르게 바꾸면 요청 A·B가 나가는데, 느린 A가 B보다 늦게 도착해 **오래된 결과가 최신 화면을 덮는** 현상입니다. 위 `ignore` 플래그나 AbortController로 막습니다.
- Q. 그럼 useEffect로 데이터 패칭하지 말라는 건가요? → A. 못 쓰는 건 아니지만, 서버 상태 관리 도구가 있으면 대부분 그쪽이 낫습니다. React 공식 문서도 프레임워크/전용 라이브러리 사용을 권합니다.
- Q. Next.js App Router면요? → A. 서버 컴포넌트에서 `fetch`로 직접 가져오고, 클라이언트에서 상호작용·재검증이 필요한 부분만 Query를 씁니다. 둘은 배타적이지 않습니다.

<details><summary>📝 한 줄 요약</summary>
`useState+useEffect` 패칭은 로딩/에러/중복/레이스/캐싱을 전부 수동 처리해야 함 — 서버 상태 도구가 이를 선언적으로 대체.
</details>

---

## D3. 전역 상태 관리 라이브러리들은 어떻게 다른가요? (Redux, Zustand, Jotai, Recoil) 🔴

**💬 30초 답변**
> 크게 **Flux 계열(중앙 스토어)**과 **atomic 계열(잘게 쪼갠 상태)**로 나눌 수 있습니다. Redux(Toolkit)는 단일 스토어에 액션·리듀서로 예측 가능하게 흐르는 대표 주자로, 규모가 크고 디버깅 도구가 강력합니다. Zustand는 훨씬 가볍고 보일러플레이트가 적어 요즘 신규 프로젝트에서 인기입니다. Jotai·Recoil은 상태를 atom 단위로 쪼개 필요한 컴포넌트만 구독하게 하는 방식입니다. 다만 이 도구들은 **클라이언트 상태용**이고, 서버 데이터는 TanStack Query로 빼는 게 현대적 조합입니다.

**📖 핵심 개념**

🎯 **비유**: Redux는 **회사의 중앙 결재 시스템**입니다 — 모든 변경이 정해진 절차(action→reducer)를 거쳐 기록이 남아 추적이 쉽지만 절차가 무겁습니다. Zustand는 **작은 팀 공용 화이트보드** — 그냥 바로 쓰고 지웁니다. Jotai/Recoil은 **포스트잇 여러 장** — 필요한 사람만 자기 포스트잇을 봅니다.

📌 **비교표**

| 라이브러리 | 계열 | 특징 | 보일러플레이트 | 잘 맞는 경우 |
|---|---|---|:---:|---|
| Redux Toolkit | Flux(중앙 스토어) | 예측 가능, 강력한 DevTools, 미들웨어 생태계 | 중 | 크고 복잡한 앱, 팀 규모 큼 |
| Zustand | 단순 스토어(훅 기반) | 매우 가볍고 Provider 불필요 | 매우 낮음 | 대부분의 신규 프로젝트 |
| Jotai | atomic(상향식) | atom 단위 구독, 리렌더 최소화 | 낮음 | 잘게 나뉜 파생 상태 많을 때 |
| Recoil | atomic(Meta) | atom/selector, 다만 유지보수 정체 | 낮음 | (신규 채택은 신중) |
| Context API | React 내장 | 무설치, 값 주입용 | 낮음 | 저빈도 변경 전역값(테마/유저) |

📌 **Redux의 핵심 흐름** — 단방향 데이터 흐름

```
컴포넌트 → dispatch(action) → reducer(순수함수) → 새 state → 구독 컴포넌트 리렌더
```

📌 **Zustand 예시** — Provider 없이 훅 하나로

```jsx
import { create } from "zustand";

const useCounter = create((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));

function Btn() {
  const inc = useCounter((s) => s.inc);  // 필요한 것만 선택 구독
  return <button onClick={inc}>+</button>;
}
```

> 💡 면접 포인트: "무조건 Redux"가 아니라 **"규모·팀·변경 빈도를 보고 고른다. 서버 데이터는 애초에 전역 상태에서 빼서 Query로 관리한다"**가 요즘 실무 감각입니다.

**🔥 예상 꼬리질문**
- Q. Redux는 이제 안 쓰나요? → A. 여전히 큰 앱·엔터프라이즈에서 많이 씁니다. 다만 Redux Toolkit로 보일러플레이트가 크게 줄었고, 서버 상태를 Query가 가져가면서 Redux가 맡을 범위 자체가 줄었습니다.
- Q. Zustand가 Redux보다 항상 좋나요? → A. "가볍다"는 장점이 항상 이기는 건 아닙니다. 엄격한 규칙·감사 추적·거대한 팀 협업에서는 Redux의 구조가 오히려 유리합니다. 트레이드오프입니다.
- Q. 상태 관리 라이브러리를 아예 안 쓸 수도 있나요? → A. 네. 서버 상태는 Query, 지역 상태는 useState, 소수 전역값은 Context면 충분한 앱이 꽤 많습니다.

<details><summary>📝 한 줄 요약</summary>
Redux(중앙·엄격), Zustand(경량), Jotai/Recoil(atomic) — 규모·팀에 맞춰 고르되, 서버 데이터는 전역 상태에서 빼서 Query로.
</details>

---

## D4. Context API로 전역 상태 관리하면 안 되나요? 🔴

**💬 30초 답변**
> Context는 "상태 관리 라이브러리"라기보다 **prop drilling을 피하는 값 주입(전달) 도구**입니다. 값을 트리 아래로 꽂아 주는 역할은 잘하지만, **최적화 기능이 없어서** Context 값이 바뀌면 그 값을 구독하는 모든 하위 컴포넌트가 리렌더됩니다. 그래서 테마·로그인 유저처럼 **자주 안 바뀌는 전역값**엔 좋지만, 자주 바뀌는 상태(입력값, 실시간 데이터)를 큰 트리에 Context로 뿌리면 성능 문제가 생깁니다. 그럴 땐 Zustand/Jotai처럼 **선택적 구독**이 되는 도구가 낫습니다.

**📖 핵심 개념**

🎯 **비유**: Context는 **건물 방송 스피커**입니다. 방송(값 변경)이 나가면 그 채널을 듣는 모든 층이 반응합니다. "3층에 관한 내용"만 바뀌어도 전 층이 다 깨어나는 셈이라, 방송이 잦으면 다들 피곤해집니다.

📌 **Context의 리렌더 문제**

```jsx
// value 객체가 매 렌더 새로 생성되면, 소비자 전부 리렌더
<AppContext.Provider value={{ user, setUser, theme, setTheme }}>
```
- `value`에 넣은 값 중 **하나라도** 바뀌면 `useContext(AppContext)`를 쓰는 컴포넌트가 전부 리렌더됩니다.
- Zustand의 `useStore((s) => s.count)` 같은 **선택자(selector) 기반 구독**이 없어, "나는 theme만 쓰는데 user가 바뀌어서 리렌더"되는 낭비가 생깁니다.

📌 **완화책과 한계**
- 관심사별로 Context를 **쪼개기**(UserContext, ThemeContext 분리) → 리렌더 범위 축소.
- `value`를 `useMemo`로 감싸 참조 안정화.
- 그래도 근본적으로 "부분 구독"이 안 되므로, 고빈도 변경엔 전용 라이브러리가 낫습니다.

📌 **정리: 언제 Context, 언제 라이브러리?**

| 상황 | 추천 |
|---|---|
| 테마, 언어, 로그인 유저(저빈도) | ✅ Context |
| 서버 데이터 | ✅ TanStack Query |
| 자주 바뀌는 큰 전역 클라이언트 상태 | ✅ Zustand/Jotai/Redux |

> 💡 면접 포인트: "Context = 상태관리 라이브러리"라고 답하면 감점입니다. **"Context는 전달 도구, 최적화는 별개"**를 명확히 구분하세요.

**🔥 예상 꼬리질문**
- Q. Context + useReducer면 Redux 대체 아닌가요? → A. 패턴은 흉내 낼 수 있지만 **선택적 구독·미들웨어·DevTools**가 없어 규모가 커지면 성능·디버깅에서 한계가 옵니다.
- Q. Context 리렌더를 어떻게 줄이나요? → A. Context 분리, `value` 메모이제이션, 상태와 dispatch를 별도 Context로 나누기 등이 있습니다. 근본 해결은 선택적 구독 라이브러리입니다.

<details><summary>📝 한 줄 요약</summary>
Context는 값 주입용 — 저빈도 전역값엔 좋지만, 부분 구독이 없어 고빈도 상태엔 Zustand/Jotai 등이 유리.
</details>

---

## D5. TanStack Query의 `staleTime`과 `gcTime`의 차이를 설명할 수 있나요? 🔴

**💬 30초 답변**
> `staleTime`은 **"이 데이터를 언제까지 신선(fresh)하다고 믿을지"**입니다. staleTime 안에서는 캐시를 그대로 쓰고 재요청을 안 합니다. `gcTime`(구 cacheTime)은 **"쓰는 컴포넌트가 하나도 없어진(inactive) 캐시를 메모리에서 언제 버릴지"**입니다. 즉 staleTime은 '신선도 유효기간', gcTime은 '캐시 보관 기간'입니다. 기본값은 staleTime 0(받자마자 stale), gcTime 5분입니다.

**📖 핵심 개념**

🎯 **비유**: 냉장고 속 우유입니다. `staleTime`은 **유통기한** — 기한 내엔 "믿고 그냥 마심(재요청 안 함)", 지나면 "일단 마시되 새로 사둘까 고민(백그라운드 재요청)". `gcTime`은 **아무도 안 찾는 우유를 냉장고에서 언제 버릴지** — 마지막 소비자가 사라진 뒤 카운트다운이 시작됩니다.

📌 **쿼리 상태 4단계** — 이걸 말할 수 있으면 깊이가 드러남

| 상태 | 의미 |
|---|---|
| `fresh` | staleTime 이내 — 재요청 안 함, 캐시 그대로 |
| `stale` | staleTime 경과 — 캐시는 보여주되 트리거(마운트·포커스 등) 시 백그라운드 재요청 |
| `fetching` | 실제로 네트워크 요청 중 |
| `inactive` | 이 캐시를 구독하는 컴포넌트가 0개 — gcTime 카운트다운 후 삭제 |

📌 **동작 시나리오**

```jsx
useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  staleTime: 60 * 1000,      // 1분간 fresh → 그 안엔 재요청 안 함
  gcTime: 5 * 60 * 1000,     // inactive 후 5분 뒤 캐시 폐기 (기본값)
});
```
1. 최초 요청 → 데이터 캐시에 저장, 1분간 `fresh`.
2. 30초 뒤 같은 컴포넌트 재마운트 → `fresh`라 **네트워크 요청 없이 즉시 캐시 반환**.
3. 1분 경과 → `stale`. 이제 마운트/창 포커스 시 **낡은 캐시를 즉시 보여주고 뒤에서 재요청**(SWR).
4. 이 쿼리를 쓰는 컴포넌트가 전부 언마운트 → `inactive` → 5분 후 gc.

📌 **언제 staleTime을 올리나?** 거의 안 바뀌는 데이터(국가 목록, 카테고리)는 `staleTime`을 크게(수 분~Infinity) 줘서 불필요한 재요청을 없앱니다. 반대로 실시간성이 중요하면 낮게 둡니다.

> 💡 흔한 혼동: "staleTime이 캐시 유지 시간"이라고 착각하기 쉽습니다. **staleTime = 신선하다고 믿는 시간(재요청 억제), gcTime = 캐시 메모리 보관 시간**. 둘은 독립적입니다.

**🔥 예상 꼬리질문**
- Q. staleTime이 기본 0이면 매번 요청하나요? → A. stale 상태여도 캐시는 즉시 보여줍니다. 다만 마운트·창 포커스·재연결 같은 트리거에서 백그라운드 재요청이 일어납니다. "화면은 즉시, 데이터는 최신화"가 됩니다.
- Q. cacheTime은 어디 갔나요? → A. v5에서 이름이 `gcTime`으로 바뀌었습니다. 의미가 '가비지 컬렉션 시간'이라 더 명확해졌습니다.
- Q. 창 포커스마다 재요청하는 게 부담되면? → A. `refetchOnWindowFocus: false`로 끄거나, `staleTime`을 올려 fresh 구간을 늘립니다.

<details><summary>📝 한 줄 요약</summary>
staleTime = "신선하다고 믿어 재요청을 참는 시간", gcTime = "쓰는 곳이 없어진 캐시를 버리기까지의 보관 시간". 기본 0 / 5분.
</details>

---

## D6. 캐시 무효화(invalidation) 전략을 설명할 수 있나요? 🔴

**💬 30초 답변**
> 데이터를 수정(mutation)하면 관련 캐시가 낡아지므로, `queryClient.invalidateQueries`로 해당 `queryKey`를 **stale로 표시하고 재요청**하게 만드는 게 기본 전략입니다. 예를 들어 할 일을 추가하면 `["todos"]`를 무효화해 목록을 최신화합니다. queryKey는 **배열**이라 접두사 매칭이 되기 때문에, `["todos"]`를 무효화하면 `["todos", { page: 1 }]` 같은 하위 키들도 함께 무효화됩니다. 그래서 queryKey 설계를 계층적으로 해 두면 무효화가 깔끔해집니다.

**📖 핵심 개념**

🎯 **비유**: invalidate는 게시판에 **"이 글 수정됨, 새로고침 요망" 도장**을 찍는 것입니다. 도장이 찍힌(=stale) 글을 보는 사람은 다음에 볼 때 최신본을 다시 받아옵니다.

📌 **가장 흔한 패턴 — mutation 성공 후 무효화**

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function AddTodo() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (todo) => api.post("/todos", todo),
    onSuccess: () => {
      // ["todos"] 및 그 하위 키를 stale 처리 → 자동 재요청
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
  return <button onClick={() => mutation.mutate({ text: "run" })}>추가</button>;
}
```

📌 **queryKey 계층 설계** — 무효화 범위를 키 구조로 통제

```jsx
["todos"]                       // 전체 목록
["todos", { status: "done" }]   // 필터별 목록
["todo", todoId]                // 단건 상세
// invalidateQueries({ queryKey: ["todos"] }) → 위쪽 두 개 모두 매칭(접두사)
```

📌 **무효화 vs 직접 갱신** — 상황별 선택
- `invalidateQueries`: 서버가 진실. 낡음 표시 후 재요청 → **가장 안전**, 트래픽은 소폭 증가.
- `setQueryData`: 서버 응답/알고 있는 값으로 **캐시를 직접 덮어씀** → 재요청 없이 즉시 반영(낙관적 업데이트에서 사용).
- `refetch()`: 특정 쿼리를 명시적으로 지금 다시 요청.

> 💡 면접 포인트: "수정하면 어떻게 목록을 새로고침하나요?"에 **"invalidateQueries로 관련 queryKey를 무효화한다"**를 바로 답하고, queryKey의 배열/접두사 매칭까지 곁들이면 실무 경험이 드러납니다.

**🔥 예상 꼬리질문**
- Q. 왜 queryKey를 문자열 말고 배열로 쓰나요? → A. 배열이면 `["todo", id]`처럼 **변수를 포함한 계층 키**를 만들고 접두사 단위로 무효화·관리할 수 있어서입니다. 의존성 배열처럼 키가 바뀌면 자동 재요청도 됩니다.
- Q. 무효화하면 화면이 로딩으로 깜빡이지 않나요? → A. 기존 캐시가 있으면 **그대로 보여주면서** 백그라운드로 다시 받으므로(`isFetching`은 true지만 `data`는 유지) 깜빡임이 없습니다.
- Q. 전체 캐시를 다 무효화해도 되나요? → A. `invalidateQueries()`로 전부 무효화도 가능하지만, 불필요한 대량 재요청이 나므로 **필요한 key만** 좁혀 무효화하는 게 좋습니다.

<details><summary>📝 한 줄 요약</summary>
mutation 성공 후 `invalidateQueries({ queryKey })`로 관련 캐시를 stale 처리해 재요청 — queryKey를 계층적 배열로 설계하면 접두사 매칭으로 깔끔하게 무효화.
</details>

---

## D7. 낙관적 업데이트(optimistic update)를 구현해 본 적 있나요? 🟡

**💬 30초 답변**
> 낙관적 업데이트는 **서버 응답을 기다리지 않고, 성공할 거라 가정하고 UI를 먼저 바꾸는** 기법입니다. 좋아요 버튼처럼 즉각 반응이 중요한 곳에 씁니다. TanStack Query에서는 `useMutation`의 `onMutate`에서 진행 중인 쿼리를 취소하고 캐시를 미리 수정한 뒤, **실패하면 `onError`에서 이전 값으로 롤백**하고, `onSettled`에서 무효화로 서버 기준 정합성을 맞춥니다. 핵심은 "실패 시 되돌릴 스냅샷을 미리 저장해 두는 것"입니다.

**📖 핵심 개념**

🎯 **비유**: 식당에서 주문을 말하자마자 웨이터가 **"나왔다 치고" 메뉴판에 체크**해 주는 것과 같습니다. 주방(서버)에서 품절이라고 하면(실패) 체크를 지우고(롤백) 원상복구합니다.

📌 **표준 구현 흐름**

```jsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (newTodo) => api.post("/todos", newTodo),

  onMutate: async (newTodo) => {
    // 1) 진행 중인 재요청 취소(덮어쓰기 방지)
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    // 2) 롤백용 이전 값 스냅샷
    const prev = queryClient.getQueryData(["todos"]);
    // 3) 캐시를 낙관적으로 즉시 수정
    queryClient.setQueryData(["todos"], (old) => [...old, newTodo]);
    // 4) 컨텍스트로 스냅샷 전달
    return { prev };
  },
  onError: (err, newTodo, context) => {
    // 실패 → 스냅샷으로 롤백
    queryClient.setQueryData(["todos"], context.prev);
  },
  onSettled: () => {
    // 성공/실패 무관 → 서버 기준으로 최종 동기화
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

📌 4단계 요점: **취소 → 스냅샷 → 낙관적 수정 → (실패 시 롤백) → 정합성 재검증.** `cancelQueries`를 빼먹으면, 진행 중이던 이전 요청이 나중에 도착해 낙관적 수정을 덮어쓸 수 있습니다.

> 💡 트레이드오프: UX는 빨라지지만 코드가 복잡해지고, 실패 시 화면이 잠깐 잘못 보였다 되돌아가는 어색함이 생깁니다. **실패 확률이 낮고 반응 속도가 중요한 액션**(좋아요, 체크박스, 토글)에 적합합니다.

**🔥 예상 꼬리질문**
- Q. 낙관적 업데이트를 항상 써야 하나요? → A. 아니요. 결제·중요 폼처럼 정확성이 우선이면 서버 응답을 기다리는 게 낫습니다. 되돌릴 때 사용자 혼란이 큰 액션도 지양합니다.
- Q. 롤백은 어떻게 하나요? → A. `onMutate`에서 저장한 이전 스냅샷을 `onError`에서 `setQueryData`로 되돌립니다. 그래서 onMutate가 context를 반환하는 구조가 중요합니다.
- Q. `onSettled`에서 왜 또 무효화하나요? → A. 낙관적으로 만든 값(예: 임시 id)과 서버 실제 값이 다를 수 있어, 최종적으로 서버 기준으로 맞춰 정합성을 보장하기 위함입니다.

<details><summary>📝 한 줄 요약</summary>
성공을 가정해 UI를 먼저 바꾸고(onMutate에서 스냅샷+캐시수정), 실패하면 롤백(onError), 끝나면 재검증(onSettled) — 즉각 반응이 중요한 액션에 사용.
</details>

---

## D8. TanStack Query v5에서 바뀐 점과 자주 쓰는 옵션을 아나요? 🟢

**💬 30초 답변**
> v5의 대표 변경은 **`cacheTime` → `gcTime` 이름 변경**, **`useQuery` 등이 인자를 하나의 객체로만 받도록 통일**(오버로드 제거), **status `'loading'` → `'pending'`**, **`keepPreviousData` 제거 → `placeholderData: keepPreviousData` 헬퍼로 대체**입니다. 이름이 `react-query`에서 `@tanstack/react-query`로 바뀐 것도 함께 알면 좋습니다. React뿐 아니라 Vue·Svelte·Solid도 지원해서 "TanStack Query"라는 프레임워크 중립 이름을 씁니다.

**📖 핵심 개념**

📌 **v4 → v5 주요 변경**

| 항목 | v4 | v5 |
|---|---|---|
| 캐시 폐기 옵션 | `cacheTime` | `gcTime` |
| 훅 인자 | 배열/객체 오버로드 다수 | **단일 객체 형태로 통일** |
| 로딩 status | `'loading'` | `'pending'` |
| 이전 데이터 유지 | `keepPreviousData: true` | `placeholderData: keepPreviousData`(헬퍼) |
| 첫 로딩 판별 | `isLoading` | `isPending`(또는 `isLoading = isPending && isFetching`) |

```jsx
// v5: 단일 객체 시그니처
useQuery({ queryKey: ["user", id], queryFn: () => getUser(id) });

// v5: 페이지네이션에서 이전 페이지 유지
import { keepPreviousData } from "@tanstack/react-query";
useQuery({
  queryKey: ["projects", page],
  queryFn: () => fetchProjects(page),
  placeholderData: keepPreviousData, // 페이지 전환 시 이전 데이터 잠시 유지 → 깜빡임 방지
});
```

📌 **자주 쓰는 옵션 & 플래그**
- `enabled: false` — 조건부 실행(예: `id`가 있을 때만 요청). 의존 쿼리에 필수.
- `select: (data) => ...` — 캐시 원본은 두고 **컴포넌트가 쓸 형태로 변형**(파생값).
- `retry` — 실패 재시도 횟수(기본 3, 지수 백오프).
- `refetchOnWindowFocus` / `refetchOnReconnect` — 창 포커스·네트워크 재연결 시 재요청(기본 true).
- `isPending` / `isFetching` / `isError` — 로딩 상태 구분. **isFetching은 "재요청 중 포함"**, isPending은 "아직 데이터 없음(첫 로딩)".

📌 **필수 셋업** — 앱 루트에 Provider

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  );
}
```

> 💡 `isLoading`과 `isFetching`을 헷갈리면 감점 포인트입니다. **isPending/isLoading = 캐시된 데이터가 아직 없음(최초 로딩)**, **isFetching = 백그라운드 재요청 포함 요청이 진행 중**. 새로고침 스피너와 첫 로딩 스켈레톤을 구분할 때 쓰입니다.

**🔥 예상 꼬리질문**
- Q. 의존 쿼리(dependent query)는 어떻게 하나요? → A. 앞 쿼리 결과가 있어야 뒤 쿼리를 실행할 때 `enabled: !!userId`처럼 조건을 겁니다.
- Q. select는 왜 쓰나요? → A. 캐시 원본은 공유하되 컴포넌트별로 필요한 형태(가공·필드 선택)로 변형해 **불필요한 리렌더를 줄이고** 로직을 분리할 수 있습니다.
- Q. SWR 라이브러리와 차이는? → A. 둘 다 stale-while-revalidate 기반이지만, TanStack Query가 mutation·무효화·devtools·무한스크롤 등 기능이 더 풍부하고, SWR은 더 가볍고 단순합니다.

<details><summary>📝 한 줄 요약</summary>
v5: cacheTime→gcTime, 단일 객체 인자, loading→pending, keepPreviousData→placeholderData 헬퍼. 실무 옵션은 enabled/select/retry/refetchOnWindowFocus와 isPending vs isFetching 구분.
</details>

---

## 🎯 오늘의 핵심 정리

1. **상태를 성격으로 나눠라** — 클라이언트 상태(내 소유)와 서버 상태(서버가 원본, 언제든 stale)는 다루는 문제가 다르다. 서버 상태는 전용 도구로.
2. **`useState+useEffect` 패칭의 한계** — 로딩/에러/중복/레이스/캐싱을 전부 수동 처리해야 함. TanStack Query가 선언적으로 대체.
3. **전역 상태 지형** — Redux(중앙·엄격), Zustand(경량), Jotai/Recoil(atomic), Context(값 주입·저빈도). 규모·팀·변경빈도로 선택.
4. **캐시 생명주기** — `staleTime`(신선도 유효기간, 재요청 억제) vs `gcTime`(inactive 캐시 보관 기간). fresh→stale→fetching→inactive.
5. **무효화 & 낙관적 업데이트** — mutation 후 `invalidateQueries`로 재검증, 즉각 반응이 필요하면 onMutate 스냅샷→낙관적 수정→실패 시 롤백.

> ✅ 면접 한 방 정리: **"상태를 먼저 클라이언트/서버로 나눕니다. 서버 데이터는 TanStack Query로 캐싱·재검증하고, mutation 후엔 관련 queryKey를 invalidate합니다. 남는 소수의 전역 클라이언트 상태만 Zustand나 Context로 관리합니다."**
