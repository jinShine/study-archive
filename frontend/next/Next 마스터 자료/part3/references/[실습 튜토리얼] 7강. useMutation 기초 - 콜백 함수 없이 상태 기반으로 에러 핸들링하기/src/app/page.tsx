'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export default function HomePage() {
  const [name, setName] = useState('');

  const { mutate, isPending, isError, error, isSuccess } = useMutation({
    mutationFn: async (newName: string) => {
      // 1.2초간 서버 통신 시뮬레이션
      await new Promise(r => setTimeout(r, 1200));
      return { success: true };
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(name);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white shadow-2xl rounded-2xl w-80">
      <h2 className="text-xl font-bold mb-4 text-gray-800">이름 수정</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isPending}
        className="w-full border p-2 rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
        placeholder="새 이름을 입력하세요"
      />
      <button
        disabled={isPending}
        className={`w-full p-2 rounded-lg text-white transition-all ${isPending ? 'bg-gray-400' : 'bg-blue-600'}`}
      >
        {isPending ? '처리 중...' : '저장하기'}
      </button>
      {isSuccess && <p className="mt-4 text-green-600 text-sm text-center">성공적으로 반영되었습니다!</p>}
      {isError && <p className="mt-4 text-red-600 text-sm text-center">에러 발생: {error.message}</p>}
    </form>
  );
}