import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Todo } from '../types/todo';
export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  return useMutation<Todo, Error, Todo, { previousTodos: Todo[] | undefined }>({
    mutationFn: async (t) => {
      const res = await fetch(`/api/todos/${t.id}`, { method: 'PATCH', body: JSON.stringify({ completed: t.completed }) });
      if (!res.ok) throw new Error('수정 실패');
      return res.json();
    },
    onMutate: async (updatedTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      queryClient.setQueryData<Todo[]>(['todos'], (old) => old?.map(t => t.id === updatedTodo.id ? updatedTodo : t));
      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTodos) queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });
};
