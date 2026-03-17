/* [Copyright]: © nhcodingstudio 소유 */
import { create } from 'zustand';

interface SimpleStore {
  count: number;
  message: string;
  increase: () => void;
  updateMessage: (nextMessage: string) => void;
  reset: () => void;
}

export const useSimpleStore = create<SimpleStore>((set) => ({
  count: 0,
  message: '안녕하세요!',
  increase: () => set((state) => ({ count: state.count + 1 })),
  updateMessage: (nextMessage) => set({ message: nextMessage }),
  reset: () => set({ count: 0, message: '초기화됨' }),
}));