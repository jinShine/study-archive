'use client';
import { useQuery } from '@tanstack/react-query';
import TodoItem from '@/components/TodoItem';

if (typeof window !== 'undefined' && !window.hasOwnProperty('mockDB')) {
  (window as any).mockDB = [
    { id: 1, text: 'Next.js 16 마스터하기', completed: false },
    { id: 2, text: 'TanStack Query 낙관적 업데이트 실습', completed: false },
    { id: 3, text: 'revalidatePath 이해하기', completed: false },
  ];
}

export default function TodoPage() {
  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => (window as any).mockDB,
  });

  if (isLoading) return <div className="p-20 text-center font-medium">데이터 로딩 중...</div>;

  return (
    <div className="max-w-md mx-auto mt-24 p-8 bg-white shadow-2xl rounded-3xl border border-slate-100">
      <h1 className="text-2xl font-bold mb-8 text-slate-800 text-center">나의 스마트 할 일 목록</h1>
      <ul className="space-y-1">
        {todos?.map((todo: any) => <TodoItem key={todo.id} todo={todo} />)}
      </ul>
      <p className="mt-8 text-xs text-slate-400 text-center leading-relaxed">
        체크박스를 클릭해 보세요. 서버 응답 전 즉시 반응하며,<br/>실패 시 자동으로 복구됩니다.
      </p>
    </div>
  );
}