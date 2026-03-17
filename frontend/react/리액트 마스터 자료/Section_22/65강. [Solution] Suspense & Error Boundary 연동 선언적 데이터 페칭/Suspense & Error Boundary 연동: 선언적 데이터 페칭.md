선언적 데이터 페칭: "어떻게"가 아니라 "무엇"에 집중하라
우리가 가장 먼저 이해해야 할 개념은 선언적 프로그래밍입니다. 이전 강의에서 짰던 코드는 "로딩 상태를 true로 바꿔라", "에러가 나면 에러 상태를 넣어라"처럼 하나하나 세세하게 명령을 내리는 명령형(Imperative) 방식이었습니다. 이는 마치 주방에 들어가서 요리사에게 "가스불을 켜세요, 프라이팬을 올리세요"라고 일일이 참견하는 것과 같습니다.

반면 오늘 배울 선언적 방식은 식당 손님이 되어 메뉴판을 보고 "음식이 나오면 이 테이블에 차려주시고, 혹시 재료가 떨어졌다면 나에게 알려주세요"라고 미리 선언(Declare)만 해두는 방식입니다. 요리사가 불을 켜고 접시를 닦는 복잡한 과정은 리액트 엔진과 TanStack Query가 알아서 처리하며, 컴포넌트는 오직 "데이터가 있을 때 화면을 어떻게 그릴 것인가"에만 집중합니다.

🏛️ 아키텍처 원칙: 책임의 위임과 중단(Suspense)
선언적 페칭을 가능하게 하는 3가지 핵심 요소를 상세히 짚어보겠습니다.

Suspense (중단): 사전적으로 '정지', '중단'을 뜻합니다. 컴포넌트가 데이터를 가져오는 동안 렌더링을 잠시 중단시키기 때문에 이 용어를 사용합니다. 즉, 준비물(Data)이 올 때까지 이 컴포넌트의 시간은 잠시 멈춘다는 의미입니다.
Error Boundary (차단기): 우리 앱의 안전 펜스 혹은 차단기입니다. 가전제품 하나가 합선되었다고 집 전체 전기가 내려가면 안 되듯이, 특정 컴포넌트의 에러가 전체 앱을 하얀 화면으로 변하는 비극을 막아줍니다.
Fallback (대비책): 데이터(Plan A)가 아직 준비되지 않았을 때 대신 보여줄 Plan B입니다. 단순히 스피너를 넘어 실제 콘텐츠 자리를 미리 그려두는 스켈레톤 UI를 배치하는 것이 2026년 UX의 표준입니다.
🚀 스텝 바이 스텝 가이드: 선언적 UI 구축
Step 0. 필수 라이브러리 설치
리액트 자체에는 아직 함수형 컴포넌트로 된 ErrorBoundary가 내장되어 있지 않습니다. 따라서 업계 표준 라이브러리인 react-error-boundary를 설치하여 사용합니다.

# 터미널에서 아래 명령어를 실행하여 설치합니다.
npm install react-error-boundary
Step 1. 데이터 규격 및 가짜 API (src/api/mockApi.ts)
export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export const fetchUser = async (id: number): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // ⚠️ 테스트를 위해 ID가 0인 경우 에러 발생 시뮬레이션
      if (id === 0) reject(new Error("존재하지 않는 유저입니다."));

      resolve({
        id,
        name: "선언적 아키텍트",
        email: "decl@dev.com",
        avatar: "<https://api.dicebear.com/7.x/avataaars/svg?seed=1>"
      });
    }, 2000);
  });
};

💡 코드 상세 설명:

인터페이스 정의:User 타입을 명시하여 데이터 구조에 대한 타입 안정성을 확보합니다.
에러 시뮬레이션:id === 0일 때 reject를 던지도록 설계하여, Error Boundary가 어떻게 이 신호를 낚아채는지 테스트할 수 있게 했습니다.
비동기 지연: 2초의 지연 시간을 주어 Suspense가 fallback UI를 띄우는 과정을 명확히 관찰할 수 있습니다.
Step 2. useSuspenseQuery를 이용한 컴포넌트 설계 (src/components/UserProfile.tsx)
이 훅은 데이터가 준비되지 않았을 때 아예 컴포넌트의 실행 라인을 그 자리에서 멈춰 세워버립니다.

import { useSuspenseQuery } from '@tanstack/react-query';
import { fetchUser } from '../api/mockApi';
import { userKeys } from '../queries/queryKeys';
import type { User } from '../api/mockApi'; // ✅ Type-only import

