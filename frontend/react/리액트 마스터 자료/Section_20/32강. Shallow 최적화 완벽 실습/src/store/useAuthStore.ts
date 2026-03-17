import { create } from 'zustand';

interface User {
  name: string;
  role: string;
  id: string;
  lastActive: number;
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
}));
