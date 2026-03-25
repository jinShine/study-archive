import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage } from 'zustand/middleware';
import { syncCartWithDatabase } from '../actions/cartActions';
export interface CartState { items: number; add: () => Promise<void>; }
export const createCartStore = (initState = 0) => {
  return createStore<CartState>()(persist((set, get) => ({
    items: initState,
    add: async () => {
      const prev = get().items;
      set({ items: prev + 1 });
      const res = await syncCartWithDatabase(prev + 1);
      if (!res.success) set((state) => ({ items: state.items - 1 }));
    },
  }), { name: 'cart-storage', storage: createJSONStorage(() => localStorage), skipHydration: true }));
};