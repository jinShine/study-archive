"최고의 로딩 UI는 로딩 UI가 없는 것이다"
프리페칭(Prefetching)이란 데이터를 '미리(Pre)' '가져오는(Fetch)' 기법입니다. 우리가 유튜브나 인스타그램을 할 때 로딩을 거의 느끼지 못하는 이유는 앱이 우리가 보고 있는 콘텐츠 바로 아래의 데이터를 백그라운드에서 미리 받아두기 때문입니다. 탄스택 쿼리에서는 이를 명령형 호출과 가시성 기반 트리거라는 두 가지 방식으로 정교하게 구현합니다.
🚀 실전 랩(Lab) 구축: 로딩 없는 UX 시나리오
이번 실습에서는 사용자가 게시글 제목에 마우스를 올리면 상세 내용을 미리 가져오고, 리스트 바닥에 닿기 전 미리 다음 페이지를 예약 구매하는 시나리오를 완성해 보겠습니다.

Step 1. 가짜 API 정의 (src/api/mockApi.ts)
export interface Post {
  id: number;
  title: string;
  body: string;
}

// 상세 데이터 요청 (0.5초 지연)
export const fetchPostById = async (id: number): Promise<Post> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: `${id}번째 글 상세 제목`,
        body: `이 내용은 ${id}번 글의 상세 본문입니다. 프리페칭 덕분에 로딩 없이 보입니다.`
      });
    }, 500);
  });
};

// 무한 리스트 요청 (0.5초 지연)
export const fetchPosts = async (page: number) => {
  return new Promise<{ posts: Post[]; nextCursor: number | undefined }>((resolve) => {
    setTimeout(() => {
      const posts = Array.from({ length: 10 }, (_, i) => ({
        id: page * 10 + i + 1,
        title: `${page * 10 + i + 1}번째 게시글 제목`,
        body: ""
      }));
      resolve({ posts, nextCursor: page < 5 ? page + 1 : undefined });
    }, 500);
  });
};

💡 코드 상세 해설:

비동기 시뮬레이션:setTimeout을 사용하여 실제 네트워크 통신에서 발생하는 0.5초의 지연 시간을 재현했습니다. 이 지연 시간 덕분에 프리페칭이 없을 때와 있을 때의 차이를 명확히 느낄 수 있습니다.
데이터 구조: 상세 데이터(fetchPostById)와 목록 데이터(fetchPosts)를 분리하여 설계했습니다. 목록에서는 본문(body)을 비워두어 상세 페이지 진입 시 추가 데이터를 가져와야 하는 상황을 연출했습니다.
Step 2. 메인 엔트리 및 앱 설정 (src/main.tsx & src/App.tsx)
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);

// src/App.tsx
import { useState } from 'react';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';

export default function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Prefetching Lab 🛰️</h1>
      <hr />
      {selectedId ? (
        <PostDetail id={selectedId} onBack={() => setSelectedId(null)} />
      ) : (
        <PostList onSelect={setSelectedId} />
      )}
    </main>
  );
}

💡 코드 상세 해설:

QueryClientProvider: 앱 최상단에 엔진의 지능을 주입합니다. 모든 컴포넌트가 하나의 캐시 저장소를 공유하게 됩니다.
조건부 렌더링:selectedId 상태에 따라 목록 뷰와 상세 뷰를 전환합니다. 시나리오상 목록에서 프리페칭된 데이터가 상세 뷰 진입 시 어떻게 즉시 나타나는지 확인하는 용도입니다.
Step 3. 리스트 및 프리페칭 컴포넌트 (src/components/PostList.tsx)
여기에 마우스 호버 시 상세 데이터 프리페칭과 무한 스크롤 선제적 대응 로직이 모두 담겨 있습니다.

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { fetchPosts, fetchPostById } from '../api/mockApi';
import type { Post } from '../api/mockApi';

export default function PostList({ onSelect }: { onSelect: (id: number) => void }) {
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam as number),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  // [상황 1] 마우스 호버 프리페칭
  const handleMouseEnter = async (id: number) => {
    await queryClient.prefetchQuery({
      queryKey: ['post', id],
      queryFn: () => fetchPostById(id),
      staleTime: 1000 * 60 * 5,
    });
  };

  // [상황 2] 선제적 무한 스크롤 트리거
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {allPosts.map((post) => (
          <li
            key={post.id}
            onMouseEnter={() => handleMouseEnter(post.id)}
            onClick={() => onSelect(post.id)}
            style={{ padding: '1rem', border: '1px solid #eee', marginBottom: '0.5rem', cursor: 'pointer', borderRadius: '8px' }}
          >
            <strong>{post.id}. {post.title}</strong>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>마우스를 올리면 미리 가져옵니다</div>
          </li>
        ))}
      </ul>
      <div ref={loadMoreRef} style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isFetchingNextPage && '🛰️ 발바닥이 닿기 전 다음 데이터를 당겨오는 중...'}
      </div>
    </div>
  );
}

