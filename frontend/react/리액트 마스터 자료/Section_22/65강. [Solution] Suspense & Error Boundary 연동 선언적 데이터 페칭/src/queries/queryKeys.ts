export const userKeys = {
  all: ['users'] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
};