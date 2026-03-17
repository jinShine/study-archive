"데이터를 가져오는 게 아니라 서버와 동기화하는 것이다"
우리가 가장 먼저 머릿속에서 지워야 할 고정관념은 "데이터는 내 컴포넌트의 상태"라는 생각입니다. useEffect를 쓸 때는 데이터를 억지로 useState 주머니에 넣으려 했지만, 서버 데이터는 우리 소유가 아니라 잠시 빌려온 정보일 뿐입니다.

🏛️ 아키텍처 원칙: 동기화(Synchronization)
거울의 원칙: 클라이언트는 데이터를 관리하는 주체가 아니라, 서버의 데이터를 반영하는 거울이 되어야 합니다.
지능형 정수기 시스템: 우물을 파러 직접 가는 대신, 미리 물을 떠서 깨끗하게 필터링해 저장해 두었다가 버튼을 누르는 즉시 채워주는 시스템입니다.
SWR 전략 (Stale-While-Revalidate): 일단 캐시에 있는 '조금 오래된(Stale)' 데이터를 먼저 보여주고, 뒤에서 조용히 '신선한(Fresh)' 데이터를 가져와 교체하는 혁신적인 발상입니다.
🚀 스텝 바이 스텝 가이드
Step 1: 엔진 설치 및 관제 센터 설정
터미널에서 패키지를 설치하고, 앱의 진입점에 모든 쿼리와 캐시를 관리할 '중앙 뇌(QueryClient)'를 심어줍니다.

명령어:

npm install @tanstack/react-query
*파일명: src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserProfile from './components/UserProfile';

// 1. 모든 쿼리의 상태와 캐시를 관리할 '중앙 뇌'를 생성합니다.
// 컴포넌트 외부에서 생성하여 리렌더링 시마다 초기화되는 것을 방지합니다.
const queryClient = new QueryClient();

export default function App() {
  return (
    // 2. 앱 전체에 엔진 기능을 주입합니다.
    // 리액트의 Context API를 통해 하위 모든 컴포넌트가 하나의 엔진을 공유합니다.
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '20px' }}>
        <h1>TanStack Query 관제 센터 🛰️</h1>
        {/* 동일한 데이터를 쓰는 컴포넌트를 두 개 배치하여 중복 요청 제거를 테스트합니다. */}
        <UserProfile userId={1} />
        <UserProfile userId={1} />
      </div>
    </QueryClientProvider>
  );
}
Step 2: [Before] useEffect 수동 관리 방식 상세 분석
과거의 우리가 겪었던 고달픈 우물 파기 방식입니다. 왜 이 코드가 '재앙'인지 다시 한번 짚어봅시다.

*파일명: src/components/OldUserProfile.tsx
import { useState, useEffect } from 'react';
import { fetchUserData } from '../api/mockApi';
import type { UserData } from '../api/mockApi';

export default function OldUserProfile({ userId }: { userId: number }) {
  // 1. 데이터, 로딩, 에러를 위해 파편화된 상태 3개가 강제됩니다.
  const [data, setData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 2. 경쟁 상태(Race Condition) 방어용 플래그.
    // 요청 중에 컴포넌트가 사라지거나 ID가 바뀌면 이 플래그로 무시해야 합니다.
    let isCancelled = false;
    setIsLoading(true);

    fetchUserData(userId)
      .then((res: UserData) => {
        // 3. 응답이 도착했을 때 "여전히 나를 원하는가?"를 수동으로 체크합니다.
        if (!isCancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!isCancelled) setError(err);
      })
      .finally(() => {
        // 4. 로딩 종료 시점까지도 취소 여부를 따져야 하는 번거로움이 있습니다.
        if (!isCancelled) setIsLoading(false);
      });

    // 5. 클린업 함수: 언마운트 시 '청소부' 역할을 수행합니다.
    return () => { isCancelled = true; };
  }, [userId]);

  // 로딩/에러/데이터 처리를 위한 분기 로직...
}
Step 3: [After] TanStack Query 혁신 코드 상세 분석
제네릭과 선언적 코드를 활용한 2026년형 표준 방식입니다.

