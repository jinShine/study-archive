import { createStore } from 'zustand/vanilla';
export interface AlertState {
  message: string;
  isVisible: boolean;
  showAlert: (msg: string) => void;
  hideAlert: () => void;
}
export const createAlertStore = (initialMsg: string = '') => {
  return createStore<AlertState>()((set) => ({
    message: initialMsg,
    isVisible: false,
    showAlert: (msg) => set({ message: msg, isVisible: true }),
    hideAlert: () => set({ isVisible: false }),
  }));
};