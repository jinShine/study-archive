'use client';
import { createContext, useState, useEffect, use } from 'react';
import { createCartStore } from '../store/cartStore';
import { useStore } from 'zustand';
export const CartContext = createContext(null);
export function CartProvider({ children }) {
  const [store] = useState(() => createCartStore());
  useEffect(() => { store.persist.rehydrate(); }, [store]);
  return <CartContext value={store}>{children}</CartContext>;
}
export function useCartStore(selector) {
  const store = use(CartContext);
  if (!store) throw new Error('CartProvider missing!');
  return useStore(store, selector);
}