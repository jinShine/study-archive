import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSearchResultsPainful } from '../api/searchApi';

export default function SearchList() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ['search-pain', searchTerm],
    queryFn: () => fetchSearchResultsPainful(searchTerm),
    // 일부러 placeholderData를 비워두어 고통을 극대화합니다.
  });

  return (
    <div style={{ padding: '20px', border: '2px solid red', borderRadius: '12px', background: '#fff' }}>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="검색어를 입력하세요 (깜빡임을 느껴보세요)..."
        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', marginBottom: '20px' }}
      />

      <div style={{ position: 'relative', border: '1px solid #eee', padding: '10px' }}>
        {/* 🚩 고통 포인트: isLoading일 때 리스트를 아예 지워버립니다. */}
        {isLoading ? (
          <div style={{ height: '40px', textAlign: 'center', lineHeight: '40px', color: 'red' }}>
            ⌛ 서버 응답 대기 중 (1초 동안 리스트 실종)...
          </div>
        ) : (
          <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
            {data?.map((item) => (
              <li key={item.id} style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#333', 
        color: '#fff',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        🚩 저는 하단 푸터입니다. 리스트가 사라질 때마다 제가 위로 튀어 올라갑니다!
      </footer>
    </div>
  );
}