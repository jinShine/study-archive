export interface UserProfile { id: string; nickname: string; }
export function isUserProfile(data: any): data is UserProfile {
  return (data !== null && typeof data === 'object' && typeof data.id === 'string' && typeof data.nickname === 'string' && data.nickname.length >= 2);
}