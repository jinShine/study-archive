import { useQuery } from '@tanstack/react-query';
import { Todo } from '../types/todo';
export const useTodos = () => useQuery<Todo[]>({
  queryKey: ['todos'],
  queryFn: async () => (await fetch('/api/todos')).json(),
  throwOnError: true,
});
