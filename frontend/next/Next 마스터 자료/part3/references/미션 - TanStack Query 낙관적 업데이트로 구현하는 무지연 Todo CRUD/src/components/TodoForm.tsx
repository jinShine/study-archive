'use client';
import { useState } from 'react';
import { useAddTodo } from '../hooks/useAddTodo';
export default function TodoForm() {
  const [text, setText] = useState('');
  const { mutate, isPending } = useAddTodo();
  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate(text, { onSuccess: () => setText('') }); }} className="flex gap-2 mb-8">
      <input value={text} onChange={e => setText(e.target.value)} disabled={isPending} className="flex-1 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="할 일을 입력하세요..." />
      <button disabled={isPending} className="bg-blue-600 text-white px-6 rounded-xl font-bold disabled:bg-blue-300">추가</button>
    </form>
  );
}
