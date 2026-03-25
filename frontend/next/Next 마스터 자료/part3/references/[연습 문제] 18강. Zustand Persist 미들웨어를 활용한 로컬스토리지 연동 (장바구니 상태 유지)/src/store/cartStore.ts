import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage } from 'zustand/middleware';
export interface CartState { items: number; add: () => void; remove: () => void; reset: () => void; }
export const createCartStore = (initState = 0) => {
  return createStore<CartState>()(persist((set) => ({
    items: initState,
    add: () => set((state) => ({ items: state.items + 1 })),
    remove: () => set((state) => ({ items: Math.max(0, state.items - 1) })),
    reset: () => set({ items: 0 }),
  }), { name: 'cart-storage', storage: createJSONStorage(() => localStorage), skipHydration: true }));
};