'use client';
import { useQuery } from '@tanstack/react-query';

export default function Header() {
  const { data: user } = useQuery({
    queryKey: ['user', '123'],
    queryFn: async () => {
      return { name: window.currentName || '홍길동' };
    }
  });
  return (
    <header className="p-4 bg-white border-b shadow-sm mb-6">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <span className="font-bold text-blue-600 text-lg">마스터 클래스</span>
        <span className="text-gray-600">안녕하세요, {user?.name}님!</span>
      </div>
    </header>
  );
}