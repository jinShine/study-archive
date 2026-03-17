import { useState } from 'react';
import { fetchPostsManual } from '../api/mockApi';
import type { Post } from '../api/mockApi';

export default function ManualScroll() {
  // 🚩 [Pain 1] 상태 비대화: 데이터 하나를 위해 4개의 스위치가 필요합니다.
  const [allPosts, setAllPosts] = useState<Post[]>([]); 
  const [pageParam, setPageParam] = useState<number>(1); 
  const [hasNextPage, setHasNextPage] = useState<boolean>(true); 
  const [isFetching, setIsFetching] = useState<boolean>(false); 

  const fetchMorePosts = async () => {
    // 🚩 [Pain 2] 수동 가드 로직: 이걸 잊으면 데이터가 중복으로 쌓입니다.
    if (!hasNextPage || isFetching) return;

    setIsFetching(true);
    try {
      const newPosts = await fetchPostsManual(pageParam);

      if (newPosts.length === 0) {
        setHasNextPage(false);
      } else {
        // 🚩 [Pain 3] 불변성 지키기 노가다: 매번 거대한 배열을 새로 생성합니다.
        setAllPosts((prev) => [...prev, ...newPosts]);
        
        // 🚩 [Pain 4] 페이지 번호 수동 계산: 1만 틀려도 데이터가 건너뛰어집니다.
        setPageParam((prev) => prev + 1);
      }
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div style={{ border: '2px solid red', padding: '1rem', borderRadius: '12px' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {allPosts.map(post => (
          <li key={post.id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
            📜 {post.title}
          </li>
        ))}
      </ul>
      
      {hasNextPage ? (
        <button 
          onClick={fetchMorePosts} 
          disabled={isFetching} 
          style={{ 
            width: '100%', padding: '15px', cursor: 'pointer',
            backgroundColor: isFetching ? '#ccc' : '#ff4757',
            color: '#fff', border: 'none', borderRadius: '8px'
          }}
        >
          {isFetching ? '⏳ 서버에서 데이터를 긁어오는 중...' : '⬇️ 게시글 더 가져오기 (수동)'}
        </button>
      ) : (
        <p style={{ textAlign: 'center', color: '#888' }}>마지막 페이지입니다. 🏁</p>
      )}
    </div>
  );
}