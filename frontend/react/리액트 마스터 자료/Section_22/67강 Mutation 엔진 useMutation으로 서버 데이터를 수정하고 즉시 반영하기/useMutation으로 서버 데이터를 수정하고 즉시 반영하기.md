관찰자(Observer)에서 행동 대장(Commander)으로
생물학에서 '돌연변이'를 뜻하는 Mutation은 프로그래밍 세계에서 상태의 변화 혹은 데이터의 변형을 의미합니다. 단순히 있는 그대로의 정보를 관찰하는 것을 넘어 우리가 원하는 방향으로 서버의 데이터를 직접 바꾸는 능동적인 행위입니다.

🏛️ 아키텍처 원칙: useQuery vs useMutation
두 엔진의 결정적인 차이는 크게 세 가지 관점에서 살펴볼 수 있습니다.

실행 방식의 차이:
useQuery: 선언적이고 자동적인 관찰자와 같습니다. 컴포넌트가 마운트되거나 쿼리 키가 변경되는 즉시 엔진이 알아서 데이터를 가져옵니다.
useMutation: 명령형이고 수동적인 행동 대장입니다. 버튼을 클릭하거나 폼을 제출하는 것처럼 사용자가 구체적인 행동을 했을 때만 비로소 작동을 시작합니다.
현실 세계의 비유:
useQuery: 식당에 앉아 메뉴판을 뚫어지게 쳐다보며 신메뉴가 나왔는지 혹은 가격이 바뀌었는지 계속 확인하는 과정입니다.
useMutation: 벨을 눌러 점원을 호출한 뒤 "이 메뉴로 주문할게요!"라고 외치거나 주문을 취소하는 등 상황을 직접 바꾸는 액션 그 자체입니다.
주요 역할:
CRUD 아키텍처에서 읽기 작업인 Read는 그동안 useQuery가 전담해 왔다면, 나머지 생성과 수정 그리고 삭제에 해당하는 Create, Update, Delete라는 역동적인 작업들은 모두 이 useMutation 엔진이 담당합니다.
🚀 스텝 바이 스텝 가이드: Mutation 실습 랩 구축
Step 1. 가짜 API 및 DTO 정의 (src/api/mockApi.ts)
서버와 실제로 통신하며 데이터를 배달할 배달원의 역할을 정의하는 단계입니다.

export interface Post {
  id: number;
  name: string;
  title: string;
  content: string;
}

export interface UpdatePostDto {
  id: number;
  title: string;
  content: string;
}

