export interface GitHubUser {
  id: number;
  name: string;
  bio: string;
  avatar_url: string;
}

export const fetchGitHubUser = async (username: string): Promise<GitHubUser> => {
  if (!username) throw new Error("아이디를 입력해주세요.");
  
  print(`🛰️ GitHub 서버에 '${username}'의 데이터를 요청합니다...`);
  const response = await fetch(`https://api.github.com/users/${username}`);
  
  if (!response.ok) throw new Error('유저를 찾을 수 없거나 네트워크 에러입니다.');
  
  return response.json();
};

function print(msg: string) { console.log(msg); }