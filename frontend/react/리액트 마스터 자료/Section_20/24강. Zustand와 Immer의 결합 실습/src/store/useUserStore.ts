/* [Copyright]: © nhcodingstudio 소유 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UserStore {
  user: {
    profile: {
      name: string;
      settings: { theme: string; notifications: boolean; };
    };
  };
  updateTheme: (newTheme: string) => void;
  toggleNotifications: () => void;
}

export const useUserStore = create<UserStore>()(
  immer((set) => ({
    user: {
      profile: {
        name: 'React Architect',
        settings: { theme: 'light', notifications: true },
      },
    },
    updateTheme: (newTheme) =>
      set((draft) => {
        draft.user.profile.settings.theme = newTheme;
      }),
    toggleNotifications: () =>
      set((draft) => {
        draft.user.profile.settings.notifications = !draft.user.profile.settings.notifications;
      }),
  }))
);