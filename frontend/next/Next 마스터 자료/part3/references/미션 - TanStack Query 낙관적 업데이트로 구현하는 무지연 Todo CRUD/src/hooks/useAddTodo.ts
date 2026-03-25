import { useMutation, useQueryClient } from '@tanstack/react-query';
export const useAddTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => fetch('/api/todos', {
      method: 'POST', body: JSON.stringify({ text })
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });
};
