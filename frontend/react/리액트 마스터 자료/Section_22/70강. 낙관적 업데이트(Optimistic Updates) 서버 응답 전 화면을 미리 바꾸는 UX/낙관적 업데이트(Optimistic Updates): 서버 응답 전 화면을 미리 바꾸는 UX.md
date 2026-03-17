"성공할 것을 믿고, 화면부터 지른다"
낙관적 업데이트란 서버가 성공할 것이라고 '낙관적'으로 가정하고, 실제 응답이 오기도 전에 UI를 즉시 업데이트하는 전략입니다. 인스타그램에서 '좋아요' 하트 버튼을 누를 때, 서버의 대답을 기다리지 않고 하트가 즉시 빨간색으로 변하는 것이 가장 대표적인 예시입니다.

🏛️ 아키텍처 원칙: TContext와 롤백(Rollback)의 실체
단순히 화면만 먼저 바꾸는 것은 위험합니다. 만약 서버 통신이 실패한다면 어떻게 해야 할까요? 시니어의 설계는 항상 '실패 시나리오'를 포함하며, 이때 가장 중요한 개념이 바로 TContext입니다.

TContext (타임머신용 스냅샷):onMutate 단계에서 현재 데이터를 미리 찍어둔 디지털 사진입니다. "망하면 이 사진 속 상태로 돌아가자"라고 약속하는 백업 데이터입니다.
Rollback (복구): 서버 요청이 실패하면 찍어둔 사진을 꺼내 화면을 이전 상태로 '톡' 되돌립니다.
Final Sync (최종 정화): 성공하든 실패하든 마지막엔 서버 데이터와 최종 동기화를 진행하여 단 1%의 데이터 오차도 허용하지 않습니다.
🚀 스텝 바이 스텝 가이드: 낙관적 업데이트 구현
Step 1. 가짜 API 및 Key Factory 정의 (src/api/mockApi.ts)
실습을 위해 롤백 상황을 강제로 유도할 수 있는 실패 확률을 심어둡니다.

// 할 일 데이터의 표준 규격
export interface Todo {
  id: number;
  text: string;
}

// 쿼리 키 팩토리 (58강 패턴)
export const todoKeys = {
  all: ['todos'] as const,
};

/**
 * 할 일 추가 API (의도적인 1초 지연)
 * ⚠️ 테스트를 위해 30% 확률로 에러 발생 시뮬레이션
 */
export const postTodoApi = async (newTodo: Todo): Promise<Todo> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.3) reject(new Error("서버 저장에 실패했습니다!"));
      resolve(newTodo);
    }, 1000);
  });
};

💡 코드 상세 해설:

에러 시뮬레이션: 30%의 실패 확률을 두어, 네트워크 사고 발생 시 화면이 이전 상태로 어떻게 복구(Rollback)되는지 직접 목격할 수 있게 설계했습니다.
Step 2. 낙관적 업데이트 엔진 설계 (src/components/TodoEditor.tsx)
useMutation의 4번째 제네릭인 TContext의 디테일에 주목하세요.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postTodoApi, todoKeys } from '../api/mockApi';
import type { Todo } from '../api/mockApi';

