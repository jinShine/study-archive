export interface GitHubUser {
  id: number;
  name: string;
  bio: string;
  avatar_url: string;
}

export const fetchGitHubUser = async (username: string): Promise<GitHubUser> => {
  if (!username) throw new Error("아이디를 입력해주세요.");
  
  const response = await fetch(`https://api.github.com/users/${username}`);
  
  if (!response.ok) {
    throw new Error('유저를 찾을 수 없거나 API 요청 제한이 초과되었습니다.');
  }
  
  return response.json();
};