export interface SearchItem {
  id: number;
  title: string;
}

/**
 * 고통을 유발하기 위한 느린 서버 시뮬레이션 (1초 지연)
 */
export const fetchSearchResultsPainful = async (query: string): Promise<SearchItem[]> => {
  return new Promise((resolve) => {
    // 1초의 딜레이가 깜빡임과 레이아웃 이동을 유발하는 핵심입니다.
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