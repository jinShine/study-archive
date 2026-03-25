import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartState {
  items: number;
  add: () => void;
}

export const createCartStore = (initState: number = 0) => {
  return createStore<CartState>()(
    persist(
      (set) => ({
        items: initState,
        add: () => set((state) => ({ items: state.items + 1 })),
      }),
      {
        name: 'cart-storage',
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
      }
    )
  );
};