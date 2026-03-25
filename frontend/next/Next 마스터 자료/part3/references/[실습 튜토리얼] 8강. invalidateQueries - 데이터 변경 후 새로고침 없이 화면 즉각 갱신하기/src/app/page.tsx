'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';

declare global { interface Window { currentName: string; } }

export default function HomePage() {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (newName: string) => {
      await new Promise(r => setTimeout(r, 1000));
      window.currentName = newName;
      return { name: newName };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', '123'] });
    }
  });

  return (
    <main>
      <Header />
      <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">프로필 수정</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="새 이름을 입력하세요"
        />
        <button
          onClick={() => mutate(name)}
          disabled={isPending}
          className="w-full bg-blue-600 text-white p-3 rounded-xl disabled:bg-blue-300 transition-colors font-semibold"
        >
          {isPending ? '동기화 중...' : '이름 즉시 변경'}
        </button>
        <p className="mt-6 text-sm text-gray-400 text-center">
          버튼을 누르면 상단 헤더의 이름이 새로고침 없이 바뀝니다.
        </p>
      </div>
    </main>
  );
}