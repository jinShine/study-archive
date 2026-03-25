'use client';
import { createContext, useState, use } from 'react';
import { createAlertStore, type AlertState } from '../store/alertStore';
import { useStore } from 'zustand';
export const AlertContext = createContext<ReturnType<typeof createAlertStore> | null>(null);
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => createAlertStore());
  return <AlertContext value={store}>{children}</AlertContext>;
}
export function useAlertStore<T>(selector: (state: AlertState) => T): T {
  const store = use(AlertContext);
  if (!store) throw new Error('AlertProvider missing!');
  return useStore(store, selector);
}