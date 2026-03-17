"새 데이터가 올 때까지, 이전 데이터는 자리를 비우지 않는다"
이 기술의 핵심은 새로운 데이터를 가져오는 동안 이전 데이터를 화면에 '대역(Stand-in)'으로 세워두는 것입니다. 사용자는 검색어를 입력하는 동안 리스트가 사라지는 대신, 부드럽게 최신 데이터로 교체되는 경험을 하게 됩니다.

🏛️ 아키텍처 원칙: 대역 데이터와 상태의 재정의
시각적 연속성 유지:keepPreviousData 함수를 사용하면 엔진은 새로운 데이터가 도착하기 전까지 이전 캐시를 화면에서 치우지 않습니다.
레이아웃 고정: 데이터 교체 시 리스트의 높이가 변하지 않도록 minHeight를 설정하여 하단 UI가 밀려 올라오는 불쾌한 경험을 차단합니다.
상태값의 재해석: 대역 데이터가 존재하는 동안 엔진의 상태값이 평소와 다르게 작동하므로, 이를 정확히 이해하고 UI 피드백을 설계해야 합니다.
🚀 실전 랩(Lab) 구축: 끊김 없는 검색 시스템
실제로 프로젝트를 생성하여 바로 실행해 볼 수 있도록 파일 구조와 전체 코드를 상세히 구성했습니다.

1. 가짜 검색 API 및 규격 정의 (src/api/searchApi.ts)
실제 서버 통신 상황을 가정하여 검색어에 따른 결과와 1초의 지연 시간을 설계합니다.

export interface SearchItem {
  id: number;
  title: string;
}

/**
 * 서버 검색 시뮬레이션 (의도적인 1초 지연)
 */
export const fetchSearchResults = async (query: string): Promise<SearchItem[]> => {
  return new Promise((resolve) => {
    // 깜빡임 현상을 극명하게 관찰하기 위해 1초의 딜레이를 줍니다.
    setTimeout(() => {
      if (!query) return resolve([]);

      // 검색어를 포함한 가짜 결과를 생성하여 데이터 교체를 시뮬레이션합니다.
      const results = Array.from({ length: 5 }, (_, i) => ({
        id: Math.random(), // 쿼리마다 새로운 ID를 생성해 캐시 교체를 명확히 보여줍니다.
        title: `'${query}'에 대한 검색 결과 ${i + 1}`
      }));
      resolve(results);
    }, 1000);
  });
};

💡 코드 상세 해설:

지연 시간(Latency): 1초의 지연은 실제 서비스에서 네트워크가 불안정하거나 서버 연산이 길어지는 상황을 대변합니다. 이 시간 동안 화면이 비워지느냐, 이전 데이터가 자리를 지켜주느냐가 시니어의 디테일입니다.
동적 데이터 생성: 검색어(query)를 기반으로 결과를 생성하여 쿼리 키가 변할 때마다 데이터가 실제로 교체되는지 확인하기 위한 설계입니다.
2. 검색 리스트 엔진 구현 (src/components/SearchList.tsx)
TanStack Query v5 전용 함수인 keepPreviousData와 isPlaceholderData 신호를 활용한 핵심 로직입니다.

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResults } from '../api/searchApi';
import type { SearchItem } from '../api/searchApi';

