import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Todo } from '../types/todo';
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number, { previousTodos: Todo[] | undefined }>({
    mutationFn: async (id) => { await fetch(`/api/todos/${id}`, { method: 'DELETE' }); },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      queryClient.setQueryData<Todo[]>(['todos'], (old) => old?.filter(t => t.id !== id));
      return { previousTodos };
    },
    onError: (err, id, context) => {
      if (context?.previousTodos) queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });
};
