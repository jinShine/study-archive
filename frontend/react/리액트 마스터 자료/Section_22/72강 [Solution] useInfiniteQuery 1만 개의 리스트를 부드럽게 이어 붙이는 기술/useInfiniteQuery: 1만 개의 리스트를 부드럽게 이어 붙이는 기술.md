"배열 노가다는 끝났다, 이제는 펼치기만 하라"
이 엔진의 가장 큰 매력은 우리가 수동으로 관리하던 모든 상태(페이지 번호, 로딩 플래그, 데이터 합치기 등)를 내부적으로 자동화해 준다는 점에 있습니다. 우리는 더 이상 [...prev, ...next]와 같은 코드를 짤 필요가 없습니다.

🏛️ 아키텍처 원칙: InfiniteData와 flatMap의 마법
TanStack Query는 무한 스크롤 데이터를 단일 배열이 아닌 InfiniteData라는 특수한 이중 구조로 관리합니다.

1. InfiniteData<TData, TPageParam>의 내부 구조
엔진은 우리가 요청한 각 페이지를 별도의 주머니에 담아 관리합니다.

pages: 각 페이지의 서버 응답 데이터가 순서대로 쌓이는 이중 배열입니다. (예: [[1~10번], [11~20번], [21~30번]])
pageParams: 각 페이지를 호출할 때 사용된 파라미터(페이지 번호나 커서)들이 기록되는 배열입니다.
2. flatMap(): 이중 배열을 평면화하는 마법
엔진이 차곡차곡 쌓아둔 주머니(pages) 안에는 개별 페이지 배열들이 들어있습니다. 하지만 리액트 UI에 그리기 위해서는 이를 하나의 긴 줄로 세워야 합니다. 이때 자바스크립트의 flatMap()을 사용하여 이중 배열을 단일 배열로 가볍게 펼쳐줍니다.

🚀 스텝 바이 스텝 가이드: 실전 API 무한 스크롤 구축
Step 1. API 및 데이터 규격 정의 (src/api/jsonPlaceholder.ts)
무료 API인 JSONPlaceholder를 사용하여 실제 네트워크 통신 환경을 구축합니다.

import axios from 'axios';

/**
 * Post 인터페이스: 개별 게시글의 규격입니다.
 * export를 통해 외부 모듈에서 이 타입을 안전하게 참조할 수 있도록 설계합니다.
 */
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

/**
 * 실제 API 호출 함수
 * JSONPlaceholder는 _page와 _limit 파라미터를 통해 페이지네이션을 지원합니다.
 */
export const fetchPosts = async (pageParam: number): Promise<Post[]> => {
  const response = await axios.get<Post[]>(
    `https://jsonplaceholder.typicode.com/posts?_page=${pageParam}&_limit=10`
  );
  // 현실적인 네트워크 지연 시뮬레이션 (0.5초)
  await new Promise((resolve) => setTimeout(resolve, 500));
  return response.data;
};

💡 코드 상세 해설:

인터페이스 설계:Post 규격을 정의하여 데이터 정합성을 확보합니다.
커서 vs 페이지: 현재는 페이지 번호를 사용하지만, 실무에서는 마지막 아이템의 ID를 이용하는 커서 방식을 더 선호합니다.
Step 2. 무한 스크롤 엔진 구현 (src/components/InfinitePostList.tsx)
useInfiniteQuery의 복잡한 제네릭과 옵션들을 시니어의 관점에서 상세히 설계해 보겠습니다.

import { useInfiniteQuery } from '@tanstack/react-query';
// ✅ InfiniteData는 타입 정보이므로 'import type'으로 가져오는 것이 안전합니다.
import type { InfiniteData } from '@tanstack/react-query';
import { fetchPosts } from '../api/jsonPlaceholder';
import type { Post } from '../api/jsonPlaceholder';