export const updatePost = async (newPost: UpdatePostDto): Promise<Post> => {
  console.log(`📡 [Network] 게시글 수정 요청 중: ${newPost.title}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 10% 확률로 에러 발생 시뮬레이션
      if (Math.random() < 0.1) reject(new Error("서버에서 수정을 거절했습니다."));
      resolve({
        id: newPost.id,
        name: "시니어 아키텍트",
        title: newPost.title,
        content: newPost.content
      });
    }, 2000);
  });
};

💡 코드 상세 해설

인터페이스의 분리: 서버로부터 받아오는 게시글의 표준 규격인 Post와 수정 요청 시 사용하는 데이터 전송 객체인 UpdatePostDto를 분리했습니다. 이는 타입스크립트 엔진이 성공 시 반환되는 데이터의 형태를 정확히 이해하도록 돕습니다.
DTO의 역할:UpdatePostDto는 우리가 mutate 함수를 호출할 때 어떤 데이터를 인자로 넘겨야 하는지 엄격하게 규정하여 런타임 에러를 방지합니다.
의도적인 에러 설계: 10%의 확률로 reject가 발생하도록 설계하여 onError 콜백이나 ErrorBoundary가 정상적으로 비상 상황을 감지하는지 테스트할 수 있는 환경을 마련했습니다.
Step 2. 메인 엔트리 (src/main.tsx)
리액트 앱의 시작점이며 엔진이 돌아갈 수 있는 최소한의 환경을 구축합니다.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

💡 코드 상세 해설

2026년 표준 렌더링: 리액트 19와 18의 표준 방식인 createRoot를 사용합니다.
StrictMode: 개발 단계에서 컴포넌트의 잠재적인 부작용을 찾아내기 위해 사용되며, Mutation 엔진이 예측 가능한 범위 내에서 작동하는지 감시합니다.
Step 3. 메인 앱 설정 (src/App.tsx)
엔진의 전역 설정을 담당하며 하위 컴포넌트들을 하나로 조립하는 관제 센터입니다.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostEditor from './components/PostEditor';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>TanStack Query Mutation Lab 🧪</h1>
        <p>서버의 상태를 직접 바꾸는 행동 대장을 호출합니다.</p>
        <hr />
        <PostEditor />
      </main>
    </QueryClientProvider>
  );
}

💡 코드 상세 해설

Context 주입:QueryClientProvider를 통해 앱 전체에 TanStack Query 엔진의 컨텍스트를 주입합니다.
Provider의 필수성:useMutation 역시 시스템 안에서 돌아가므로 반드시 이 Provider 하위에서 호출되어야 하며, 이를 통해 모든 상태를 개발자 도구에서 실시간 모니터링할 수 있습니다.
Step 4. 게시글 수정 컴포넌트 (src/components/PostEditor.tsx)
사용자의 입력을 받고 실제로 mutate 방아쇠를 당기는 핵심 로직이 담긴 곳입니다.

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updatePost } from '../api/mockApi';
import type { Post, UpdatePostDto } from '../api/mockApi';

export default function PostEditor() {
  const [title, setTitle] = useState("기존 제목");

  const { mutate, isPending } = useMutation<Post, Error, UpdatePostDto>({
    mutationFn: (newPost) => updatePost(newPost),
    onSuccess: (data, variables) => {
      console.log(`✅ 성공: [${data.title}]로 수정되었습니다.`);
      alert(`성공적으로 수정되었습니다! (보낸 데이터: ${variables.title})`);
    },
    onError: (error, variables) => {
      console.error(`❌ 실패: ${error.message}`);
      alert(`수정 실패! [${variables.title}] 요청을 다시 확인하세요.`);
    },
    onSettled: () => {
      console.log('🏁 모든 통신 프로세스 종료.');
    }
  });

  const handleSubmit = () => {
    mutate({ id: 1, title, content: "수정된 내용입니다." });
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isPending}
      />
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? '수정 요청 중...' : '서버 데이터 수정하기'}
      </button>
      {isPending && <p style={{ color: 'blue' }}>🛰️ 서버와 통신 중입니다...</p>}
    </div>
  );
}

💡 코드 상세 해설

mutate 방아쇠:useQuery와 달리 우리가 직접 호출하지 않으면 절대 실행되지 않는 명령형 인터페이스입니다.
isPending 상태: 현재 서버와 통신 중인지를 실시간 보고하여 버튼을 비활성화(disabled)함으로써 사용자의 중복 클릭을 방지합니다.
콜백 트리오:
onSuccess: 임무 완수 시 서버 응답 데이터(data)와 전송 데이터(variables)를 받아 축하 파티(성공 피드백)를 엽니다.
onError: 비상 대책 위원회로서 실패 원인과 시도했던 데이터를 분석해 정밀한 에러 로그를 남깁니다.
onSettled: 성공/실패 여부와 상관없이 무조건 실행되는 뒷정리 단계(로딩 해제 등)입니다.
🔍 코드 심층 해설: 데이터와 로직의 흐름
위 코드의 흐름을 조금 더 깊게 들여다보면 제네릭의 중요성을 알 수 있습니다. useMutation은 세 가지 제네릭 인자를 받습니다.

TData: 성공 시 서버가 돌려줄 데이터 타입 (Post)
TError: 발생할 수 있는 에러 객체의 타입 (Error)
TVariables:mutate 함수에 실어 보낼 인자 타입 (UpdatePostDto)
이 설계를 통해 엔진 내부의 모든 데이터 흐름을 엄격하게 통제할 수 있습니다. 특히 mutationFn은 서버의 상태를 실제로 바꾸기 위해 떠나는 배달원인데, 이 함수가 성공적으로 완료되어도 우리 앱의 메모리 속 데이터(캐시)는 자동으로 바뀌지 않는다는 점이 매우 중요합니다. 서버의 과녁은 맞혔지만, 우리 눈앞의 점수판은 아직 바뀌지 않은 상태인 것이죠.

🏁 최종 테스트 케이스 및 주목해야 할 포인트
성공적인 실습을 위해 다음 네 가지 포인트에 집중하여 테스트를 진행해 보세요.

방아쇠(Trigger) 동작 확인: 페이지가 로드되었을 때 네트워크 탭을 확인하세요. 아무런 요청이 없어야 정상입니다. 오직 버튼을 클릭하는 찰나에만 로그가 찍히는지 확인하는 것이 수동적 본질을 이해하는 핵심입니다.
중복 요청 방지(isPending) 테스트: 버튼을 누르고 응답을 기다리는 2초 동안 버튼을 연타해 보세요. 버튼이 즉시 비활성화되고 추가 요청이 발생하지 않는다면 시니어의 설계가 성공한 것입니다.
정밀한 피드백 루프 검증: 10%의 확률로 발생하는 에러 상황에서 onError 콜백이 우리가 보냈던 원본 데이터의 제목을 정확히 기억하고 메시지에 띄워주는지 확인하세요.
프로세스 종료(onSettled) 확인: 성공과 실패 모든 시나리오에서 콘솔창에 마지막 종료 로그가 반드시 찍히는지 확인하여 안정적인 리소스 관리를 증명하세요.
