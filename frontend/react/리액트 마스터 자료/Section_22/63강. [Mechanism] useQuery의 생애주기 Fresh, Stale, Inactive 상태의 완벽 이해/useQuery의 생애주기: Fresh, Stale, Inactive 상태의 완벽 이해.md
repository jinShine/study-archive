Fresh, Stale, Inactive 상태의 완벽 이해
단순히 staleTime이 지나면 데이터가 상한다고 외우는 것은 하수입니다. 고수는 데이터가 상했을 때(Stale) 엔진이 어떻게 '사용자 몰래' 데이터를 최신화하는지, 그 메커니즘을 코드 레벨에서 통제합니다.

🏛️ 아키텍처 원칙: 데이터의 3대 상태
Fresh (신선한 상태): 엔진이 "이 데이터는 현재 서버 값과 100% 일치한다"고 보증하는 기간입니다. 이 상태에서는 컴포넌트가 재마운트되어도 서버 요청 없이 메모리 캐시만 즉시 반환합니다.
Stale (상한 상태) ⚠️: 데이터가 서버와 다를 수 있다고 의심받는 상태입니다. 핵심은 "일단 보여주고, 뒤에서 몰래 새것을 가져온다(SWR)"는 것입니다. 사용자가 화면을 다시 클릭할 때 백그라운드 동기화(Refetch)가 트리거됩니다.
Inactive (비활성 상태) 💤: 데이터를 쓰는 컴포넌트가 사라진 상태입니다. 이때부터 gcTime 타이머가 돌아가며, 시간이 다 되면 메모리에서 영구 삭제됩니다.
🚀 스텝 바이 스텝 가이드 및 심층 해설
Step 1. 가짜 API 및 타입 정의 (src/api/mockApi.ts)
export interface User { id: number; name: string; }

