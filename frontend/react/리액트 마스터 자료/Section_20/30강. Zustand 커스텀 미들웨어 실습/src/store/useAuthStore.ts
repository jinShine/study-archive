import { create } from 'zustand';
import { logger } from './middleware/logger';

interface AuthState {
  user: string | null;
  login: (name: string) => void;
}

export const useAuthStore = create<AuthState>()(
  logger(
    (set) => ({
      user: null,
      login: (name) => set({ user: name }),
    }),
    'AuthStore'
  )
);