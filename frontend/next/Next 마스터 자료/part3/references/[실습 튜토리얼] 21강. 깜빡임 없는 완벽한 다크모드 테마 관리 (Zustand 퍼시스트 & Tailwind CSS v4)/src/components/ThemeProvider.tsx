'use client';

import { createContext, useEffect, useRef, use } from 'react';
import { createThemeStore, ThemeState } from '../store/themeStore';
import { useStore } from 'zustand';

export const ThemeContext = createContext<ReturnType<typeof createThemeStore> | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createThemeStore>>(null);

  if (!storeRef.current) {
    storeRef.current = createThemeStore();
  }

  useEffect(() => {
    const store = storeRef.current!;
    store.persist.rehydrate();

    const updateDom = (theme: ThemeState['theme']) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    updateDom(store.getState().theme);

    const unsubscribe = store.subscribe((state) => {
      updateDom(state.theme);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeContext value={storeRef.current}>
      {children}
    </ThemeContext>
  );
}

export function useThemeStore<T>(selector: (state: ThemeState) => T): T {
  const store = use(ThemeContext);
  if (!store) throw new Error('ThemeProvider가 존재하지 않습니다.');
  return useStore(store, selector);
}
