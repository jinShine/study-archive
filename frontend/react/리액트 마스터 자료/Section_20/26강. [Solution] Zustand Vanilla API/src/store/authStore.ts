/* [Copyright]: © nhcodingstudio 소유 */
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';

interface AuthStore {
  token: string | null;
  isLoggedIn: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

export const authStore = createStore<AuthStore>((set) => ({
  token: 'initial-token-123',
  isLoggedIn: true,
  setToken: (token) => set({ token, isLoggedIn: true }),
  logout: () => set({ token: null, isLoggedIn: false }),
}));

export const useAuth = () => useStore(authStore);