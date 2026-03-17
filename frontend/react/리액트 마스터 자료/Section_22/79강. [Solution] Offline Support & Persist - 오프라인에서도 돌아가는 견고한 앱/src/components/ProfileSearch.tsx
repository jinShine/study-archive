import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser } from '../api/userApi';

export const ProfileSearch = () => {
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isFetching, fetchStatus, error } = useQuery({
    queryKey: ['github-user', searchQuery],
    queryFn: () => fetchGitHubUser(searchQuery),
    enabled: !!searchQuery,
    staleTime: 0,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') setSearchQuery(username);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" value={username} 
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="GitHub ID 입력 (예: octocat)"
          style={{ padding: '10px', width: '200px', marginRight: '10px' }}
        />
        <button 
          onClick={() => setSearchQuery(username)} 
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          검색
        </button>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'left', marginBottom: '10px' }}>
        <p><strong>엔진 상태 (fetchStatus):</strong> {fetchStatus}</p>
        <p><strong>통신 여부 (isFetching):</strong> {isFetching ? '🔄 요청 중...' : '✅ 대기 중'}</p>
        {error && <p style={{ color: 'red' }}>⚠️ 에러: {(error as Error).message}</p>}
      </div>

      {isFetching ? <p>데이터를 가져오는 중...</p> : data && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <img src={data.avatar_url} alt="avatar" style={{ width: '80px', borderRadius: '50%' }} />
          <h3>{data.name}</h3>
          <p>{data.bio}</p>
        </div>
      )}
    </div>
  );
};