💡 코드 상세 해설:

handleMouseEnter: 사용자가 클릭하기 전 약 100~300ms의 호버 시간을 활용하여 prefetchQuery를 실행합니다. 여기서 staleTime: 5분 설정이 가장 핵심인데, 이 시간이 설정되어야만 상세 페이지 진입 시 엔진이 데이터를 다시 요청하지 않고 캐시를 즉시 반환합니다.
Intersection Observer: 리스트 하단의 loadMoreRef를 감시합니다. 사용자가 바닥에 완전히 닿기 전(threshold: 0.1)에 미리 fetchNextPage를 당김으로써 로딩 스피너를 볼 틈도 없이 데이터를 이어 붙입니다.
flatMap: 70강에서 배운 대로 이중 구조의 pages 데이터를 단일 리스트로 펼쳐 렌더링합니다.
Step 4. 상세 페이지 컴포넌트 (src/components/PostDetail.tsx)
import { useQuery } from '@tanstack/react-query';
import { fetchPostById } from '../api/mockApi';
import type { Post } from '../api/mockApi';

export default function PostDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPostById(id),
  });

  if (isLoading) return <div style={{ padding: '2rem' }}>⌛ 프리페칭 실패 시 보이는 로딩 화면...</div>;

  return (
    <div style={{ padding: '1rem', border: '2px solid #007bff', borderRadius: '12px', backgroundColor: '#f0f7ff' }}>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← 목록으로 돌아가기</button>
      <h2 style={{ color: '#007bff' }}>{post?.title}</h2>
      <p style={{ lineHeight: '1.6' }}>{post?.body}</p>
      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#555' }}>
        💡 이 화면은 프리페칭 덕분에 로딩 없이 즉시 렌더링되었습니다.
      </div>
    </div>
  );
}

💡 코드 상세 해설:

useQuery 캐시 히트: 목록에서 이미 동일한 ['post', id] 키로 데이터를 프리페칭했다면, 상세 페이지의 useQuery는 isLoading을 거치지 않고 메모리에서 데이터를 즉시 꺼내 화면에 그립니다.
UX의 연속성: 사용자는 페이지 이동 시 발생하는 지연 시간을 전혀 느끼지 못하게 되며, 이는 서비스의 완성도를 비약적으로 높여줍니다.
🔍 시니어의 기술 용어 및 디테일 해설
Prefetching (프리페칭): 사용자가 특정 데이터를 필요로 하기 직전에 백그라운드에서 미리 캐시를 채우는 전략입니다.
staleTime (신선도 유지 시간): 프리페칭의 생명줄입니다. 이 값이 0이면 프리페칭으로 데이터를 가져오더라도 실제 진입 시 엔진이 "낡은 데이터"로 간주하여 서버를 다시 찌릅니다. 반드시 넉넉한 시간(예: 5분)을 부여해야 합니다.
Intersection Observer: 브라우저 뷰포트와 특정 요소의 교차 지점을 관찰하는 기술입니다. 스크롤 바닥에 닿기 전 선제적 가시성 트리거를 당기기 위한 표준 도구입니다.
🏛️ 아키텍처 원칙: 사용자의 의도를 읽는 설계
자원 효율성의 균형: 무조건 미리 가져오는 것이 능사는 아닙니다. 사용자가 보지도 않을 데이터를 무한정 프리페칭하는 것은 서버 비용 증가와 사용자의 데이터 낭비를 초래합니다. "꼭 클릭할 것 같은 찰나(Hover)"를 잡는 것이 실력입니다.
Race Condition 방어: 탄스택 쿼리 엔진은 동일한 키에 대해 이미 프리페칭이 진행 중일 때 사용자가 클릭을 하면, 새로운 요청을 보내지 않고 기존 요청을 재사용합니다. 즉, 중복 요청을 엔진이 알아서 합쳐줍니다.
🏁 최종 테스트 케이스: 성공 여부 판단
로딩 스피너 실종: 상세 페이지 진입 시 '로딩 중...' 메시지가 단 1초도 나오지 않고 본문이 즉시 뜬다면 성공입니다.
네트워크 탭 선행 관찰: 리스트에서 제목 위에 마우스를 올리는 순간, 개발자 도구의 Network 탭에 이미 해당 ID의 데이터 요청이 완료되어 있는지 확인하세요.
스크롤 연속성: 리스트 바닥에 닿기 약 200px 전 지점에서 이미 다음 페이지 데이터가 도착하여, 스크롤이 끊기지 않고 계속 이어지는지 확인하세요.
