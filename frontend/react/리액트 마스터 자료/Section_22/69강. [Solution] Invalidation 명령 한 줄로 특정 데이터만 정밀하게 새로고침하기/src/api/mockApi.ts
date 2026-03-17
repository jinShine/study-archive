export interface User {
  id: number;
  name: string;
}

// 58강 Key Factory 패턴: 무효화의 범위를 결정하는 설계도입니다.
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
};

// 유저 수정 API (0.5초 지연)
export const updateUserApi = async (updatedUser: User): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📡 [Network] 서버 데이터 수정 완료: ${updatedUser.name}`);
      resolve(updatedUser);
    }, 500);
  });
};

// 유저 조회 API (무효화 후 자동 호출될 함수)
export const fetchUserApi = async (id: number): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: "시니어 개발자 (수정 전)" });
    }, 300);
  });
};