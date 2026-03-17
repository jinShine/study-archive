import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postTodoApi, todoKeys } from '../api/mockApi';
import type { Todo } from '../api/mockApi';

export default function TodoEditor() {
  const queryClient = useQueryClient();

  const { mutate } = useMutation<Todo, Error, Todo, { previousTodos: Todo[] | undefined }>({
    mutationFn: (newTodo) => postTodoApi(newTodo),

    onMutate: async (newTodo: Todo) => {
      // 1. 진행 중인 쿼리 취소 (경합 조건 방어)
      await queryClient.cancelQueries({ queryKey: todoKeys.all });

      // 2. 📸 스냅샷 촬영 (백업 데이터 생성)
      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.all);

      // 3. ⚡ 선제 타격 (캐시 강제 주입)
      queryClient.setQueryData<Todo[]>(todoKeys.all, (old) => [...(old || []), newTodo]);

      // 4. 🎁 백업본 반환 (TContext로 전달)
      return { previousTodos };
    },

    onError: (err, __, context) => {
      // ⏪ 롤백: 에러 발생 시 찍어둔 사진으로 복구
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.all, context.previousTodos);
      }
      alert(`⚠️ 복구됨: ${err.message}`);
    },

    onSettled: () => {
      // 🧹 최종 동기화: 서버와 한 치의 오차도 없도록 무효화
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    }
  });

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #333', borderRadius: '12px' }}>
      <button 
        onClick={() => mutate({ id: Date.now(), text: `할 일 #${Math.floor(Math.random() * 100)}` })}
        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '6px' }}
      >
        ➕ 할 일 즉시 추가 (0초 로딩)
      </button>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        💡 30% 확률로 에러가 발생하면 목록에서 항목이 다시 사라지는 '롤백'을 목격할 수 있습니다.
      </p>
    </div>
  );
}