"데이터가 바뀌는 찰나, UI는 요동친다"
이 현상의 핵심은 쿼리 키(queryKey)가 변경되는 순간, TanStack Query 엔진이 기존 데이터를 버리고 새로운 데이터를 기다리는 '데이터 공백기'를 갖는다는 점입니다. 이 찰나의 순간에 리스트가 증발하며 사용자의 시각적 흐름을 산산조각 내는 과정을 직접 확인해 보겠습니다.

🏛️ 아키텍처 원칙: 레이아웃 이동과 인지적 부하
데이터의 증발: 새로운 검색어 입력 시 data가 즉시 undefined로 변하며 화면에서 사라집니다.
공간의 실종: 리스트가 차지하던 높이가 0이 되면서 하단 UI(푸터 등)가 위로 홱 올라오는 CLS(Cumulative Layout Shift)가 발생합니다.
사용자 경험의 단절: 1초 남짓한 로딩 스피너가 나타날 때마다 사용자는 "앱이 멈췄나?" 하는 불안감을 느끼며 시선의 갈피를 잃게 됩니다.
🚀 실전 랩(Lab) 구축: 고통 유발 시스템
깜빡임과 널뛰기 현상을 극대화하여 테스트할 수 있도록 환경을 구성했습니다.

1. 가짜 검색 API 정의 (src/api/searchApi.ts)
문제를 명확히 관찰하기 위해 1초의 인위적인 지연 시간을 설계합니다.

export interface SearchItem {
  id: number;
  title: string;
}

/**
 * 고통을 유발하기 위한 느린 서버 시뮬레이션 (1초 지연)
 */
export const fetchSearchResultsPainful = async (query: string): Promise<SearchItem[]> => {
  return new Promise((resolve) => {
    // 1초의 딜레이가 깜빡임과 레이아웃 이동을 유발하는 핵심입니다.
    setTimeout(() => {
      if (!query) return resolve([]);

      const results = Array.from({ length: 5 }, (_, i) => ({
        id: Math.random(),
        title: `'${query}'에 대한 검색 결과 ${i + 1}`
      }));
      resolve(results);
    }, 1000);
  });
};

💡 코드 상세 해설:

인위적 지연(Latency): 1초의 지연은 실제 서비스에서 네트워크가 불안정할 때 발생하는 상황을 대변합니다. 이 시간 동안 화면이 비워지는 현상이 고통의 원인이 됩니다.
랜덤 ID: 검색어가 바뀔 때마다 리스트가 완전히 새로 그려지는 것을 확인하기 위해 매번 새로운 ID를 생성합니다.
2. 고통받는 검색 리스트 구현 (src/components/SearchList.tsx)
일반적인 로딩 처리 방식(isLoading 분기)이 어떻게 UX를 망치는지 보여주는 코드입니다.

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSearchResultsPainful } from '../api/searchApi';

export default function SearchList() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ['search-pain', searchTerm],
    queryFn: () => fetchSearchResultsPainful(searchTerm),
    // ⚠️ placeholderData 옵션을 일부러 비워둡니다.
  });

  return (
    <div style={{ padding: '20px', border: '2px solid red', borderRadius: '12px' }}>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="검색어를 입력하세요..."
        style={{ width: '100%', padding: '12px', marginBottom: '20px' }}
      />

      <div style={{ position: 'relative', border: '1px solid #eee', padding: '10px' }}>
        {/**
         * 🚩 고통 포인트: isLoading일 때 리스트를 아예 지워버립니다.
         * 이로 인해 리스트의 높이가 0px가 되고 푸터가 위로 튀어 올라옵니다.
         */}
        {isLoading ? (
          <div style={{ height: '40px', textAlign: 'center' }}>⌛ 서버 응답 대기 중 (1초)...</div>
        ) : (
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {data?.map((item) => (
              <li key={item.id} style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer style={{ marginTop: '20px', padding: '10px', backgroundColor: '#333', color: '#fff' }}>
        🚩 저는 하단 푸터입니다. 리스트가 사라질 때마다 제가 위로 튀어 올라갑니다!
      </footer>
    </div>
  );
}

💡 코드 상세 해설:

조건부 렌더링의 함정:isLoading ? <Spinner /> : <List /> 방식은 데이터가 없는 찰나에 리스트 영역을 물리적으로 삭제합니다.
Layout Shift 유발: 리스트가 차지하던 약 200px의 공간이 사라지면서 그 밑에 있던 푸터가 자석처럼 위로 끌려 올라가게 됩니다.
3. 메인 앱 조립 및 엔트리 (src/App.tsx & src/main.tsx)
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchList from './components/SearchList';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1>Pain Inducer Lab 🧪</h1>
        <p>타이핑할 때마다 <strong>화면 깜빡임</strong>과 <strong>레이아웃 이동</strong>을 체험해 보세요.</p>
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

🔍 기술 심층 분석: 왜 이런 일이 일어나는가?
TanStack Query의 기본 동작 원리를 이해하면 왜 이것이 '고통'이 되는지 명확해집니다.

Query Key 변경 = Hard Reset: 사용자가 'A'에서 'AB'로 검색어를 바꾸는 순간, 엔진은 ['search', 'A']의 데이터를 버리고 ['search', 'AB']라는 새로운 캔버스를 펼칩니다.
data: undefined 상태: 새로운 요청이 서버로 날아간 사이, 컴포넌트가 가진 data는 즉시 undefined가 됩니다.
브라우저의 리플로우(Reflow): 리스트가 사라지면 브라우저는 화면의 모든 요소 위치를 다시 계산합니다. 이 과정에서 푸터가 위로 솟구치며 사용자에게 시각적 타격을 줍니다.
🏁 최종 테스트 케이스: 고통의 실체 확인
깜빡임 관찰: 검색창에 "안녕"을 한 글자씩 쳐보세요. 리스트 영역이 하얗게 변했다가 1초 뒤에 팍! 하고 나타나는 'Flickering'을 확인하세요.
레이아웃 이동 확인: 리스트가 사라질 때 검은색 푸터가 검색창 바로 밑까지 솟구쳐 올라오는지 확인하세요.
인지적 단절 체험: 1초 동안 아무것도 할 수 없는 '공백기'가 여러분의 검색 흐름을 얼마나 방해하는지 직접 느껴보세요.
오늘 우리가 마주한 이 지독한 '빈 테이블의 공백기'를 기억하세요.

