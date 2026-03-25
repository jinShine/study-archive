'use client';
import { useQuery } from '@tanstack/react-query';

export default function HomePage() {
  const { data, isPending } = useQuery({
    queryKey: ['demo'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 1500));
      const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
      if (!res.ok) throw new Error('서버 데이터를 가져오지 못했습니다.');
      return res.json();
    },
    throwOnError: true
  });
  
  if (isPending) return <div className="p-10 animate-pulse bg-gray-200 rounded-xl">데이터 로딩 중...</div>;
  
  return (
    <main className="p-10 bg-white shadow-xl rounded-2xl">
      <h1 className="text-2xl font-bold">사용자 이름: {data.name}</h1>
      <p className="text-gray-500">이메일: {data.email}</p>
    </main>
  );
}