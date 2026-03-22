'use client';
import { useState } from 'react';
export default function AddToCart() {
  const [count, setCount] = useState(0);
  return (
    <div className="mt-10 flex gap-6 items-center">
      <button onClick={() => setCount(count + 1)} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-xs">ADD TO CART</button>
      <span className="font-black text-2xl">{count}</span>
    </div>
  );
}