*파일명: src/components/UserProfile.tsx**
import { useQuery } from '@tanstack/react-query';
import { fetchUserData } from '../api/mockApi';
import type { UserData } from '../api/mockApi'; // ✅ Type-only import

export default function UserProfile({ userId }: { userId: number }) {
  /**
   * ✨ useQuery<TData, TError>
   * 제네릭을 통해 가져올 데이터(UserData)와 발생할 에러(Error)의 타입을 명시합니다.
   * 이렇게 하면 아래의 'data' 변수는 자동으로 UserData | undefined 타입을 가집니다.
   */
  const { data, isPending, error } = useQuery<UserData, Error>({
    // 1. queryKey: 엔진이 데이터를 식별할 고유한 주소(ID)입니다.
    // 배열 형태이며, userId가 바뀌면 엔진은 "주소가 바뀌었네?"라며 자동으로 다시 동기화합니다.
    queryKey: ['user', userId],

    // 2. queryFn: 실제로 서버와 통신을 담당할 '실행 대행인'입니다.
    // fetch, axios 등을 여기서 실행합니다. 경쟁 상태와 요청 취소는 엔진이 알아서 처리합니다.
    queryFn: () => fetchUserData(userId),

    // 3. staleTime (2026 실무 표준):
    // 데이터를 5분간 '신선하다(Fresh)'고 믿게 합니다.
    // 이 시간 동안은 다시 접속해도 서버에 안 가고 캐시에서 즉시 꺼내 씁니다.
    staleTime: 1000 * 60 * 5,
  });

  // 4. 선언적 UI 처리: 엔진이 알려주는 상태에 따라 화면만 그리면 됩니다.
  if (isPending) return <div>⌛ 엔진이 서버와 데이터를 동기화 중입니다...</div>;
  if (error) return <div>❌ 에러 발생: {error.message}</div>;

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', margin: '10px' }}>
      <h4>유저 정보 (실시간 동기화)</h4>
      <p>이름: {data?.name}</p>
      {/* 데이터가 캐시되어 있다면, 100개의 컴포넌트가 동시에 이 데이터를 써도 요청은 1번입니다. */}
    </div>
  );
}

🏁 최종 테스트 케이스 (Test Cases)
글 형태로 정리된 아래 시나리오를 따라 하며 '가져오기가 아닌 동기화'의 위력을 직접 확인하세요.

1. 중복 요청 제거(Deduping) 테스트

수행:App.tsx 안에 같은 userId를 가진 UserProfile을 2개 이상 배치합니다.
확인: 브라우저 개발자 도구(F12)의 Console 탭을 확인합니다.
결과: 컴포넌트는 두 개지만, 📡 [Network Log]는 단 한 번만 찍히는 것을 확인합니다. 나중에 들어온 컴포넌트가 먼저 시작된 요청의 결과를 공유받기 때문입니다.
2. 캐시 즉시성 및 SWR 테스트

수행: 데이터를 한 번 불러온 뒤, 검색 조건이나 페이지를 바꿔서 컴포넌트를 사라지게 했다가 다시 나타나게 합니다.
확인: 다시 나타날 때 로딩 스피너(isPending)가 뜨는지 확인합니다.
결과: 로딩 스피너 없이 데이터가 즉시 화면에 렌더링됩니다. 백그라운드에서는 조용히 서버와 통신해 데이터를 최신화(Revalidate)합니다.
3. 타입 안정성(Type Safety) 테스트

수행: 코드에서 data.name의 오타를 내보거나(data.nane), data 객체에 존재하지 않는 속성을 입력해 봅니다.
확인: 에디터에서 즉시 빨간 줄이 뜨며 컴파일 에러가 발생하는지 확인합니다.
결과:useQuery의 제네릭 덕분에 런타임이 아닌 코딩 시점에 모든 실수를 잡아낼 수 있습니다.
