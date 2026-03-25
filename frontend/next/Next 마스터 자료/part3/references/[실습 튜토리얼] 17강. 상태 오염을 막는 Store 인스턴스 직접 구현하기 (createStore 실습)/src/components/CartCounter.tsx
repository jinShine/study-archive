'use client';

import { useCartStore } from './CartProvider';

export default function CartCounter() {
  const items = useCartStore((state) => state.items);
  const add = useCartStore((state) => state.add);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-5xl font-bold text-indigo-600">{items}</div>
      <button
        onClick={add}
        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
      >
        장바구니 담기
      </button>
    </div>
  );
}