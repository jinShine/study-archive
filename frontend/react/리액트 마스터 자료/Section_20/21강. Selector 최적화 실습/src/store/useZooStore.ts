/* [Copyright]: © nhcodingstudio 소유 */
import { create } from 'zustand';

interface ZooStore {
  bears: number; fish: number;
  addBear: () => void; addFish: () => void;
}

export const useZooStore = create<ZooStore>((set) => ({
  bears: 0, fish: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  addFish: () => set((state) => ({ fish: state.fish + 1 })),
}));