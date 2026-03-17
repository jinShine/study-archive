export interface Todo { id: number; text: string; }

export const todoKeys = { all: ['todos'] as const };

/**
 * [원칙] 낙관적 업데이트 테스트용 API
 * 1초 지연과 30%의 실패 확률을 통해 롤백을 관찰합니다.
 */
export const postTodoApi = async (newTodo: Todo): Promise<Todo> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.3) reject(new Error("서버 저장 실패!"));
      resolve(newTodo);
    }, 1000);
  });
};