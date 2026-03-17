import { create } from 'zustand';
export const useZustandStore = create((set) => ({
  count: 0,
  inc: () => set((state: any) => ({ count: state.count + 1 })),
}));