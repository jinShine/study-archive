'use client';
import { useTransition } from 'react';
import { useCartStore } from './CartProvider';
export default function AddToCartButton() {
  const add = useCartStore((state) => state.add);
  const items = useCartStore((state) => state.items);
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex flex-col items-center gap-8 p-20 bg-white rounded-[4rem] shadow-2xl">
      <div className="text-[12rem] font-black text-indigo-600 leading-none">{items}</div>
      <button onClick={() => startTransition(add)} className={`px-12 py-6 rounded-3xl font-black text-xl transition-all ${isPending ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-700'}`}>
        {isPending ? 'SYNCING DB...' : 'ADD TO CART'}
      </button>
    </div>
  );
}