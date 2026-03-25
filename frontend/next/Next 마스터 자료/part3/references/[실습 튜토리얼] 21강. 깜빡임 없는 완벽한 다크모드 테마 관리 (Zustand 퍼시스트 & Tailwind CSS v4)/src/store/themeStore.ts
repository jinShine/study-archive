import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const createThemeStore = () => {
  return createStore<ThemeState>()(
    persist(
      (set) => ({
        theme: 'system',
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'theme-storage',
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,
      }
    )
  );
};
