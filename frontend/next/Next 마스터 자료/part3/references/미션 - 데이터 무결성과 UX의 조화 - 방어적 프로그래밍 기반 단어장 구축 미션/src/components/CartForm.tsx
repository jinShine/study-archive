'use client';
import { useState } from 'react';
import { useAddToCart } from '@/hooks/useAddToCart';
export default function CartForm() {
  const [name, setName] = useState('');
  const { mutate, isPending } = useAddToCart();
  return (
    <form onSubmit={(e) => { e.preventDefault(); if(name.trim()) mutate(name, { onSuccess: () => setName('') }); }} className="flex gap-2 mb-8">
      <input value={name} onChange={e => setName(e.target.value)} disabled={isPending} className="flex-1 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="담을 상품명 입력..." />
      <button disabled={isPending} className="bg-blue-600 text-white px-6 rounded-xl font-bold disabled:bg-blue-300">담기</button>
    </form>
  );
}