export default function TodoEditor() {
  const queryClient = useQueryClient();

  /**
   * useMutation<TData, TError, TVariables, TContext>
   * 1. TData: 성공 시 서버 응답 타입 (Todo)
   * 2. TError: 에러 발생 시 타입 (Error)
   * 3. TVariables: mutate에 넘길 데이터 타입 (Todo)
   * 4. TContext: 백업 데이터의 구조 ({ previousTodos: Todo[] | undefined })
   */
  const { mutate } = useMutation<Todo, Error, Todo, { previousTodos: Todo[] | undefined }>({
    mutationFn: (newTodo) => postTodoApi(newTodo),

    // [1단계] 방아쇠를 당기자마자 즉시 실행: "백업 및 선제 UI 타격"
    onMutate: async (newTodo: Todo) => {
      // 진행 중인 쿼리 취소: 이전의 fetch 응답이 현재의 낙관적 UI를 덮어쓰지 않게 방어
      await queryClient.cancelQueries({ queryKey: todoKeys.all });

      // 📸 [스냅샷 촬영]: 현재 캐시에 저장된 할 일 목록을 백업
      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.all);

      // ⚡ [선제 타격]: 서버 응답 기다리지 않고 캐시에 가짜 데이터를 즉시 주입
      queryClient.setQueryData<Todo[]>(todoKeys.all, (old) => [...(old || []), newTodo]);

      // 🎁 [TContext 반환]: 찍어둔 스냅샷을 반환하면 onError의 context 인자로 배달됨
      return { previousTodos };
    },

    // [2단계] 서버 요청 실패 시 실행: "비상 대책(Rollback)"
    onError: (err, newTodo, context) => {
      // ⏪ [롤백]: 아까 onMutate가 넘겨준 스냅샷(context)으로 캐시를 과거로 되돌림
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.all, context.previousTodos);
      }
      alert(`⚠️ 복구 알림: ${err.message}`);
    },

    // [3단계] 성공/실패 여부와 상관없이 실행: "최종 정합성 맞추기"
    onSettled: () => {
      // 🧹 [정화]: 서버와 1%의 오차도 없도록 무효화 실행 (실제 ID 등으로 갱신)
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    }
  });

  return (
    <div style={{ padding: '1.5rem', border: '2px solid #333', borderRadius: '12px' }}>
      <button onClick={() => mutate({ id: Date.now(), text: "낙관적 할 일" })}>
        할 일 추가 (0초 로딩 경험)
      </button>
    </div>
  );
}

💡 코드 심층 해설 (TContext의 정체):

배달 시스템:onMutate에서 return { previousTodos }를 하는 순간, 리액트 쿼리 엔진은 이 객체를 가방에 담아 비상시를 위해 들고 있습니다. 만약 에러가 나면 이 가방을 그대로 onError의 세 번째 인자인 context에 넘겨주는 것입니다.
cancelQueries의 중요성: 이걸 빼먹으면 화면이 깜빡거리며 낙관적 데이터가 사라졌다가 다시 나타나는 경합 조건(Race Condition)을 겪게 됩니다.
Step 3. 메인 앱 및 엔트리 설정 (src/App.tsx & src/main.tsx)
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoEditor from './components/TodoEditor';
import TodoList from './components/TodoList'; // (가정: useQuery를 사용한 리스트 컴포넌트)

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Optimistic UX Lab ⚡</h1>
        <hr />
        <TodoEditor />
        <TodoList />
      </main>
    </QueryClientProvider>
  );
}

🔍 실무 포인트: 왜 TContext 설계가 시니어의 실력인가?
낙관적 업데이트는 개발자의 노력이 조금 더 들어가는 대신 사용자에게는 압도적인 속도감을 선사합니다.

사용자 심리 제어: 1초의 대기 시간이 사라지면 사용자는 앱이 '가볍다'고 느끼며 서비스 만족도가 비약적으로 상승합니다.
유령 데이터(Ghost Data) 방지: 만약 onError에서 롤백 로직이 없다면, 서버 저장에 실패했는데 화면에는 성공한 것처럼 데이터가 남아있는 최악의 데이터 불일치가 발생합니다.
타입 안전성:TContext를 통해 롤백 시 사용할 데이터의 타입을 정확히 맞추지 않으면, 롤백 과정에서 undefined를 참조하거나 데이터 구조가 깨지는 2차 사고가 날 수 있습니다.
🏁 최종 테스트 케이스: 성공 및 롤백 관찰하기
0초 로딩 테스트:
수행: 버튼을 클릭합니다.
확인: 네트워크 탭의 응답이 오기도 전에 리스트에 아이템이 즉시 추가되는지 확인하세요.
롤백(Rollback) 테스트:
수행: 에러가 발생할 때까지 여러 번 클릭해 봅니다 (30% 확률).
확인: 에러 알림과 동시에, 방금 추가되었던 아이템이 리스트에서 스르륵 사라지며 이전 상태로 완벽히 복구되는지 확인하세요.
최종 동기화 확인:
수행: 성공 시, 네트워크 탭에서 invalidateQueries로 인해 추가적인 GET 요청이 발생하는지 확인하세요. 이는 서버가 생성한 진짜 ID와 타임스탬프를 받아오는 과정입니다.
