export interface PostDto {
  id: number;
  title: string;
  content: string;
}

export interface Post extends PostDto {
  updatedAt: string;
}

/**
 * [원칙] 수정 API (1초 지연)
 * 서버의 DB는 업데이트하지만, 브라우저의 메모리(캐시)는 건드리지 않습니다.
 */
export const updatePostApi = async (updateData: PostDto): Promise<Post> => {
  console.log(`📡 [Network] 서버 DB 수정 완료: ${updateData.title}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...updateData, updatedAt: new Date().toISOString() });
    }, 1000);
  });
};