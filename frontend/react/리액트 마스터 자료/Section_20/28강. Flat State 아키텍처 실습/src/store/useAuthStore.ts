import { create } from 'zustand';

interface AuthStore { username: string; }

export const useAuthStore = create<AuthStore>(() => ({ username: '시니어 아키텍트' }));