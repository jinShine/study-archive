export interface Post { id: number; title: string; body: string; }

export const fetchPostById = async (id: number): Promise<Post> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: `${id}번째 글 상세 제목`,
        body: `이 내용은 ${id}번 글의 상세 본문입니다. 프리페칭 덕분에 로딩 없이 보입니다.`
      });
    }, 500);
  });
};

export const fetchPosts = async (page: number) => {
  return new Promise<{ posts: Post[]; nextCursor: number | undefined }>((resolve) => {
    setTimeout(() => {
      const posts = Array.from({ length: 10 }, (_, i) => ({
        id: page * 10 + i + 1,
        title: `${page * 10 + i + 1}번째 게시글 제목`,
        body: ""
      }));
      resolve({ posts, nextCursor: page < 5 ? page + 1 : undefined });
    }, 500);
  });
};