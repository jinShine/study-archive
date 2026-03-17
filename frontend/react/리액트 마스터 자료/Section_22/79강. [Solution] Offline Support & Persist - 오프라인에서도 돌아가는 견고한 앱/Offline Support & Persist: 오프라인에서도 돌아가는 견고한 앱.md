"알맹이는 박제했다, 이제 껍데기만 살리면 완벽하다"
안녕하세요! 지난 78강에서 우리는 네트워크가 끊기는 순간 앱이 얼마나 무력해지는지, 그리고 메모리에만 의존하는 캐시 시스템이 오프라인 상황에서 어떤 뼈아픈 한계를 갖는지 처절하게 확인했습니다. 사용자가 지하철에서 새로고침을 누르는 순간 모든 데이터가 증발해 버리는 그 절망적인 UX를 해결하기 위해, 오늘은 탄스택 쿼리의 꽃이라고 불리는 지속성(Persistence) 전략을 배워보겠습니다.

이 기술의 핵심은 휘발성인 메모리를 넘어 브라우저의 로컬 저장소나 세션 저장소에 쿼리 데이터를 안전하게 박제하는 데 있습니다. 이를 통해 사용자는 인터넷이 연결되지 않은 지하철 안에서도 이전에 봤던 데이터를 즉시 확인할 수 있으며, 다시 온라인이 되었을 때 앱이 마치 아무 일도 없었다는 듯 부드럽게 복구되는 마법 같은 경험을 하게 될 것입니다.

🏛️ 핵심 용어 사전: 영구적인 생명력을 위한 도구들
Persister (퍼시스터): 탄스택 쿼리 엔진과 외부 저장소를 연결해 주는 데이터 전달자입니다. 캐시된 데이터를 실시간으로 저장소에 동기화합니다.
Hydration (하이드레이션): 앱이 다시 켜질 때, 저장소에 박제된 데이터를 읽어와 엔진의 메모리를 즉시 채워주는 '수분 공급' 과정입니다.
gcTime (Garbage Collection Time): 메모리에서 데이터를 유지하는 시간입니다. 오프라인 지원을 위해 보통 24시간 정도로 길게 설정합니다.
Buster (버스터): 데이터 구조 변경 시 이전 버전의 낡은 캐시를 강제로 삭제하고 새로운 구조를 받아오게 만드는 버전 식별자이자 안전장치입니다.
⚠️ 시니어의 긴급 진단: "왜 새로고침하면 공룡이 나오나요?"
77강 코드를 적용하고도 오프라인 새로고침 시 공룡(No Internet)을 만난다면, 이는 코드 오류가 아니라 브라우저의 작동 원리 때문입니다.

우리가 한 것 (Data Caching): 서버에서 받아온 GitHub 데이터(JSON*를 저장소에 박제했습니다.
브라우저가 하는 것 (Asset Loading): 새로고침 시 브라우저는 서버에 index.html과 main.js파일 자체를 요청합니다. 하지만 오프라인이라 파일을 못 받으니 앱이 실행조차 되지 않고 공룡이 나오는 것입니다.
결론: 77강은 데이터(알맹이)를 살리는 기술입니다. 앱 자체(껍데기)까지 살려 공룡을 완전히 퇴치하려면 나중에 배울 PWA(Service Worker) 기술이 결합되어야 합니다.
🛠️ 사전 준비: 라이브러리 설치
지속성 전략 구현을 위해 두 가지 핵심 플러그인을 설치해야 합니다.

# 지속성 전략 구현을 위한 핵심 라이브러리 설치
npm install @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister

🚀 실전 랩(Lab) 구축: 새로고침에도 끄떡없는 앱 설계
1. 실제 GitHub API 정의 (src/api/userApi.ts)
export interface GitHubUser {
  id: number;
  name: string;
  bio: string;
  avatar_url: string;
}

export const fetchGitHubUser = async (username: string): Promise<GitHubUser> => {
  if (!username) throw new Error("아이디를 입력해주세요.");

  const response = await fetch(`https://api.github.com/users/${username}`);

  if (!response.ok) {
    throw new Error('유저를 찾을 수 없거나 API 요청 제한이 초과되었습니다.');
  }

  return response.json();
};

💡 코드 상세 해설:

인터페이스 정의: GitHub API 응답 규격을 정의했습니다. avatar_url을 포함하여 시각적인 데이터 복구 여부를 확인하기 쉽게 구성했습니다.
실제 fetch 사용: 네트워크 단절 시 브라우저가 던지는 실제 에러를 탄스택 쿼리가 어떻게 처리하고, 저장소에 있는 '과거의 유산'을 꺼내오는지 관찰하기 위한 설계입니다.
2. 지속성 엔진 및 퍼시스터 설정 (src/main.tsx)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import App from './App';

/**
 * [로직 1] 기본 QueryClient 생성 및 gcTime 설정
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24시간 동안 캐시 유지
      staleTime: 1000 * 60 * 5,    // 5분간 신선한 데이터로 간주
    },
  },
});

/**
 * [로직 2] 로컬 저장소 퍼시스터 정의
 */
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

/**
 * [로직 3] 지속성 및 하이드레이션 설정 (시니어의 핵심 설계)
 */
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  buster: 'v1-github-lab-2026',
  maxAge: 1000 * 60 * 60 * 24,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App queryClient={queryClient} />
  </StrictMode>
);

