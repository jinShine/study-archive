"비동기의 연쇄 고리를 끊어내고 질서를 세우다"
지난 시간 우리는 select 옵션을 통해 서버의 거친 데이터를 컴포넌트가 먹기 좋게 요리하는 셰프의 기술을 배웠습니다. 이제 우리의 컴포넌트는 필요한 정보만 쏙쏙 골라 먹는 똑똑한 구조를 갖추게 되었지만, 실무에는 또 다른 복잡한 퍼즐이 우리를 기다리고 있습니다. 바로 순서가 정해진 데이터 호출 상황입니다.

사용자의 프로필 정보를 먼저 가져와야만 그 안에 담긴 고유 ID를 확인하고, 그 ID를 이용해 사용자가 작성한 게시글 목록을 불러올 수 있는 경우를 들 수 있습니다. 만약 이 두 호출을 동시에 실행해 버리면 두 번째 쿼리는 ID가 없는 상태로 서버에 요청을 보냈다가 에러를 마주하게 될 것이 분명합니다. 오늘은 이러한 비동기 호출의 연쇄 고리를 완벽하게 제어하는 의존적 쿼리의 정석을 파헤쳐 보겠습니다.

🏛️ 핵심 용어 사전: 순차적 실행이 낯선 당신을 위해
본격적인 실습에 앞서, 시니어 개발자들이 엔진의 흐름을 제어할 때 즐겨 쓰는 용어들을 정리해 봅시다.

Dependent Query (의존적 쿼리): 특정 쿼리가 실행되기 위해 이전 쿼리의 결과값이 반드시 필요한 상태를 말합니다.
enabled 옵션: 비동기 호출 사이의 게이트키퍼 역할을 수행합니다. 일반적인 useQuery는 마운트 즉시 실행되지만, 이 옵션을 통해 엔진에게 "내가 신호를 줄 때까지 기다려!"라고 명령할 수 있습니다.
Waterfall (워터폴): 네트워크 탭에서 요청이 계단식으로 발생하는 현상입니다. 의존적 쿼리에서는 의도적으로 이 흐름을 만들어 데이터의 순서를 보장합니다.
Non-null assertion (!): 타입스크립트에게 "이 값은 현재 시점에 절대 비어있지 않다"라고 확신을 주는 기법입니다.
⚙️ 의존적 쿼리의 동작 방식: 엔진 내부의 흐름
enabled 옵션을 사용하면 엔진은 다음과 같은 순서로 움직이며 비동기 흐름을 제어합니다.

관찰 및 대기: 컴포넌트 마운트 직후, 두 번째 쿼리의 enabled가 false라면 엔진은 네트워크 요청을 보내지 않고 'Pending' 상태로 대기합니다.
트리거 발생: 첫 번째 쿼리가 성공하여 userId 같은 핵심 데이터가 확보되는 순간, enabled 조건이 true로 바뀝니다.
빗장 해제: 엔진은 조건 변화를 감지하고 즉시 두 번째 queryFn을 실행하여 서버로 달려갑니다.
타입 확정: 첫 번째 데이터가 존재한다는 전제하에 두 번째 쿼리가 실행되므로, 개발자는 데이터의 존재를 확신하고 로직을 전개할 수 있습니다.
👨‍🍳 현실 비유: 출입국 심사대 첫 번째 쿼리는 '비자 발급'입니다. 비자가 없으면 심사대(두 번째 쿼리) 앞에 줄을 서도 통과할 수 없습니다. 비자가 손에 쥐어지는 순간(enabled: true), 심사관은 비로소 여권에 도장을 찍고 입국(데이터 호출)을 허용합니다.

🚀 실전 랩(Lab) 구축: 비동기 연쇄 고리 설계
1. API 및 규격 정의 (src/api/postApi.ts)
export interface User {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
}

// [로직 1] 이메일로 유저 정보를 가져오는 트리거 API
export const fetchUserByEmail = async (email: string): Promise<User> => {
  return new Promise((resolve) => {
    // 0.5초의 지연을 주어 네트워크 워터폴을 시각적으로 확인합니다.
    setTimeout(() => resolve({ id: 101, name: 'Gemini' }), 500);
  });
};

// [로직 2] 유저 ID에 의존하여 게시글을 가져오는 API
export const fetchPostsByUserId = async (userId: number): Promise<Post[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: '의존적 쿼리 완벽 가이드' },
        { id: 2, title: 'TanStack Query 실무 팁' }
      ]);
    }, 500);
  });
};

💡 코드 상세 해설:

인터페이스 정의:User와 Post 타입을 명확히 분리하여 데이터 간의 연결 고리(userId)를 설정했습니다.
비동기 시뮬레이션:setTimeout을 통해 실제 서버 통신처럼 네트워크 지연 상황을 연출했습니다. 이 지연 덕분에 네트워크 탭에서 순차적으로 배가 출항하듯 요청이 나가는 모습을 볼 수 있습니다.
2. 컴포넌트 구현 (src/components/UserPosts.tsx)
import { useQuery } from '@tanstack/react-query';
import { fetchUserByEmail, fetchPostsByUserId } from '../api/postApi';

