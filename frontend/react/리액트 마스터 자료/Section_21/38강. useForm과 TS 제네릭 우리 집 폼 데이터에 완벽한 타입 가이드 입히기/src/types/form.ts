export interface UserProfileForm {
  userName: string;
  userEmail: string;
  userAge: number;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}