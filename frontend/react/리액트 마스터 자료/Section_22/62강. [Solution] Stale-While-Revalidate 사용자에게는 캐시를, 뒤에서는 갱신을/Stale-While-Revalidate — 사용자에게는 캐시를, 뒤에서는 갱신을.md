# 62강. Stale-While-Revalidate — 사용자에게는 캐시를, 뒤에서는 갱신을

## 도입

61강에서 동일 데이터를 5개 컴포넌트에서 호출하면 5번의 네트워크 요청이 발생하는 문제를 살펴봤습니다. TanStack Query는 **Stale-While-Revalidate(SWR)** 전략으로 이 문제를 근본적으로 해결합니다. "사용자에게는 즉시 캐시된 데이터를 보여주고, 뒤에서 조용히 최신 데이터를 가져온다" — 이것이 SWR의 핵심 철학입니다.

## 개념 설명

### Stale-While-Revalidate란?

HTTP 캐시 전략에서 차용한 개념으로, TanStack Query의 핵심 동작 원리입니다.

1. **캐시 우선 응답**: 동일한 `queryKey`로 요청하면, 캐시에 데이터가 있으면 즉시 반환합니다.
2. **자동 중복 제거**: 같은 `queryKey`로 동시에 3개 컴포넌트가 요청해도 **네트워크 요청은 1번만** 발생합니다.
3. **백그라운드 갱신**: 캐시된 데이터가 `stale`(오래된) 상태가 되면, 백그라운드에서 자동으로 최신 데이터를 가져옵니다.

### 핵심 옵션

| 옵션 | 역할 | 비유 |
|------|------|------|
| `staleTime` | 데이터의 '신선도 유지 기간' | 우유의 유통기한 |
| `gcTime` | 사용하지 않는 캐시의 '보관 기간' | 냉장고 보관 기한 |
| `queryKey` | 캐시 주소 (바코드) | 택배 송장번호 |

## 코드 예제

### Query Key Factory 패턴

```ts
// src/queries/queryKeys.ts
export const userKeys = {
  all: ['users'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};
```

### API 함수

```ts
// src/api/mockApi.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

let callCount = 0;

export const fetchUserById = async (id: number): Promise<User> => {
  callCount++;
  console.log(`📡 [Network Log] 서버 요청 발생! (ID: ${id}, 총 호출 횟수: ${callCount})`);

  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!response.ok) throw new Error('서버 응답이 원활하지 않습니다.');
  return response.json();
};
```

### 컴포넌트에서 SWR 적용

```tsx
// src/components/UserProfile.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '../api/mockApi';
import { userKeys } from '../queries/queryKeys';

export default function UserProfile({ userId }: { userId: number }) {
  const { data, isPending, error } = useQuery<User, Error>({
    // 1. 바코드(Key): 중복 요청을 걸러내는 식별자
    queryKey: userKeys.detail(userId),

    // 2. 지침서(Fn): 실제로 어떻게 가져올 것인가?
    queryFn: () => fetchUserById(userId),

    // 3. 신선도(staleTime): 5분간은 '신선함'을 보장 (추가 요청 방지)
    staleTime: 1000 * 60 * 5,

    // 4. 보관소(gcTime): 안 쓰는 데이터도 10분간 메모리에 유지
    gcTime: 1000 * 60 * 10,
  });

  if (isPending) return <div>⌛ 엔진이 데이터를 동기화 중...</div>;
  if (error) return <div>❌ 에러: {error.message}</div>;

  return (
    <div>
      <h4>👤 {data.name}</h4>
      <p>📧 {data.email}</p>
    </div>
  );
}
```

### App에서 동일 데이터 3회 렌더링

```tsx
// src/App.tsx
<QueryClientProvider client={queryClient}>
  {/* 3개 컴포넌트가 같은 userId=1을 요청하지만, 네트워크 요청은 1번만 발생 */}
  <UserProfile userId={1} />
  <UserProfile userId={1} />
  <UserProfile userId={1} />
</QueryClientProvider>
```

## 코드 해설

| 코드 | 역할 |
|------|------|
| `queryKey: userKeys.detail(userId)` | 캐시 주소를 계층적으로 설계하여 오타 방지 및 체계적 관리 |
| `staleTime: 1000 * 60 * 5` | 5분간 데이터를 'fresh'로 유지 — 이 기간 동안은 재요청 없음 |
| `gcTime: 1000 * 60 * 10` | 컴포넌트가 언마운트된 후에도 10분간 캐시를 메모리에 보관 |
| `callCount++` 로깅 | 실제 네트워크 요청 횟수를 추적하여 중복 제거를 증명 |

## 실무 비유

> **관제 센터 비유**: TanStack Query는 '지능형 관제 센터'입니다. 3개의 부서(컴포넌트)가 동시에 같은 보고서를 요청하면, 관제 센터는 1번만 현장(서버)에 조사관을 보내고 결과를 3개 부서 모두에 배포합니다. 보고서가 5분(staleTime) 이내면 "아직 유효합니다"라고 캐시된 복사본을 즉시 건네주고, 5분이 지나면 백그라운드에서 조용히 새 보고서를 받아옵니다.

## 핵심 포인트

- SWR 전략: **캐시 데이터 즉시 제공 → 백그라운드에서 갱신** — 사용자는 로딩을 거의 못 느낌
- 동일 `queryKey`로 여러 컴포넌트가 동시 호출해도 **네트워크 요청은 1번만 발생** (자동 중복 제거)
- `staleTime`으로 '신선도', `gcTime`으로 '보관 기간'을 세밀하게 제어
- Query Key Factory 패턴으로 캐시 키를 체계적으로 관리하면 유지보수가 쉬워짐

## 자가 점검

- [ ] 3개 컴포넌트가 동일 `queryKey`로 요청할 때 콘솔에 네트워크 로그가 1번만 찍히는지 확인했나요?
- [ ] `staleTime`과 `gcTime`의 차이를 설명할 수 있나요?
- [ ] Stale-While-Revalidate가 사용자 경험(UX)을 어떻게 개선하는지 이해했나요?
- [ ] Query Key Factory 패턴의 장점(오타 방지, 계층적 관리)을 이해했나요?