export const UserPosts = ({ email }: { email: string }) => {
  /**
   * [첫 번째 로직: 의존 관계의 시작]
   * 입력받은 이메일을 기반으로 유저 정보를 가져옵니다.
   * 이 데이터가 도착하기 전까지 userId는 undefined 상태를 유지합니다.
   */
  const { data: user } = useQuery({
    queryKey: ['user', email],
    queryFn: () => fetchUserByEmail(email),
  });

  const userId = user?.id;

  /**
   * [두 번째 로직: 조건부 트리거 및 타입 안전성]
   * !! 연산자를 통해 userId가 존재할 때만 쿼리를 활성화합니다.
   * enabled가 true라면 userId는 반드시 존재하므로 userId!를 사용합니다.
   */
  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPostsByUserId(userId!),
    enabled: !!userId, // [시니어의 한 수] 불리언 값으로 변환하여 게이트 역할 수행
  });

  /**
   * [최종 통합 로직: 사용자 피드백 설계]
   * 데이터 부재 시 조기에 리턴하여 런타임 에러를 원천 차단합니다.
   */
  if (!user || isPostsLoading) {
    return <div style={{ padding: '1rem' }}>데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div style={{ padding: '1.5rem', border: '1px solid #4a90e2', borderRadius: '12px' }}>
      <h1>{user.name}님의 게시글</h1>
      <hr />
      <ul>
        {posts?.map(post => (
          <li key={post.id} style={{ marginBottom: '10px' }}>
            <strong>{post.title}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

💡 코드 상세 해설:

!!userId: 더블 느낌표를 활용한 타입 변환 기법입니다. undefined일 때는 false, 값이 생기는 순간 true가 되어 두 번째 쿼리를 트리거합니다.
userId! (Non-null assertion): 보통 위험해 보일 수 있는 문법이지만, enabled가 true가 되었다는 것은 이미 userId가 존재한다는 확신이 있다는 뜻이기에 타입을 강제로 확정 지어도 매우 안전합니다.
Early Return:!user || isPostsLoading 조건으로 로딩 중일 때 조기에 리턴하여 하단 렌더링 로직에서 map 등을 실행할 때 발생할 수 있는 에러를 방지합니다.
3. 메인 앱 조립 (src/App.tsx & src/main.tsx)
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserPosts } from './components/UserPosts';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ textAlign: 'center' }}>Dependent Query Lab 🔗</h1>
        <UserPosts email="ai@google.com" />
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

QueryClientProvider: 앱 전체를 공급자로 감싸줌으로써, 하위 모든 컴포넌트가 엔진의 자동 상태 동기화 및 캐싱 기능을 정상적으로 사용할 수 있게 합니다.
🔍 데이터 제어 방식 전격 비교
데이터 호출의 선후 관계를 어떻게 처리하느냐에 따라 코드의 질이 완전히 달라집니다.

useEffect 방식 (비권장): * 과거에는 첫 번째 데이터가 들어오면 useEffect 안에서 두 번째 함수를 수동 호출했습니다.
코드가 지저분해지고 레이스 컨디션(Race Condition) 같은 버그에 매우 취약했습니다.
enabled 옵션 방식 (권장): * 복잡한 체인 없이 선언적으로 순서를 제어합니다.
엔진이 모든 상태 동기화를 완벽하게 처리하며, 네트워크 탭을 통해 시각적으로 명확한 흐름을 확인할 수 있습니다.
🏁 최종 테스트 케이스: 성공 여부 판단
강의를 마치며, 여러분의 코드가 시니어의 수준에 도달했는지 확인해 보세요.

에러 해결 확인: 초기 렌더링 시 userId가 없는 상태로 요청이 나가지 않아 400번대 에러가 발생하지 않나요?
워터폴 관찰: 네트워크 탭에서 첫 번째 응답이 도착하는 그 찰나에 두 번째 요청이 마치 배가 출항하듯 출발하나요?
타입 안전성:userId!를 사용한 부분에서 타입스크립트 엔진의 불안감 없이 빌드가 정상적으로 완료되나요?
🧐 실습 시 반드시 주목해야 할 핵심 포인트 (Senior's Checklist)
이 실습을 진행하며 단순히 "동작한다"를 넘어, 다음의 세 가지 디테일을 관찰하는 데 집중해 보세요. 이것이 주니어와 시니어를 가르는 결정적 차이입니다.

1. enabled가 만드는 '기다림의 미학'
주목할 점: 두 번째 쿼리의 status 변화를 추적해 보세요.
상세 설명:userId가 없는 동안 두 번째 쿼리는 loading이 아니라 pending 상태로 머뭅니다. 네트워크 탭에 아예 기록조차 남지 않는 이 '완벽한 정적 상태'가 어떻게 유지되는지 관찰하세요. 이것이 불필요한 서버 비용을 아끼는 첫걸음입니다.
2. 타입스크립트와의 완벽한 공조 (enabled → !)
주목할 점:fetchPostsByUserId(userId!)에서 왜 에러가 나지 않는지 생각해보세요.
상세 설명:enabled: !!userId라는 조건이 쿼리 엔진의 입구를 지키고 있기 때문에, queryFn이 실행되는 시점에 userId는 절대로undefined일 수 없습니다. 이 논리적 흐름 덕분에 우리는 !(Non-null assertion)를 죄책감 없이, 가장 안전하게 사용할 수 있는 것입니다.
3. 선언적 UI의 힘 (No More useEffect)
주목할 점:user 데이터가 들어왔을 때 두 번째 쿼리를 호출하는 코드가 어디에 있는지 찾아보세요.
상세 설명: 놀랍게도 그 코드는 어디에도 없습니다. 우리는 그저 "이 조건일 때 실행해"라고 선언(Declare)했을 뿐이고, 호출 타이밍은 엔진이 결정합니다. useEffect로 점철된 명령형 코드보다 이 방식이 얼마나 간결하고 에러에 강한지 직접 체감해 보시기 바랍니다.
