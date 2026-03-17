"상한 데이터는 버리고, 신선한 데이터를 즉시 배달하라"
이 마법의 핵심은 우리가 58강에서 정성스럽게 설계했던 주소록인 Query Key Factory를 활용하는 데 있습니다. 이는 엔진에게 "이 키를 가진 데이터는 이제 상했으니 당장 버리고 서버에서 새로 받아오라"고 명령을 내리는 것과 같습니다.

🏛️ 아키텍처 원칙: 명령형 노가다에서 선언적 무효화로
Invalidation은 개발자가 데이터를 어떻게 바꿀까 고민하며 배열을 순회하던 명령형 사고방식에서 벗어나, "이 데이터는 이제 유효하지 않으니 엔진 네가 알아서 최신화해달라"고 요청하는 선언적 프로그래밍의 정수입니다.

정밀 타격: 전체 페이지가 아니라, 특정 queryKey를 공유하는 데이터만 타겟팅합니다.
연속성 유지: 브라우저 새로고침이 없으므로 사용자의 스크롤 위치, 입력 중인 폼 데이터가 그대로 유지됩니다.
백그라운드 동기화: 사용자가 하얀 화면을 보며 기다리는 것이 아니라, 백그라운드에서 조용히 데이터를 가져온 뒤 결과만 싹 갈아 끼웁니다.
🚀 스텝 바이 스텝 가이드: 정밀 무효화 구현
Step 1. 가짜 API 및 Key Factory 정의 (src/api/mockApi.ts)
실무 환경에서는 모듈 간의 명확한 데이터 공유가 필수적입니다. 인터페이스와 키 공장을 체계적으로 설계합니다.

// 유저 정보를 위한 표준 규격
export interface User {
  id: number;
  name: string;
}

// 58강에서 강조한 Key Factory 패턴: 무효화의 범위를 결정하는 설계도입니다.
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
};