export default function SearchList() {
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * 쿼리 키를 ['search', searchTerm]으로 구성하여 검색어 변화를 추적합니다.
   * 이 키가 바뀔 때마다 엔진은 새로운 데이터를 요청하게 됩니다.
   */
  const { data, isPlaceholderData, isFetching, isLoading, isError } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => fetchSearchResults(searchTerm),
    /**
     * ✅ 시니어의 한 수: placeholderData
     * keepPreviousData를 연결하면 새로운 데이터가 성공할 때까지
     * 이전 데이터를 캐시에 유지하여 화면 깜빡임을 원천 봉쇄합니다.
     */
    placeholderData: keepPreviousData,
  });

  // 실무적 팁: 검색어가 비어있을 때는 이전 데이터를 보여주지 않고 깔끔하게 초기화합니다.
  const displayData = searchTerm === "" ? [] : data;

  /**
   * [에러 핸들링] 대역 데이터를 유지하던 중 요청이 실패하면,
   * 엔진은 데이터를 비우고 isError를 true로 바꿉니다.
   */
  if (isError) return <div style={{ color: 'red', padding: '10px' }}>검색 결과를 불러오는 데 실패했습니다.</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="검색어를 입력하세요..."
        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', marginBottom: '20px' }}
      />

      <div style={{ position: 'relative', minHeight: '250px', backgroundColor: '#f9f9f9', padding: '10px' }}>
        {/**
         * 💡 isLoading이 false이므로 리스트 전체를 숨기지 않습니다.
         * minHeight를 고정하여 데이터 교체 시 레이아웃 흔들림을 방지합니다.
         */}
        <ul style={{
          opacity: isPlaceholderData ? 0.5 : 1, // 대역 데이터일 때 투명도를 조절합니다.
          transition: 'opacity 0.2s ease-in-out',
          padding: 0,
          listStyle: 'none'
        }}>
          {displayData?.map((item: SearchItem) => (
            <li key={item.id} style={{
              padding: '12px',
              borderBottom: '1px solid #eee',
              color: isPlaceholderData ? '#999' : '#333'
            }}>
              {item.title}
            </li>
          ))}
        </ul>

        {/* 🛰️ 이제 스피너는 isLoading이 아니라 백그라운드 업데이트 상태인 isFetching에 연결합니다. */}
        {isFetching && (
          <div style={{ marginTop: '15px', color: '#007bff', fontSize: '0.9rem', fontWeight: 'bold' }}>
            🛰️ 최신 데이터를 업데이트 중입니다...
          </div>
        )}

        {/* 최초 로딩 시(데이터가 아예 없을 때)에만 전체 화면 처리를 수행합니다. */}
        {isLoading && searchTerm !== "" && (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>초기 데이터를 가져오는 중...</div>
        )}
      </div>
    </div>
  );
}

💡 코드 상세 해설:

keepPreviousData: 새로운 요청이 진행되는 동안 data가 undefined로 변하는 것을 꽉 잡아주는 안전장치입니다.
isPlaceholderData: 현재 화면 데이터가 '진짜 최신'인지 아니면 잠시 빌려온 '대역'인지 알려주는 신호등입니다. 이를 통해 투명도를 조절하면 사용자는 앱이 멈춘 것이 아니라 로딩 중임을 직관적으로 알게 됩니다.
minHeight 설정: 데이터 개수가 변할 때 하단 UI가 위아래로 널뛰기하는 것을 물리적으로 방어하는 핵심 CSS입니다.
3. 메인 앱 조립 및 엔트리 (src/App.tsx & src/main.tsx)
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchList from './components/SearchList';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Search UX Lab 🛰️</h1>
        <p>검색어가 바뀌어도 화면이 하얗게 비워지지 않는 <strong>끊김 없는 UX</strong>를 체험하세요.</p>
        <hr />
        <SearchList />
      </main>
    </QueryClientProvider>
  );
}

// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

🔍 기술 심층 분석: 상태 변수의 변화
placeholderData: keepPreviousData 전략을 사용하면 엔진 내부의 상태값들이 평소와 다르게 작동합니다. 이를 정확히 이해해야 의도치 않은 UX 실수를 막을 수 있습니다.

isLoading (첫 진입 신호): 쿼리 키가 바뀔 때마다 true가 되던 평소와 달리, 데이터가 아예 없는 **최초 1회만 true*가 됩니다. 대역 데이터가 있다면 계속 false를 유지합니다.
isFetching (통신 중 신호): 키가 바뀔 때마다 매번 true가 됩니다. 사용자에게 "업데이트 중"임을 알리는 인디케이터로 쓰기에 가장 적합합니다.
isPlaceholderData (대역 신호): 현재 화면 데이터가 새 쿼리 키의 결과물이 아니라, 이전 쿼리 키의 '대역'일 때만 true가 됩니다. 시각적 트랜지션을 주기에 완벽한 신호입니다.
🏁 최종 테스트 케이스: 끊김 없는 UX 확인
깜빡임 제거 확인: 검색어를 한 글자씩 입력해 보세요. 리스트 영역이 하얗게 비워지며 전체 레이아웃이 출렁이는 순간이 단 0.1초라도 있는지 관찰하세요.
데이터 연속성 테스트: 새로운 검색 결과가 도착하기 전까지 이전 결과가 화면에 '흐릿하게' 남아있는지 확인하세요.
인지 부하 감소:isPlaceholderData의 시각적 힌트 덕분에 화면이 멈춘 것인지 로딩 중인지 헷갈리지 않는지 체크하세요.