const styles = {
  container: { border: '2px solid #333', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#f8f9fa' },
  avatar: { width: '80px', borderRadius: '50%' }
};

export default function UserProfile({ id }: { id: number }) {
  /**
   * 1. useSuspenseQuery의 핵심 메커니즘:
   * 성공한 데이터가 올 때까지 이 컴포넌트의 실행은 여기서 중단(Suspend)됩니다.
   * 데이터가 없으면 상위 Suspense로 제어권을 완전히 던져버립니다.
   */
  const { data: user } = useSuspenseQuery<User>({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
  });

  /**
   * 2. 데이터 존재 확정:
   * 로딩이나 에러 상태라면 실행 흐름이 이 리턴 문까지 내려오지도 않습니다.
   * 타입스크립트 환경에서 'user'는 절대로 undefined일 수 없음을 보장받습니다.
   * 옵셔널 체이닝(?.) 없는 깨끗한 코드가 완성됩니다.
   */
  return (
    <div style={styles.container}>
      <img src={user.avatar} alt={user.name} style={styles.avatar} />
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
💡 코드 상세 설명:

실행 중단(Suspend): 데이터가 없으면 리액트에게 "나 지금 데이터 기다리고 있으니까 다 오면 다시 깨워줘!"라고 신호(Promise)를 던집니다.
타입 안정성: 데이터가 무조건 존재한다고 보장하므로 if (!user) 같은 방어 코드가 사라집니다.
Step 3. 부모 단계의 관제 센터 구축 (src/App.tsx)
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserProfile from './components/UserProfile';

const queryClient = new QueryClient();

// 대체 UI 컴포넌트들 (Plan B)
const UserProfileSkeleton = () => (
  <div style={{ color: '#666', padding: '1.5rem', border: '2px dashed #ccc' }}>
    ⌛ 스켈레톤 UI가 데이터를 기다리는 중...
  </div>
);

const ErrorPage = ({ error }: { error: Error }) => (
  <div style={{ color: 'red', padding: '1.5rem', border: '2px solid red' }}>
    ❌ 차단기 작동: {error.message}
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ padding: '2rem' }}>
        <h1>선언적 데이터 페칭 Lab 🧪</h1>
        <hr />

        {/* 1. 에러 발생 시 앱 전체가 죽지 않게 막아주는 안전 펜스 (Error Boundary) */}
        <ErrorBoundary fallbackRender={ErrorPage}>

          {/* 2. 자식이 실행을 중단하면 가로채서 로딩 UI를 띄우는 대기실 (Suspense) */}
          <Suspense fallback={<UserProfileSkeleton />}>
            {/* ⚠️ 테스트: id를 0으로 바꾸면 에러 UI가 나타납니다. */}
            <UserProfile id={1} />
          </Suspense>

        </ErrorBoundary>
      </main>
    </QueryClientProvider>
  );
}
🔍 [Deep Dive] 에러 발생 시 UI는 어떻게 변할까?
만약 존재하지 않는 유저(ID: 0)를 요청하면 어떤 일이 벌어질까요?

API 거절:fetchUser(0) 호출 시 reject가 발생합니다.
에러 던지기:useSuspenseQuery가 에러를 감지하고 부모 컴포넌트 방향으로 에러 객체를 던집니다.
차단기 작동: 부모인 ErrorBoundary가 이 에러를 공중에서 낚아챕니다.
UI 교체: 에러가 난 자식(UserProfile)을 화면에서 치우고, fallbackRender에 설정된 ErrorPage를 그 자리에 대신 보여줍니다.
이것이 바로 에러 상황조차 하나의 UI 시나리오로 선언하는 방식입니다. 덕분에 앱 전체가 멈추지 않고 해당 영역만 안전하게 격리됩니다.

🏁 최종 테스트 케이스: 수동 vs 선언적 관리 비교
로딩 처리 로직의 위치 변화: 수동 방식에서는 컴포넌트 내부에서 if(isLoading)을 직접 썼지만, 선언적 방식에서는 내부 코드가 0줄입니다. 부모의 Suspense가 로딩 시점을 통제하고 있는지 확인하세요.
에러 핸들링 방식의 격리: 수동 방식은 try-catch로 에러 상태를 직접 관리했지만, 선언적 방식은 컴포넌트가 그냥 '죽게' 둡니다. 대신 부모의 ErrorBoundary가 작동하여 나머지 앱 영역은 살아있는지 확인하세요.
에러 UI 강제 발생 테스트:App.tsx에서 <UserProfile id={1} />의 id값을 0으로 바꿔보세요. 컴포넌트 내부 수정 없이 부모가 정의한 에러 UI로 매끄럽게 전환되는지 확인하세요.
타입스크립트 개발 경험 (DX):user 객체에 접근할 때 옵셔널 체이닝(?.) 없이 즉시 속성이 자동 완성되는지 확인하세요. 데이터 존재가 보장되는 환경의 쾌감을 느껴보셔야 합니다.
배달 사고(Race Condition) 방지: 매우 빠른 속도로 ID를 전환해 보세요. 별도의 플래그 변수 없이도 항상 마지막 요청의 결과가 화면에 남는지 확인하세요. 리액트 엔진이 렌더링 타이밍을 자동으로 조절해 줍니다.
