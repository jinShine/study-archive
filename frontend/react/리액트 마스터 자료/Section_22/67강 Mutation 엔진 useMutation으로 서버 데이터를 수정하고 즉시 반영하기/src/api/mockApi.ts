export interface Post {
  id: number;
  name: string;
  title: string;
  content: string;
}

export interface UpdatePostDto {
  id: number;
  title: string;
  content: string;
}

/**
 * [원칙] 서버의 데이터를 실제로 변형(Mutation)하는 함수
 * 2초의 지연과 10%의 실패 확률을 시뮬레이션합니다.
 */
export const updatePost = async (newPost: UpdatePostDto): Promise<Post> => {
  console.log(`📡 [Network] 게시글 수정 요청 중: ${newPost.title}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 10% 확률로 에러 발생 시뮬레이션
      if (Math.random() < 0.1) reject(new Error("서버에서 수정을 거절했습니다."));
      resolve({
        id: newPost.id,
        name: "시니어 아키텍트",
        title: newPost.title,
        content: newPost.content
      });
    }, 2000);
  });
};