병렬 페칭: "스테이크와 파스타를 동시에 조리하라"
Waterfall 현상은 이름 그대로 데이터가 폭포수처럼 계단식으로 하나씩 차례대로 흘러내리는 현상을 의미합니다. 쉽게 비유하자면 식당에서 음식을 주문할 때 주방장에게 "스테이크가 다 구워지면 그때 파스타 조리를 시작하세요"라고 말하는 것과 같습니다. 스테이크와 파스타를 동시에 조리하면 훨씬 빨리 식사가 준비될 텐데 굳이 하나가 끝날 때까지 다음 작업을 막아버리는 것이죠.

🏛️ 아키텍처 원칙: 직렬(Serial)에서 병렬(Parallel)로
직렬 중단 (The Problem): 리액트의 Suspense 모드에서는 컴포넌트가 실행되다가 데이터가 없으면 그 즉시 실행을 멈추고 부모에게 제어권을 던져버립니다. 따라서 여러 개의 데이터를 가져올 때 코드를 잘못 짜면 앞선 요청이 완전히 끝나야 다음 요청이 시작되는 기형적인 구조가 만들어집니다.
병렬 배칭 (The Solution):useSuspenseQueries는 여러 개의 비동기 요청을 하나의 묶음으로 처리하여 엔진이 모든 요청을 동시에 병렬로 날릴 수 있게 해줍니다.
🚀 스텝 바이 스텝 가이드: 병렬 최적화 랩(Lab) 구축
Step 1. 가짜 API 정의 (src/api/mockApi.ts)
Waterfall 현상을 시각적으로 확인하기 위해 각 API에 의도적인 지연 시간을 부여합니다.

export interface User {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
}

/**
 * 유저 데이터를 가져오는 함수 (2초 지연)
 */
export const fetchUser = async (id: number): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // ⚠️ 테스트를 위해 id가 0이면 에러 발생
      if (id === 0) reject(new Error("존재하지 않는 유저입니다."));
      resolve({ id, name: "시니어 아키텍트" });
    }, 2000);
  });
};

/**
 * 게시글 목록을 가져오는 함수 (2초 지연)
 */
export const fetchPosts = async (id: number): Promise<Post[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "첫 번째 게시글", content: "내용입니다." },
        { id: 2, title: "두 번째 게시글", content: "내용입니다." },
      ]);
    }, 2000);
  });
};

💡 코드 상세 설명:

인터페이스 정의:User와 Post 타입을 명시하여 데이터 규격을 설계합니다.
인위적 지연: 각 요청에 2초의 지연을 주었습니다. Waterfall 방식이라면 총 4초, 병렬 방식이라면 약 2초의 로딩 시간이 걸리게 됩니다.
Step 2. 메인 엔트리 (src/main.tsx)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// React 19 표준 렌더링 방식
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

Step 3. 메인 앱 설정 (src/App.tsx)
⚠️ 중요 테스트 설정: retry: false 설정을 하지 않으면 에러 발생 시 엔진이 3번 더 재시도하느라 ErrorPage가 즉시 뜨지 않고 한참(약 10초 이상) 로딩만 보일 수 있습니다.

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserAndPosts from './components/UserAndPosts';

// 테스트를 위해 retry 옵션을 꺼줍니다.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // 에러 발생 시 즉시 ErrorBoundary로 던집니다.
    },
  },
});

const GlobalSkeleton = () => <div style={{ padding: '1rem', color: '#666' }}>⌛ 모든 데이터를 병렬로 가져오는 중...</div>;
const ErrorPage = ({ error }: { error: Error }) => <div style={{ color: 'red', padding: '1rem', border: '2px solid red' }}>❌ 에러: {error.message}</div>;

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>TanStack Query Optimization Lab 🧪</h1>
        <hr />

        <ErrorBoundary fallbackRender={ErrorPage}>
          <Suspense fallback={<GlobalSkeleton />}>
            {/* ⚠️ 테스트: id를 0으로 바꾸면 즉시 ErrorPage가 나타납니다. */}
            <UserAndPosts id={1} />
          </Suspense>
        </ErrorBoundary>
      </main>
    </QueryClientProvider>
  );
}

