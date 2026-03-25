'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodoAction } from '@/actions/todo-actions';

export default function TodoItem({ todo }: any) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: updateTodoAction,
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], (old: any) =>
        old ? old.map((t: any) => (t.id === newTodo.id ? newTodo : t)) : [newTodo]
      );
      return { previousTodos };
    },
    onError: (err, newTodo, context: any) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      alert('서버 에러로 인해 이전 상태로 복구합니다.');
    },
    onSettled: (data) => {
      if (data && typeof window !== 'undefined') {
        (window as any).mockDB = (window as any).mockDB.map((t: any) =>
          t.id === data.id ? data : t
        );
      }
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <li className="flex items-center gap-4 p-3 border-b hover:bg-slate-50 transition-all">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => mutate({ ...todo, completed: !todo.completed })}
        className="w-6 h-6 rounded-full cursor-pointer accent-blue-600"
      />
      <span className={todo.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
        {todo.text}
      </span>
    </li>
  );
}