💡 코드 상세 해설:

gcTime: 24h: 메모리에서 데이터가 삭제되는 시간입니다. 오프라인에서는 재요청이 불가능하므로, 이 시간을 길게 잡아 캐시가 증발하는 것을 방지합니다.
localStoragePersister: 로컬 저장소는 문자열만 저장할 수 있습니다. 이 함수는 엔진의 JS 객체를 JSON 문자열로 직렬화하여 동기화하는 전달자 역할을 합니다.
persistQueryClient: 앱이 다시 켜질 때 저장소에서 데이터를 읽어와 메모리를 즉시 채워주는 하이드레이션 과정을 자동으로 수행하게 만듭니다.
buster (버스터): 실무에서 데이터 형식이 바뀌었을 때, 사용자의 로컬에 남은 낡은 데이터를 싹 지워주는 '청소기' 역할을 합니다.
3. 검색 컴포넌트 구현 (src/components/ProfileSearch.tsx)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser } from '../api/userApi';

export const ProfileSearch = () => {
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isFetching, fetchStatus, error } = useQuery({
    queryKey: ['github-user', searchQuery],
    queryFn: () => fetchGitHubUser(searchQuery),
    enabled: !!searchQuery, // 검색어가 있을 때만 실행
    staleTime: 0,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') setSearchQuery(username);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text" value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="GitHub ID 입력 (예: octocat)"
          style={{ padding: '10px', width: '200px', marginRight: '10px' }}
        />
        <button onClick={() => setSearchQuery(username)} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          검색
        </button>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'left', marginBottom: '10px' }}>
        <p><strong>엔진 상태 (fetchStatus):</strong> {fetchStatus}</p>
        <p><strong>통신 여부 (isFetching):</strong> {isFetching ? '🔄 요청 중...' : '✅ 대기 중'}</p>
        {error && <p style={{ color: 'red' }}>⚠️ 에러: {(error as Error).message}</p>}
      </div>

      {isFetching ? <p>데이터를 가져오는 중...</p> : data && (
        <div style={{ marginTop: '20px' }}>
          <img src={data.avatar_url} alt="avatar" style={{ width: '80px', borderRadius: '50%' }} />
          <h3>{data.name}</h3>
          <p>{data.bio}</p>
        </div>
      )}
    </div>
  );
};

💡 코드 상세 해설:

enabled: !!searchQuery: [검색] 버튼을 눌러 상태가 업데이트될 때만 엔진이 동작하도록 방어막을 쳤습니다.
실시간 모니터링:fetchStatus를 노출하여 오프라인 시 엔진이 어떻게 '일시 정지(paused)' 되는지 실시간으로 관찰할 수 있게 했습니다.
🌍 실무 응용 케이스: 이 기술은 언제 쓰나요?
금융/주식 앱: 사용자가 지하철에서 계좌 잔액을 확인하려 할 때, 네트워크가 끊겨도 '방금 전까지의 잔액'을 보여주고 "연결 시 자동 업데이트됩니다"라는 메시지를 띄워 불안감을 해소합니다.
커머스 장바구니: 인터넷이 불안정한 상황에서 장바구니에 담긴 물건 리스트가 갑자기 사라지면 결제 의지가 꺾입니다. 지속성 전략을 통해 담아둔 목록을 오프라인에서도 유지합니다.
뉴스/콘텐츠 리더: 한 번 읽어온 기사 목록은 로컬에 박제하여, 비행기 모드에서도 이미 로드된 기사는 끊김 없이 읽을 수 있게 합니다.
긴 양식 작성(Draft): 긴 설문조사나 게시글 작성 중 실수로 페이지를 나갔거나 인터넷이 끊겨도, 작성 중이던 임시 데이터를 로컬 저장소에서 복구하여 허무함을 방지합니다.
🏁 최종 테스트: "공룡을 보지 않고" 성공 확인하기
온라인 검색:octocat을 검색합니다. (데이터가 저장소에 박제됩니다.)
데이터 확인: 개발자 도구 -> Application 탭 -> Local Storage를 보세요. REACT_QUERY_OFFLINE_CACHE 키로 데이터가 들어있다면 성공입니다!
오프라인 상황 재현: 탭을 닫지 말고 Offline으로 바꾼 뒤, 인풋에 다시 octocat을 치고 검색 버튼을 누르세요.
마법 확인: 서버에 가지 않았는데도, 저장소에서 데이터를 꺼내와 즉시 화면을 채우는 것을 볼 수 있습니다.
🧐 실습 관전 포인트: 시니어의 시선
1. 하이드레이션(Hydration)의 속도
오프라인 복구는 서버 통신이 없으므로 온라인보다 빠릅니다. 이것이 사용자가 느끼는 '견고한 UX'의 실체입니다.

2. 저장소 용량과 보안
localStorage는 5MB 제한이 있고 보안에 취약합니다. 시니어는 민감한 개인정보나 너무 큰 데이터는 박제하지 않는 전략적 선택을 합니다.

한 줄 결론: 79강을 통해 우리는 '알맹이(Data)'를 살려냈습니다. 이제 새로고침 시에도 공룡이 나오지 않게 '껍데기(App)'까지 살리는 법(PWA)만 배우면 여러분의 앱은 무적이 됩니다.

