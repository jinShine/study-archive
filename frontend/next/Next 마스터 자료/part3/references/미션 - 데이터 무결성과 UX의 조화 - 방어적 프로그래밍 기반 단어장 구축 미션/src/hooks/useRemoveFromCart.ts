import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CartItem } from '@/types/cart';
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number, { previousCart: CartItem[] | undefined }>({
    mutationFn: async (id) => { 
      const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' }); 
      if (!res.ok) throw new Error('삭제 실패');
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
      queryClient.setQueryData<CartItem[]>(['cart'], (old) => old?.filter(item => item.id !== id));
      return { previousCart };
    },
    onError: (err, id, context) => {
      if (context?.previousCart) queryClient.setQueryData(['cart'], context.previousCart);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};