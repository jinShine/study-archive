"서버는 재료를 보내고, 프론트엔드는 요리를 한다"
지난 74, 75강을 통해 우리는 화면 깜빡임을 막아냈습니다. 이제 우리 앱의 UI는 겉보기엔 평화롭지만, 코드의 실상을 들여다보면 또 다른 비효율이 우리를 괴롭히고 있습니다. 바로 서버에서 보내주는 '투박하고 거대한 날것의 데이터(Raw Data)'입니다. 서버는 보통 범용적인 목적을 위해 모든 정보를 다 넣어 보내주지만, 정작 우리 컴포넌트에 필요한 건 그중 아주 일부일 뿐이죠. 오늘은 서버 데이터를 컴포넌트가 먹기 좋게 요리하는 셰프의 기술, select 옵션을 파헤쳐 보겠습니다.

🏛️ 핵심 용어 사전: select가 낯선 당신을 위해
본격적인 실습에 앞서, 시니어 개발자들이 즐겨 쓰는 용어들을 정리해 봅시다.

Raw Data (날것의 데이터): 서버 API가 응답으로 보내주는 가공되지 않은 전체 객체입니다. (예: 주소, 이메일 등이 포함된 거대한 유저 객체)
Transformation (데이터 변환): 날것의 데이터를 UI에서 쓰기 좋게 깎고 다듬는 과정입니다.
Memoization (메모이제이션): "이미 해본 연산은 기억해두자!"는 뜻입니다. select는 가공된 결과가 이전과 같다면 리액트에게 화면을 다시 그릴 필요가 없다고 말해줍니다.
TData: TanStack Query 제네릭의 세 번째 인자로, "최종적으로 요리가 끝난 데이터의 타입"을 의미합니다.
⚙️ select의 동작 방식: 엔진 내부의 흐름
컴포넌트 본문에서 직접 데이터를 가공할 때와 select를 쓸 때, 엔진의 움직임은 완전히 달라집니다.

데이터 수신: 서버에서 TQueryFnData(원본)를 받아옵니다.
셰프 투입: 데이터가 성공적으로 도착하면 엔진은 즉시 우리가 정의한 select 함수를 실행합니다.
결과 검사: 가공된 결과값이 이전 캐시와 비교했을 때 참조값이 다르거나 값이 변했는지 확인합니다.
최종 배달: 데이터가 실제로 변했다면 컴포넌트에 전달하고, 변하지 않았다면 이전 가공 데이터를 재사용하여 불필요한 리렌더링을 원천 차단합니다.
👨‍🍳 현실 비유: 소고기 도축 서버는 소 한 마리(Raw Data)를 통째로 보냅니다. 주니어는 식탁 위에서 손님(컴포넌트)이 보는 와중에 직접 고기를 썰어줍니다. 반면 시니어는 주방(select 옵션)에서 스테이크용 고기만 정교하게 발라내어 접시에 담아 보냅니다. 손님은 복잡한 과정을 알 필요 없이 맛있게 먹기만 하면 되죠.

🚀 실전 랩(Lab) 구축: 셰프의 데이터 요리법
실제로 프로젝트를 생성하여 바로 실행해 볼 수 있도록 전체 파일 구조와 코드를 구성했습니다. (오류 수정 완료)

