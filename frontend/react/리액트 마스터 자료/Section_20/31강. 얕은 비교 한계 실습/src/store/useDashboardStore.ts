import { create } from 'zustand';

interface DashboardState {
  user: { name: string; role: string };
  count: number;
  increment: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  user: { name: 'James', role: 'Admin' },
  count: 0,
  // 카운트만 올리는 함수
  increment: () => set((state) => ({ count: state.count + 1 })),
}));