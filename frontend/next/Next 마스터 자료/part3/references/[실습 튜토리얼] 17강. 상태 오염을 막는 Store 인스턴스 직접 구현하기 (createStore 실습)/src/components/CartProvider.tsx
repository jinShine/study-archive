'use client';

import { createContext, useState, use } from 'react';
import { createCartStore, type CartState } from '../store/cartStore';
import { useStore } from 'zustand';

export const CartContext = createContext<ReturnType<typeof createCartStore> | null>(null);

export function CartProvider({ children, initialItems = 0 }: { children: React.ReactNode, initialItems?: number }) {
  const [store] = useState(() => createCartStore(initialItems));

  return (
    <CartContext value={store}>
      {children}
    </CartContext>
  );
}

export function useCartStore<T>(selector: (state: CartState) => T): T {
  const store = use(CartContext);
  if (!store) throw new Error('CartProvider missing!');
  return useStore(store, selector);
}