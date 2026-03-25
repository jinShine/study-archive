export const mockUsers = [
  { id: '1', name: '이태호', email: 'test@test.com', role: 'admin' }
];
export async function getUserFromDb(userId: string) {
  return mockUsers.find((u) => u.id === userId) || null;
}
