'use client';

import { useQuery } from '@tanstack/react-query';

export default function HomePage() {
  const { data, isPending } = useQuery({
    queryKey: ['test-connection'],
    queryFn: async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      if (!res.ok) throw new Error('네트워크 응답에 문제가 있습니다.');
      return res.json();
    }
  });

  return (
    <main className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-3xl text-blue-700 mb-6 tracking-tight">11강 프로바이더 셋업 테스트</h1>
      <p className="text-gray-600 mb-4">아래에 데이터가 보이고 우측 하단에 꽃 모양 아이콘이 있다면 셋업 성공입니다!</p>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
        {isPending ? (
          <p className="text-blue-500 animate-pulse">중앙 주방에서 데이터를 가져오는 중입니다...</p>
        ) : (
          <pre className="text-sm text-gray-800 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}