Step 4. 최적화 컴포넌트 구현 (src/components/UserAndPosts.tsx)
import { useSuspenseQueries } from '@tanstack/react-query';
import { fetchUser, fetchPosts } from '../api/mockApi';
import type { User, Post } from '../api/mockApi'; // ✅ Type-only import

const userKeys = { detail: (id: number) => ['users', 'detail', id] as const };
const postKeys = { list: (id: number) => ['posts', 'list', id] as const };

export default function UserAndPosts({ id }: { id: number }) {
  /**
   * [Solution] useSuspenseQueries를 활용한 병렬 페칭 최적화
   * queries 배열 안에 요청들을 담아 전달하면 엔진이 이를 하나의 단위로 인식합니다.
   */
  const [userQuery, postsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: userKeys.detail(id),
        queryFn: () => fetchUser(id),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: postKeys.list(id),
        queryFn: () => fetchPosts(id),
        staleTime: 1000 * 60 * 1,
      },
    ],
  });

  /**
   * 모든 비동기 로직이 동시에 시작된 후, 모든 데이터가 준비되었을 때 리턴 문이 실행됩니다.
   * userQuery.data는 User 타입으로, postsQuery.data는 Post[] 타입으로 정확히 추론됩니다.
   */
  return (
    <section style={{ border: '2px solid #333', padding: '1rem', borderRadius: '8px' }}>
      <h2>{userQuery.data.name}님의 공간</h2>
      <h3>최신 게시글 목록</h3>
      <ul>
        {postsQuery.data.map((post) => (
          <li key={post.id}><strong>{post.title}</strong></li>
        ))}
      </ul>
    </section>
  );
}

🏁 최종 테스트 케이스: 성능 및 예외 처리 분석
수동/직렬 방식에서 선언적 병렬 방식(64강)으로 넘어왔을 때의 변화에 주목하세요.

1. 네트워크 타임라인 (F12 > Network)
Waterfall (Problem): 만약 직렬로 썼다면, fetchUser 바(Bar)가 끝나고 나서야 fetchPosts 바가 시작되는 계단 모양의 타임라인이 보입니다.
Parallel (Success):useSuspenseQueries 적용 시, 두 요청의 시작 지점이 거의 동일하게 일직선으로 정렬되는지 확인하세요.
계산: 전체 로딩 시간은 4초(2+2)가 아닌, 가장 느린 요청의 시간인 최대 2초가 되어야 성공입니다.
2. 에러 강제 발생 테스트 (id=0)
수행:App.tsx에서 id={0}으로 값을 변경합니다.
주목할 점: 만약 retry: false를 설정했다면, 2초 뒤 로딩이 끝나자마자 즉시 ErrorPage로 교체됩니다. (설정하지 않았다면 엔진이 3번 더 재시도하느라 한참 뒤에 뜹니다.)
확인: 병렬 요청 중 하나라도 에러가 발생하면 ErrorBoundary가 즉시 작동하여 전체 영역을 안전하게 격리하는지 보세요.
3. 타입스크립트 개발 경험 (DX)
수행:userQuery.data. 혹은 postsQuery.data.을 입력해 보세요.
확인: 옵셔널 체이닝(?.) 없이도 유저의 속성들이 정확히 자동 완성되는지 확인하세요. 데이터 존재가 100% 보장되는 환경을 느껴보세요.
4. 배달 사고(Race Condition) 방지
수행: 아주 빠른 속도로 ID를 여러 번 변경해 보세요.
확인: 엔진이 렌더링 타이밍을 자동으로 조절하여, 마지막으로 요청한 ID의 데이터가 화면에 정확히 남는지 확인하세요.