// 유저 수정 API (실제 통신처럼 0.5초의 지연을 줍니다)
export const updateUserApi = async (updatedUser: User): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📡 [Network] 서버 데이터 수정 완료: ${updatedUser.name}`);
      resolve(updatedUser);
    }, 500);
  });
};

// 유저 조회 API (무효화 직후 엔진이 자동으로 호출할 함수입니다)
export const fetchUserApi = async (id: number): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: "시니어 개발자 (수정 전)" });
    }, 300);
  });
};

💡 코드 상세 해설:

모듈화 (export):User 인터페이스 앞에 export를 붙여 다른 파일에서도 이 규격을 공유할 수 있게 합니다. 이는 협업과 타입 안정성의 기초입니다.
Key Factory:userKeys.all이라는 상위 키를 무효화하면 하위의 모든 데이터(lists, detail)가 한꺼번에 신선한 상태로 갱신됩니다.
비동기 함수: 실제 네트워크 환경을 시뮬레이션하여 0.5초의 찰나에 UI가 얼마나 매끄럽게 반응하는지 확인할 수 있게 했습니다.
Step 2. 데이터 조회 컴포넌트 (src/components/UserProfile.tsx)
데이터의 변화를 실시간으로 감시하는 관찰자 컴포넌트를 구축합니다.

import { useQuery } from '@tanstack/react-query';
import { fetchUserApi, userKeys } from '../api/mockApi';

export default function UserProfile({ id }: { id: number }) {
  const { data: user, isLoading } = useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUserApi(id),
  });

  if (isLoading) return <div>유저 정보 로딩 중...</div>;

  return (
    <div style={{ padding: '1rem', border: '2px solid #333', borderRadius: '8px' }}>
      <h2>현재 유저 이름: {user?.name}</h2>
      <p>ID: {user?.id}</p>
    </div>
  );
}

💡 코드 상세 해설:

옵저버 패턴: 이 컴포넌트는 userKeys.detail(id)라는 특정 주소를 구독하고 있는 관찰자입니다. 나중에 이 주소에 "무효화" 명령이 떨어지면, 엔진은 이 컴포넌트에게 즉시 새로운 소식을 배달합니다.
Step 3. 수정 및 무효화 컴포넌트 (src/components/UserEditor.tsx)
66강의 지옥 같았던 수동 업데이트를 단 한 줄로 끝내는 핵심 로직입니다.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserApi, userKeys } from '../api/mockApi';
import type { User } from '../api/mockApi'; // ✅ 명확한 타입 임포트

export default function UserEditor({ id }: { id: number }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<User, Error, User>({
    mutationFn: (updatedUser) => updateUserApi(updatedUser),

    // 🎯 오늘의 주인공: 서버 수정 성공 시 실행되는 콜백
    onSuccess: (data, variables) => {
      /**
       * ✅ 시니어의 단 한 줄
       * 엔진은 'users'로 시작하는 모든 캐시를 찾아 즉시 'Stale' 딱지를 붙입니다.
       * 화면에서 이 데이터를 쓰고 있는 모든 컴포넌트에게 재요청 신호를 보냅니다.
       */
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      console.log(`✨ ${variables.name}님 정보 갱신 프로세스 진입`);
    }
  });

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h3>수정 제어실</h3>
      <button
        disabled={isPending}
        onClick={() => mutate({ id, name: "New Senior " + Math.floor(Math.random() * 100) })}
      >
        {isPending ? '서버 통신 중...' : '이름 랜덤 수정 및 무효화'}
      </button>
    </div>
  );
}

💡 코드 상세 해설:

Type-only Import:import type 문법을 사용해 번들 크기를 최적화하고 런타임 오류 가능성을 제거했습니다.
invalidateQueries: 이 함수 한 줄이 실행되는 순간, 개발자가 직접 배열을 돌며 데이터를 갈아 끼우던 고통스러운 작업은 엔진의 몫이 됩니다.
자동 동기화:UserEditor는 UserProfile의 존재를 모르지만, Query Key라는 공통 분모를 통해 엔진이 둘 사이의 정보를 숨 쉬듯 연결해 줍니다.
Step 4. 메인 앱 설정 (src/App.tsx)
전체적인 구성을 조립하여 아키텍처를 완성합니다.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserProfile from './components/UserProfile';
import UserEditor from './components/UserEditor';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>TanStack Query Invalidation Lab 🧪</h1>
        <hr />
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* 데이터를 바라보는 관찰자 */}
          <UserProfile id={1} />
          {/* 데이터를 바꾸고 무효화 명령을 내리는 주체 */}
          <UserEditor id={1} />
        </div>
      </main>
    </QueryClientProvider>
  );
}

💡 코드 상세 해설:

디커플링(Decoupling): 두 컴포넌트는 서로 독립적입니다. 한쪽이 죽거나 바뀌어도 서로에게 영향을 주지 않으면서, 데이터는 중앙의 캐시 저장소를 통해 완벽하게 일치하게 됩니다. 이것이 대규모 앱에서도 유지보수성을 지키는 비결입니다.
🔍 실무 포인트: Invalidation의 내부 동작 (4단계)
단 한 줄의 명령이 실행될 때 엔진 내부에서는 다음과 같은 정교한 프로세스가 일어납니다.

Mark as Stale: 엔진은 메모리 창고에서 해당 queryKey로 시작하는 모든 캐시를 찾아내어 즉시 '낡음(Stale)' 딱지를 붙입니다.
Identify Observers: 현재 화면에서 해당 데이터를 실시간으로 바라보고 있는 컴포넌트(옵저버)들을 즉시 식별합니다.
Background Refetch: 데이터를 사용 중인 컴포넌트들을 위해 엔진이 직접 서버에 최신 데이터를 다시 요청합니다.
Seamless Update: 새로운 데이터가 도착하면 화면은 깜빡임 없이 스르륵 최신 정보로 교체됩니다.
🏁 최종 테스트 케이스: 성공 여부 판단하기
네트워크 탭 확인: 수정을 누른 뒤 main.js 같은 큰 파일 재다운로드 없이, 오직 바뀐 정보를 가져오는 작은 GET 요청 하나만 추가로 발생하는지 보세요.
스크롤 유지 테스트: 화면 하단에서 수정을 눌러도 스크롤이 맨 위로 튀어 올라가지 않고 그대로 유지되는지 확인하세요.
멀티 동기화: 만약 같은 유저 정보를 여러 컴포넌트에서 보여주고 있다면, 한 번의 수정으로 모든 곳이 동시에 바뀌는지 확인하세요.
