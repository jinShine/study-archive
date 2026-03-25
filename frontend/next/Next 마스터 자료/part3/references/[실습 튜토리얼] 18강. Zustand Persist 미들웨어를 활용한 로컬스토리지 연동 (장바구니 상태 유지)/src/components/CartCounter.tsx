'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from './CartProvider';

export default function CartCounter() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const add = useCartStore((state) => state.add);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="text-xl text-slate-300 font-bold">복구 중...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-7xl font-black text-indigo-600 mb-6">{items}</div>
      <button onClick={add} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-xl">
        상품 담기
      </button>
    </div>
  );
}