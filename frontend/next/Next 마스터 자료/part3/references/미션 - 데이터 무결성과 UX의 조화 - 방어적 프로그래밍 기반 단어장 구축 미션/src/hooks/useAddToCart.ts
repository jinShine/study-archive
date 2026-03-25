import { useMutation, useQueryClient } from '@tanstack/react-query';
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => fetch('/api/cart', {
      method: 'POST', body: JSON.stringify({ name })
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};