export default function InfinitePostList() {
  /**
   * useInfiniteQuery의 5가지 제네릭:
   * 1. TQueryFnData: API가 반환하는 타입 (Post[])
   * 2. TError: 에러 객체 타입 (Error)
   * 3. TData: 최종 데이터 형태 (InfiniteData<Post[], number>)
   * 4. TQueryKey: 쿼리 키 타입 (string[])
   * 5. TPageParam: 페이지 파라미터 타입 (number)
   */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<Post[], Error, InfiniteData<Post[], number>, string[], number>({
    queryKey: ['posts', 'infinite'],

    // 1. queryFn: 엔진이 관리하는 pageParam을 주입받아 API를 호출합니다.
    queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),

    // 2. getNextPageParam [두뇌]: 마지막 페이지(lastPage)를 분석해 다음 파라미터를 결정합니다.
    getNextPageParam: (lastPage, allPages) => {
      // 데이터가 존재하면 다음 페이지 번호를 반환하고, 빈 배열이면 undefined를 반환해 종료합니다.
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },

    // 3. initialPageParam [필수]: 첫 페이지를 시작할 기본값입니다.
    initialPageParam: 1,

    // 4. [Senior Point 1] maxPages (메모리 관리)
    // 최신 5 페이지만 메모리에 유지하고 나머지는 날려버려 저사양 기기의 부하를 방어합니다.
    maxPages: 5,

    // 5. [Senior Point 2] staleTime (네트워크 폭풍 방지)
    // 누적된 모든 페이지를 한꺼번에 재요청하는 대참사를 막기 위해 5분의 신선도를 부여합니다.
    staleTime: 1000 * 60 * 5,
  });

  /**
   * [The Magic of flatMap]
   * data.pages 안에 쌓인 이중 배열 주머니를 단일 리스트로 가볍게 펼쳐줍니다.
   */
  const allPosts = data?.pages.flatMap((page) => page) ?? [];

  if (status === 'pending') return <div style={{ padding: '2rem' }}>🚀 초기 데이터를 불러오는 중...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {allPosts.map((post) => (
          <li key={post.id} style={{
            padding: '1.5rem',
            borderBottom: '1px solid #eee',
            backgroundColor: '#fff',
            borderRadius: '8px',
            marginBottom: '0.5rem'
          }}>
            <strong>{post.id}. {post.title}</strong>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{post.body.substring(0, 80)}...</p>
          </li>
        ))}
      </ul>

      {/* 실무에서는 Intersection Observer를 연결하지만, 원리 파악을 위해 버튼을 사용합니다. */}
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: hasNextPage ? '#007bff' : '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: hasNextPage ? 'pointer' : 'not-allowed'
        }}
      >
        {isFetchingNextPage ? '⏳ 불러오는 중...' : hasNextPage ? '➕ 게시글 더 보기' : '🏁 마지막 페이지입니다'}
      </button>
    </div>
  );
}

💡 코드 상세 해설:

import type 사용: 타입스크립트의 타입을 임포트할 때 type 키워드를 명시하여 런타임 번들링 에러를 방지하고 최적화합니다.
getNextPageParam: 이 함수는 엔진의 나침반입니다. undefined를 반환하는 순간 hasNextPage가 false로 바뀌며 추가 요청이 중단됩니다.
flatMap():pages라는 주머니 안에 든 여러 개의 배열을 하나의 매끄러운 배열로 합쳐줍니다.
🔍 기술 심층 해설: 왜 이렇게 설계해야 하는가?
1. 왜 pages를 이중 배열로 두나요?
만약 1만 개의 데이터를 하나의 거대한 단일 배열로 관리한다면, 특정 데이터를 수정할 때마다 1만 번을 순회해야 합니다. TanStack Query는 이를 페이지 단위(주머니)로 쪼개 놓음으로써, 특정 페이지의 데이터만 정밀하게 타격하여 수정하거나 무효화할 수 있게 설계되었습니다.

2. maxPages의 실무적 가치
사용자가 스크롤을 끝없이 내려 100페이지에 도달했다고 가정합시다. maxPages: 5가 설정되어 있다면, 엔진은 메모리 효율을 위해 앞선 95페이지의 데이터를 메모리에서 제거합니다. 이는 가상 리스트(Virtual List)와 함께 사용할 때 메모리 점유율을 혁신적으로 낮춰주는 시니어의 필수 옵션입니다.

3. staleTime의 중요성
무한 스크롤은 데이터가 누적됩니다. 만약 staleTime이 0이라면, 사용자가 잠시 다른 탭을 보다가 돌아오는 순간 엔진은 지금까지 불러온 20~30개의 모든 페이지를 서버에 한꺼번에 재요청합니다. 이는 서버 마비의 원인이 될 수 있으므로 반드시 적절한 신선도를 부여해야 합니다.

🏁 최종 테스트 케이스: 성공 여부 판단
배열 자동 누적: '더 보기' 버튼을 누를 때마다 allPosts의 길이가 10개씩 정확히 늘어나는지 확인하세요.
타입 추론:allPosts.map 내부에서 post.title과 같은 속성들이 자동 완성으로 완벽하게 제안되는지 확인하세요.
종료 조건 작동: JSONPlaceholder의 마지막 데이터에 도달했을 때, 버튼이 '마지막 페이지입니다'로 바뀌며 비활성화되는지 보세요.