export interface SearchItem {
  id: number;
  title: string;
}

/**
 * 서버 검색 시뮬레이션 (의도적인 1초 지연)
 */
export const fetchSearchResults = async (query: string): Promise<SearchItem[]> => {
  return new Promise((resolve) => {
    // 레이아웃 이동을 관찰하기 위해 1초의 딜레이를 줍니다.
    setTimeout(() => {
      if (!query) return resolve([]);
      
      const results = Array.from({ length: 5 }, (_, i) => ({
        id: Math.random(), 
        title: `'${query}'에 대한 검색 결과 ${i + 1}`
      }));
      resolve(results);
    }, 1000); 
  });
};