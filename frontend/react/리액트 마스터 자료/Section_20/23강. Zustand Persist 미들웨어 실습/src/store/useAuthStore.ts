/* [Copyright]: © nhcodingstudio 소유 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  isLoggedIn: boolean;
  username: string;
  login: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      username: '',
      login: (name) => set({ isLoggedIn: true, username: name }),
      logout: () => set({ isLoggedIn: false, username: '' }),
    }),
    { name: 'user-auth-storage' }
  )
);