1. 가짜 API 및 규격 정의 (src/api/userApi.ts)
/**
 * [오류 해결 포인트]
 * 반드시 interface 앞에 'export'를 붙여야 다른 파일에서 임포트할 수 있습니다.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  address: {
    city: string;
    street: string;
    zipcode: string;
  };
}

// 유저 목록을 가져오는 가짜 API (0.5초 지연)
export const fetchUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Gemini', email: 'ai@google.com', phone: '010-1234', isActive: true, address: { city: 'Seoul', street: 'Tech-ro', zipcode: '123' } },
        { id: 2, name: 'React', email: 'fb@meta.com', phone: '010-5678', isActive: false, address: { city: 'Palo Alto', street: 'Hacker Way', zipcode: '456' } },
        { id: 3, name: 'TypeScript', email: 'ms@microsoft.com', phone: '010-9999', isActive: true, address: { city: 'Redmond', street: 'One MS Way', zipcode: '789' } },
      ]);
    }, 500);
  });
};

💡 코드 상세 해설:

export interface User: 인터페이스 정의 시 export를 명시하여 모듈 외부로 공개합니다. 질문하신 에러의 핵심 원인이 바로 이 부분입니다.
Raw Data 구조: 서버가 주는 데이터(User)는 컴포넌트가 필요로 하는 것보다 훨씬 방대합니다. address나 phone 같은 필드가 그 증거입니다.
비동기 시뮬레이션:setTimeout을 통해 실제 네트워크 지연 상황을 연출했습니다. 엔진은 이 데이터가 도착한 직후에 select 로직을 가동합니다.
2. 컴포넌트 구현 (src/components/UserDisplay.tsx)
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/userApi';
import type { User } from '../api/userApi';

export const UserDisplay = () => {
  /**
   * [Case 1] 이름 목록만 추출
   * 제네릭: <User[](원본), Error, string[](가공된 타입)>
   */
  const { data: userNames } = useQuery<User[], Error, string[]>({
    queryKey: ['users', 'names'],
    queryFn: fetchUsers,
    /**
     * [셰프의 기술]
     * 서버에서 받아온 User[]를 string[]으로 변환합니다.
     * 데이터가 없을 때를 대비해 옵셔널 체이닝(?.)을 사용하는 것이 포인트!
     */
    select: (users) => users?.map((u) => u.name),
  });

  /**
   * [Case 2] 활성 유저 숫자만 추출 (어댑터 패턴)
   * 컴포넌트는 방대한 리스트를 구독하지 않고 오직 '숫자' 하나만 구독합니다.
   */
  const { data: activeCount } = useQuery<User[], Error, number>({
    queryKey: ['users', 'active-count'],
    queryFn: fetchUsers,
    select: (users) => users?.filter((u) => u.isActive).length ?? 0,
  });

  return (
    <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '12px', backgroundColor: '#fff' }}>
      <h2 style={{ color: '#007bff' }}>현재 활성 유저: {activeCount}명</h2>
      <hr />
      <h4>전체 유저 이름 리스트</h4>
      <ul style={{ lineHeight: '1.8' }}>
        {userNames?.map((name) => (
          <li key={name}><strong>{name}</strong></li>
        ))}
      </ul>
      <p style={{ fontSize: '0.8rem', color: '#888' }}>
        💡 이메일이나 주소가 바뀌어도 이름 목록이 같으면 이 컴포넌트는 리렌더링되지 않습니다.
      </p>
    </div>
  );
};

💡 코드 상세 해설:

type User 임포트: 인터페이스를 임포트할 때 import { type User } 형식을 권장합니다. 이는 번들링 시점에 런타임 코드를 줄여주는 최신 타입스크립트 기법입니다.
제네릭의 활용:useQuery<User[], Error, string[]>처럼 세 번째 자리에 최종 타입을 적어주면, data 변수의 타입이 자동으로 string[]으로 추론됩니다.
관심사의 분리: 컴포넌트 내부에서 리스트를 필터링하거나 맵핑하는 지저분한 로직이 사라졌습니다. 컴포넌트는 오직 '가공된 결과'만 받아서 보여줍니다.
불필요한 렌더링 방지: 만약 유저의 email이 바뀌어 서버 데이터가 갱신되어도, select의 결과물인 userNames 배열의 내용이 이전과 같다면 리액트 컴포넌트는 리렌더링되지 않습니다.
3. 메인 앱 조립 및 엔트리
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserDisplay } from './components/UserDisplay';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Data Transformation Lab 👨‍🍳</h1>
        <hr />
        <UserDisplay />
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

💡 코드 상세 해설:

Provider 설정:QueryClientProvider로 감싸줌으로써 UserDisplay 컴포넌트 내의 useQuery가 엔진의 메모이제이션 기능을 정상적으로 사용할 수 있게 합니다.
🔍 데이터 가공 방식 전격 비교
데이터 가공을 어디서 하느냐에 따라 서비스의 질이 갈립니다.

1. 리스트 형태로 보는 차이점

컴포넌트 본문 가공 (비권장): UI 로직 비대화, 매 리렌더링마다 가공 연산 반복, 데이터 일부 수정 시 무조건 리렌더링 유발.
select 옵션 가공 (권장): 주방과 홀의 완벽한 분리, 서버 데이터 변경 시에만 단 1회 연산, 가공 결과 불변 시 리렌더링 생략.
2. 글로 정리하는 핵심 비교

관심사의 분리:select를 쓰면 컴포넌트는 UI 구성에만 전념하고, 데이터 가공은 쿼리 엔진이 도맡아 관리합니다.
성능 최적화: 탠스택 쿼리는 select 함수의 결과값을 내부적으로 캐싱합니다. 원본 데이터가 바뀌더라도 select 결과값이 참조상 동일하다면 리액트 컴포넌트를 깨우지 않습니다.
타입 추론: 제네릭의 세 번째 인자(TData)를 통해 가공 후의 타입을 명시함으로써, 개발 중 타입 오류를 사전에 방지할 수 있습니다.
🏁 최종 테스트 케이스: 성공 여부 판단
에러 해결 확인: 더 이상 SyntaxError가 발생하지 않고 화면이 정상적으로 렌더링되나요?
관심사 분리: 컴포넌트 내부에 .map(), .filter() 같은 데이터 조작 로직이 사라졌나요?
성능 최적화: 서버 응답 중 컴포넌트가 안 쓰는 필드(예: 이메일)만 수정되었을 때, 컴포넌트가 리렌더링되지 않고 정적 상태를 유지하나요?
