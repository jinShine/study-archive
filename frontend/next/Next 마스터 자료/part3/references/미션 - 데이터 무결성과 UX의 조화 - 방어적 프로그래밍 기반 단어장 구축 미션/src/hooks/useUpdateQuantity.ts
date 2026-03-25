import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CartItem } from '@/types/cart';
export const useUpdateQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation<CartItem, Error, CartItem, { previousCart: CartItem[] | undefined }>({
    mutationFn: async (item) => {
      const res = await fetch(`/api/cart/${item.id}`, { 
        method: 'PATCH', 
        body: JSON.stringify({ quantity: item.quantity }) 
      });
      if (!res.ok) throw new Error('수량 변경 실패');
      return res.json();
    },
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
      queryClient.setQueryData<CartItem[]>(['cart'], (old) => 
        old?.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      return { previousCart };
    },
    onError: (err, newItem, context) => {
      if (context?.previousCart) queryClient.setQueryData(['cart'], context.previousCart);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};