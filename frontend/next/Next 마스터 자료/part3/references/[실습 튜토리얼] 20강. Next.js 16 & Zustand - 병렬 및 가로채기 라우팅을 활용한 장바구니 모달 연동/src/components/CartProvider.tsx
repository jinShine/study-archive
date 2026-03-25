\'use client\';
import { createContext, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';

interface CartState {
  items: number;
  add: () => void;
}

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => createStore<CartState>((set) => ({
    items: 3,
    add: () => set((state) => ({ items: state.items + 1 })),
  })));
  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

export function useCartStore<T>(selector: (state: CartState) => T): T {
  const context = useContext(CartContext);
  return useStore(context, selector);
}