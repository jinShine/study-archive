import { createStore } from 'zustand/vanilla';

export interface CartState {
  items: number;
  add: () => void;
}

export const createCartStore = (initState: number = 0) => {
  return createStore<CartState>()((set) => ({
    items: initState,
    add: () => set((state) => ({ items: state.items + 1 })),
  }));
};