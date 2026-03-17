import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSearchResults } from '../api/searchApi';
import type { SearchItem } from '../api/searchApi';

export default function SearchList() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isPlaceholderData, isFetching, isLoading, isError } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => fetchSearchResults(searchTerm),
    // ✅ TanStack Query v5: 새로운 데이터가 오기 전까지 이전 데이터를 유지합니다.
    placeholderData: keepPreviousData,
  });

  const displayData = searchTerm === "" ? [] : data;

  if (isError) return <div style={{ color: 'red', padding: '10px' }}>❌ 데이터 로드 실패</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px', background: '#fff' }}>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="검색어를 입력하세요 (예: React)..."
        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ccc' }}
      />

      <div style={{ position: 'relative', minHeight: '250px', backgroundColor: '#fdfdfd', padding: '15px', borderRadius: '8px' }}>
        {isFetching && (
          <div style={{ color: '#007bff', fontSize: '0.85rem', marginBottom: '10px', fontWeight: 'bold' }}>
            🛰️ 최신 데이터를 업데이트 중입니다...
          </div>
        )}

        <ul style={{
          opacity: isPlaceholderData ? 0.4 : 1, // 대역 데이터일 때 시각적 피드백
          transition: 'opacity 0.2s ease-in-out',
          padding: 0,
          listStyle: 'none'
        }}>
          {displayData?.map((item: SearchItem) => (
            <li key={item.id} style={{ 
              padding: '12px', 
              borderBottom: '1px solid #eee',
              color: isPlaceholderData ? '#888' : '#333' 
            }}>
              🔍 {item.title}
            </li>
          ))}
        </ul>

        {isLoading && searchTerm !== "" && !isPlaceholderData && (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>첫 검색을 시작합니다...</div>
        )}
      </div>
    </div>
  );
}