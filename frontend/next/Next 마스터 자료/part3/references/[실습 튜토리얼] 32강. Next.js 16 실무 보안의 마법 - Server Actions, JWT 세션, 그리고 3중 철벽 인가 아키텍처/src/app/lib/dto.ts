import 'server-only';
import { getUser } from './dal';

function canSeePhoneNumber(viewer: any, targetUserTeam: string) {
  return viewer.role === 'admin' || viewer.team === targetUserTeam;
}

export async function getProfileDTO() {
  const user = await getUser();
  if (!user) return null;
  return {
    name: user.name,
    email: user.email,
    phoneNumber: canSeePhoneNumber(user, user.team) ? user.phoneNumber : null,
  };
}