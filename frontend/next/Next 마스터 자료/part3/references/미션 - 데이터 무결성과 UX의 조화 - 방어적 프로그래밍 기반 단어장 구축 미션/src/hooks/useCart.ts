import { useQuery } from '@tanstack/react-query';
import { CartItem } from '@/types/cart';
export const useCart = () => useQuery<CartItem[]>({
  queryKey: ['cart'],
  queryFn: async () => (await fetch('/api/cart')).json(),
  throwOnError: true,
});