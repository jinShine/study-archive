'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from './CartProvider';
export default function CartCounter() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const add = useCartStore((state) => state.add);
  const remove = useCartStore((state) => state.remove);
  const reset = useCartStore((state) => state.reset);
  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return <div className="w-full max-w-2xl h-[500px] bg-slate-200/50 rounded-[4rem] animate-pulse flex items-center justify-center"><span className="text-slate-400 text-2xl font-bold">SYSTem Restoration...</span></div>;
  return (
    <div className="flex flex-col items-center w-full max-w-2xl p-20 bg-white border border-slate-200 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all hover:scale-[1.01]">
      <h2 className="text-lg font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Shopping Archive</h2>
      <div className="text-[12rem] font-black text-indigo-600 leading-none mb-12 tabular-nums drop-shadow-2xl">{items}</div>
      <div className="flex gap-6 w-full">
        <button onClick={remove} className="flex-1 py-8 bg-slate-100 text-slate-600 rounded-3xl text-2xl font-black hover:bg-slate-200 transition-all active:scale-95">- 1</button>
        <button onClick={add} className="flex-[3] py-8 bg-indigo-600 text-white rounded-3xl text-2xl font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl">ADD TO CART</button>
      </div>
      <button onClick={reset} className="mt-12 text-lg text-slate-400 hover:text-rose-500 font-bold transition-colors underline underline-offset-8">Clear All Data</button>
    </div>
  );
}