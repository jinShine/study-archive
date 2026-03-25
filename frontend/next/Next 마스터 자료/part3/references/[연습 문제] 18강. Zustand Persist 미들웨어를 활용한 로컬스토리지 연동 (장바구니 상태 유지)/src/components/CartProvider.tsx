'use client';
import { createContext, useState, useEffect, use } from 'react';
import { createCartStore, type CartState } from '../store/cartStore';
import { useStore, Mutate, StoreApi } from 'zustand';
export const CartContext = createContext<ReturnType<typeof createCartStore> | null>(null);
export function CartProvider({ children, initialItems = 0 }) {
  const [store] = useState(() => createCartStore(initialItems));
  useEffect(() => {
    type PersistedStore = Mutate<StoreApi<CartState>, [["zustand/persist", unknown]]>;
    (store as unknown as PersistedStore).persist.rehydrate();
  }, [store]);
  return <CartContext value={store}>{children}</CartContext>;
}
export function useCartStore<T>(selector: (state: CartState) => T): T {
  const store = use(CartContext);
  if (!store) throw new Error('CartProvider missing!');
  return useStore(store, selector);
}