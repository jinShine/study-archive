오타 방지와 체계적인 캐시 주소 관리
드디어 우리 프로젝트에 TanStack Query라는 강력한 엔진이 장착되었습니다. 이제 이 엔진을 정교하게 조종하기 위해 가장 중요한 개념인 Query Key를 완벽하게 다루는 법을 배워야 합니다. 쿼리 키는 우리 데이터의 주민등록번호이자 캐시 저장소의 정확한 번지수입니다.

🏛️ 아키텍처 원칙: 스마트 물류 센터 시스템
바코드의 원칙: 엔진은 오직 바코드(키)만 보고 물건을 찾습니다. '사과'와 '사과들'은 엔진에게 완전히 다른 물건입니다.
중앙 집중 관리: 키를 여기저기 분산시키지 않고 '바코드 프린터(Factory)' 한곳에서 생성하여 오타를 물리적으로 차단합니다.
계층 구조의 힘: 뿌리(Root) 키를 통해 가지(Branch)와 잎(Leaf) 전체를 한 번에 통제(Invalidation)할 수 있는 구조를 설계합니다.
🚀 스텝 바이 스텝 가이드
Step 0. 프로젝트 환경 구축 (Vite + TS)
터미널에서 아래 명령어를 입력하여 실습 환경을 만듭니다.

npm create vite@latest qk-factory-lab -- --template react-ts
cd qk-factory-lab
npm install @tanstack/react-query @tanstack/react-query-devtools
npm run dev
Step 1. 실제 API 기반 모킹 및 타입 정의 (src/api/mockApi.ts)
실제 외부 API(JSONPlaceholder)를 호출하되, 중복 요청 확인을 위한 로그를 추가합니다.

export interface UserData {
  id: number;
  name: string;
  email: string;
}

/**
 * [원칙] 실제 외부 API 호출
 * 동일한 ID로 여러 번 호출해도 엔진이 어떻게 중복을 제거하는지 확인합니다.
 */
export const fetchUserData = async (id: number): Promise<UserData> => {
  console.log(`📡 [Network Log] 서버에서 유저 ${id} 데이터를 가져오는 중...`);
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!response.ok) throw new Error('네트워크 응답에 문제가 있습니다.');
  return response.json();
};

🧐 주목할 점:

콘솔 로그를 통해 실제로 브라우저가 서버에 몇 번의 요청을 보내는지 감시할 수 있습니다.
Step 2. 중앙 집중형 키 공장 설계 (src/queries/queryKeys.ts)
문자열 하드코딩을 방지하기 위해 모든 키를 객체로 구조화합니다.

/**
 * 1. 모든 키의 근간이 되는 '키 공장' 객체를 선언합니다.
 * 객체로 관리하면 자동 완성을 통해 오타를 물리적으로 방지할 수 있습니다.
 */
export const userKeys = {
  // 2. all: 데이터 그룹의 뿌리 (Root)
  // as const를 붙여 이 배열이 읽기 전용 리터럴 타입임을 확정 짓습니다.
  all: ['users'] as const,

  // 3. lists: 전체 목록을 위한 가지 (Branch)
  lists: () => [...userKeys.all, 'list'] as const,

  // 4. details: 상세 페이지 바구니 (Branch)
  details: () => [...userKeys.all, 'detail'] as const,

  // 5. detail: 특정 ID를 가진 단 하나의 데이터 주소 (Leaf)
  // 동적 매개변수 id를 받아 세부 번지수를 기록합니다.
  detail: (id: number) => [...userKeys.details(), id] as const,
};

🧐 주목할 점:

as const: 배열이 단순히 string[]이 아닌 정확한 리터럴 상수로 고정됩니다.
계층 구조: 상위 키를 스프레드 연산자(...)로 복사하여 논리적인 그룹을 형성합니다.
Step 3. 앱의 시작점 (src/main.tsx)
React 19 표준에 맞춰 진입점을 구성합니다.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
Step 4. 관제 센터 및 엔진 가동 (src/App.tsx)
중앙 뇌 역할을 하는 QueryClient를 생성하고 앱 전체에 주입합니다.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import UserProfile from './components/UserProfile';

// 모든 쿼리와 캐시를 관리하는 중앙 관제탑입니다.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분간 데이터를 신선하다고 믿습니다.
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '2rem' }}>
        <h1>TanStack Query 관제 센터 🛰️</h1>
        <p>Query Key Factory가 생성한 주소로 데이터를 동기화합니다.</p>
        <hr />

        {/* 테스트: 동일한 userId를 가진 컴포넌트를 두 개 배치합니다. */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <UserProfile userId={1} />
          <UserProfile userId={1} />
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
Step 5. 컴포넌트 구현 (src/components/UserProfile.tsx)
공장에서 생산된 키를 사용하여 데이터를 동기화합니다.

import { useQuery } from '@tanstack/react-query';
import { fetchUserData } from '../api/mockApi';
import { userKeys } from '../queries/queryKeys';
import type { UserData } from '../api/mockApi'; // ✅ Type-only import

export default function UserProfile({ userId }: { userId: number }) {
  // useQuery<TData, TError> 제네릭으로 타입 안정성 확보
  const { data, isPending, error } = useQuery<UserData, Error>({
    // ✨ 혁신: 문자열 하드코딩 대신 팩토리 함수 사용
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUserData(userId),
  });

  if (isPending) return <div>⌛ 엔진이 데이터를 찾는 중...</div>;
  if (error) return <div>❌ 에러 발생: {error.message}</div>;

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem' }}>
      <h4>유저 정보 (동기화됨)</h4>
      <p>이름: {data.name}</p>
      <p>이메일: {data.email}</p>
    </div>
  );
}
🧐 주목할 점:

queryKey 자리에 userKeys.detail(userId)를 적는 순간, 오타의 위험은 사라지고 계층적인 캐시 주소가 할당됩니다.
🏁 최종 테스트 케이스 (Test Cases)
1. 자동 완성 및 오타 방지 테스트

수행:UserProfile.tsx에서 queryKey를 지우고 userKeys.을 타이핑해 봅니다.
확인: 에디터가 all, lists, details, detail을 정확히 제안하는지 확인합니다.
결론: 수동 입력 시 발생하던 알파벳 's' 하나 차이의 재앙이 물리적으로 차단됩니다.
2. 네트워크 중복 제거(Deduping) 테스트

수행:App.tsx에서 동일한 userId={1}인 컴포넌트가 두 개 렌더링된 상태에서 콘솔창을 확인합니다.
확인:📡 [Network Log]가 단 한 번만 찍혔는지 확인합니다.
결론: 키 공장이 동일한 바코드를 발행했기에, 엔진은 이를 중복 요청으로 판단하고 하나의 네트워크 통신 결과를 공유합니다.
3. 캐시 계층 구조 확인 테스트

수행: 브라우저 하단의 TanStack Query Devtools(꽃 모양 아이콘)를 클릭합니다.
확인: 캐시 목록에 ["users", "detail", 1] 형태로 계층화된 주소가 생성되었는지 확인합니다.
결론: 나중에 ["users"]만 무효화(Invalidate)해도 모든 유저 관련 데이터가 한꺼번에 갱신될 수 있는 준비가 되었습니다.
