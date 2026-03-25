export const mockUsers: any[] = [];
export async function getUserFromDb(userId: string) {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return null;
  return user;
}