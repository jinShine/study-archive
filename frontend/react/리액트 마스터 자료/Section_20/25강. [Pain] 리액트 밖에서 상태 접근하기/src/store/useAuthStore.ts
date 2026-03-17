/* [Copyright]: © nhcodingstudio 소유 */
import { create } from 'zustand';
// 인증 토큰을 관리하는 단순한 스토어입니다.
export const useAuthStore = create(() => ({ token: 'super-secret-key-2026' }));