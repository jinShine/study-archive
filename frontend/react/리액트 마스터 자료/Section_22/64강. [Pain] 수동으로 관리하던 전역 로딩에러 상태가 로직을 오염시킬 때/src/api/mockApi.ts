export interface UserData {
  id: number;
  name: string;
}

/**
 * [원칙] 수동 관리의 고통을 체감하기 위한 지연 API
 * 1.5초의 지연과 10%의 에러 확률을 시뮬레이션합니다.
 */
export const api = {
  get: async <T>(url: string): Promise<{ data: T }> => {
    console.log(`📡 [Network] ${url} 요청 시작...`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          reject(new Error("서버 연결이 원활하지 않습니다."));
        }
        resolve({ data: { id: 1, name: "과거의 나 (수동 관리)" } as T });
      }, 1500);
    });
  }
};