export const fetchUser = async (id: number): Promise<User> => {
  console.log(`📡 [Network Log] 서버와 데이터(ID: ${id}) 동기화 시도 중...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: "시니어 아키텍트" });
    }, 1000);
  });
};

💡 코드 상세 설명:

인터페이스 정의:User 타입을 명시하여 타입스크립트의 안정성을 확보합니다.
네트워크 로그:console.log를 통해 엔진이 '재검증(Refetch)'을 시도하는 시점을 눈으로 직접 확인할 수 있게 합니다.
인위적 지연:setTimeout으로 1초의 지연을 주었습니다. 이는 데이터가 도착하기 전까지의 isPending 상태와, 캐시가 있는 상태에서 뒤늦게 갱신되는 isFetching 상태를 시각적으로 구분하기 위함입니다.
Step 2. 쿼리 키 공장 (src/queries/queryKeys.ts)
export const userKeys = {
  all: ['users'] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
};

💡 코드 상세 설명:

Factory 패턴: 문자열을 직접 입력하는 대신 객체와 함수를 통해 키를 생성합니다.
as const: 배열을 리터럴 상수로 고정하여 타입스크립트가 정확한 키의 구조를 추론하게 돕습니다. 이를 통해 오타로 인한 캐시 불일치 사고를 원천 차단합니다.
Step 3. 메인 엔트리 (src/main.tsx)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

💡 코드 상세 설명:

React 19 표준: 최신 렌더링 API인 createRoot를 사용합니다. StrictMode는 개발 환경에서 컴포넌트의 순수성을 검사하며, 이 과정에서 useEffect 등이 두 번 실행될 수 있음을 인지해야 합니다.
Step 4. 수정본: 관제 센터 설정 - 초고속 모드 (src/App.tsx)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import LifecycleDemo from './components/LifecycleDemo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 2,
      gcTime: 1000 * 5,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>TanStack Query Lifecycle Lab 🧪 (Speed Ver.)</h1>
        <p>2초 뒤에 데이터가 상하는 것을 목격하세요!</p>
        <hr />
        <LifecycleDemo />
      </div>
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}

💡 코드 상세 설명:

Speed Test 설정: 실습을 위해 staleTime을 2초, gcTime을 5초로 매우 짧게 설정했습니다.
staleTime (2s): 데이터가 도착하고 2초가 지나면 즉시 Stale 상태로 전이되어 재검증 로직을 바로 확인할 수 있습니다.
gcTime (5s): 컴포넌트가 언마운트된 후 5초가 지나면 가비지 컬렉터가 메모리를 비우는 과정을 빠르게 관찰할 수 있습니다.
Devtools:initialIsOpen={true}를 통해 엔진 내부 상태 변화를 실시간으로 모니터링합니다.
Step 5. 생애주기 데모 컴포넌트 (src/components/LifecycleDemo.tsx)
import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../api/mockApi';
import { userKeys } from '../queries/queryKeys';
import type { User } from '../api/mockApi';

const styles = {
  container: { border: '2px solid #333', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#f8f9fa' },
  pending: { padding: '1rem', color: '#666', fontStyle: 'italic' },
  error: { color: 'red', fontWeight: 'bold' },
  fetching: { color: '#007bff', fontWeight: 'bold' },
  guide: { marginTop: '20px', fontSize: '14px', color: '#555', borderTop: '1px solid #ddd', paddingTop: '10px' }
};

export default function LifecycleDemo() {
  const { data, isPending, isFetching, error } = useQuery<User, Error>({
    queryKey: userKeys.detail(1),
    queryFn: () => fetchUser(1),
  });

  if (isPending) return <div style={styles.pending}>⌛ 최초 데이터를 가져오는 중입니다... (Pending)</div>;
  if (error) return <div style={styles.error}>❌ 에러 발생: {error.message}</div>;

  return (
    <div style={styles.container}>
      <h3>유저 이름: {data.name}</h3>

      {isFetching && (
        <p style={styles.fetching}>
          🔄 백그라운드에서 데이터를 최신화하고 있습니다... (Fetching)
        </p>
      )}

      <div style={styles.guide}>
        <p>💡 <strong>Fresh 테스트:</strong> 2초 내에 창을 다시 클릭해보세요. 아무 변화가 없습니다.</p>
        <p>💡 <strong>Stale 테스트:</strong> 2초 뒤 창을 다시 클릭하면 파란색 메시지가 나타납니다.</p>
        <p>💡 <strong>Inactive 테스트:</strong> gcTime이 지나면 데이터가 소멸됩니다.</p>
      </div>
    </div>
  );
}

💡 코드 상세 설명:

styles 객체: 컴포넌트의 시인성을 높이기 위해 스타일을 분리했습니다. fetching 상태의 파란색 텍스트는 백그라운드 동기화를 시각화하는 핵심 장치입니다.
isPending: 캐시에 데이터가 아예 없는 최초 1회만 발생합니다. 이때는 사용자에게 로딩 UI를 보여주며 대기를 유도합니다.
isFetching: 데이터의 유무와 상관없이 서버와 통신 중임을 나타냅니다. Stale 상태에서 데이터를 다시 가져올 때 isPending은 false지만 isFetching은 true가 되어 "화면은 보여주되 뒤에서 갱신 중"임을 개발자에게 알립니다.
🏁 최종 테스트 케이스 (Test Cases)
1. Fresh 상태의 자원 절약 테스트

수행: 최초 로딩이 끝난 직후, 2초가 지나기 전에 브라우저의 다른 탭을 갔다가 다시 돌아오거나 화면을 클릭합니다.
확인: 화면 하단에 파란색 'Fetching' 메시지가 나타나는지 확인합니다.
결과: 데이터가 신선하므로 엔진은 서버 요청을 보내지 않습니다. 콘솔의 네트워크 로그도 추가되지 않아야 성공입니다.
2. Stale 상태의 백그라운드 갱신 테스트

수행: 데이터를 가져온 지 2초가 지나 데이터가 Stale(노란색)로 변한 것을 Devtools에서 확인한 후, 화면을 다시 클릭합니다.
확인: 화면이 멈추는지, 아니면 파란색 isFetching 메시지만 깜빡이는지 확인합니다.
결과: 사용자 화면은 그대로 유지되면서(Zero-Loading), 뒤에서만 조용히 데이터를 최신화하면 성공입니다.
3. Inactive & gcTime 테스트

수행: 해당 컴포넌트를 보이지 않게 조작하거나 앱을 종료한 뒤 5초를 기다립니다.
확인: 5초 후 다시 해당 컴포넌트를 렌더링하여 로딩 방식을 관찰합니다.
결과: 가비지 컬렉터가 메모리를 비웠으므로, 다시 isPending 상태(최초 로딩)부터 시작해야 성공입니다.
🧪 2초 만에 끝내는 실시간 테스트 가이드
데이터의 생애주기를 초속(2s)으로 가속하여 2026년형 초고속 데이터 순환을 경험하실 수 있습니다.

Fresh -> Stale 전이 (2초의 마법)
수행: 페이지를 새로고침합니다.
관찰: Devtools의 쿼리 목록 옆 색상이 초록색(Fresh)에서 정확히 2초 뒤에 노란색(Stale)으로 변합니다.
Stale 상태에서의 백그라운드 갱신
수행: 데이터가 노란색(Stale)이 된 것을 확인한 후, 브라우저의 다른 탭을 클릭했다가 돌아오거나 바탕화면을 찍고 브라우저를 다시 클릭합니다.
확인: 화면에 파란색 🔄 백그라운드에서 데이터를 최신화하고 있습니다... 메시지가 아주 잠깐 깜빡입니다.
결과: 콘솔창에 로그가 찍히며 데이터가 다시 신선해집니다.
Inactive & gcTime (5초의 삭제)
수행: 컴포넌트를 안 보이게 하거나 페이지를 이동하면 데이터가 회색(Inactive)으로 변합니다.
확인: 5초가 지나면 Devtools 목록에서 해당 데이터가 흔적도 없이 사라집니다.
