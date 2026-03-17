import { useState, useEffect } from 'react';
import { fetchUserData } from '../api/mockApi';
import type { UserData } from '../api/mockApi';

export default function OldUserProfile({ userId }: { userId: number }) {
  const [data, setData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false; 
    setIsLoading(true);

    fetchUserData(userId)
      .then((res: UserData) => {
        if (!isCancelled) { 
          setData(res); 
          setError(null); 
        }
      })
      .catch((err: Error) => { 
        if (!isCancelled) setError(err); 
      })
      .finally(() => { 
        if (!isCancelled) setIsLoading(false); 
      });

    return () => { isCancelled = true; }; 
  }, [userId]);

  if (isLoading) return <div>⌛ (Old) 로딩 중...</div>;
  if (error) return <div>❌ 에러: {error.message}</div>;

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h4>과거 방식 (useEffect)</h4>
      <p>이름: {data?.name}</p>
    </div>
  );
}