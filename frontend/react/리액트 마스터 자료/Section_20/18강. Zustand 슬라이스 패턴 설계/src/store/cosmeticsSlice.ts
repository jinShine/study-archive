/* [Copyright]: © nhcodingstudio 소유 */
import type { StateCreator } from 'zustand';
import type { CosmeticsSlice, DepartmentStore } from './types';

export const createCosmeticsSlice: StateCreator<
  DepartmentStore, [], [], CosmeticsSlice
> = (set) => ({
  perfumeStock: 100,
  sellPerfume: () => set((state) => ({ perfumeStock: state.perfumeStock - 1 })),
});