/* [Copyright]: © nhcodingstudio 소유 */
import { create } from 'zustand';

interface UserStore {
  username: string;
  points: number;
  isLoggedIn: boolean;
  increasePoints: (amount: number) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  username: '아키텍트',
  points: 100,
  isLoggedIn: true,
  increasePoints: (amount) => set((state) => ({
    points: state.points + amount
  })),
  resetUser: () => {
    const currentPoints = get().points;
    if (currentPoints > 0) {
      console.log(`${get().username}님의 ${currentPoints}포인트 소멸`);
      set({ username: '', points: 0, isLoggedIn: false });
    }
  },
}));
