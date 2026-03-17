import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUser } from '../api/userApi';

export const ProfileSearch = () => {
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isFetching, fetchStatus } = useQuery({
    queryKey: ['github-user', searchQuery],
    queryFn: () => fetchGitHubUser(searchQuery),
    enabled: !!searchQuery,
    staleTime: 0,
  });

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHub ID 입력 (예: octocat)"
          style={{ padding: '10px', width: '200px', marginRight: '10px' }}
        />
        <button 
          onClick={() => setSearchQuery(username)}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          검색
        </button>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'left' }}>
        <p><strong>엔진 상태 (fetchStatus):</strong> 
          <span style={{ color: fetchStatus === 'paused' ? 'red' : 'blue' }}> {fetchStatus}</span>
        </p>
        <p><strong>통신 중 여부 (isFetching):</strong> {isFetching ? '🔄 요청 중...' : '✅ 대기 중'}</p>
        
        {fetchStatus === 'paused' && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            🚫 오프라인 상태라 요청이 멈췄습니다! (무한 로딩 발생)
          </p>
        )}
      </div>

      {data && !isFetching && (
        <div style={{ marginTop: '20px' }}>
          <img src={data.avatar_url} alt="avatar" style={{ width: '80px', borderRadius: '50%' }} />
          <h3>{data.name}</h3>
          <p>{data.bio}</p>
        </div>
      )}
    </div>
  );
};