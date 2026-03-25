export const mockUsers = [
  { id: '1', name: '이태호', accountBalance: '500,000,000원' }
];
export async function getUserFromDb(userId: string) {
  return mockUsers.find((u) => u.id === userId) || null;
}
