export const generateUsers = () => {
  return Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `User_${i}_${Math.random().toString(36).substring(7)}`,
    age: Math.floor(Math.random() * 50) + 20
  }));
};