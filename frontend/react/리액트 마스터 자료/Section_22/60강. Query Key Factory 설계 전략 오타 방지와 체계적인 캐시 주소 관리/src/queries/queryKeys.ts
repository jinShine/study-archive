/**
 * [원칙] 중앙 집중형 키 관리
 * 문자열 하드코딩을 방지하고 계층 구조를 형성합니다.
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};