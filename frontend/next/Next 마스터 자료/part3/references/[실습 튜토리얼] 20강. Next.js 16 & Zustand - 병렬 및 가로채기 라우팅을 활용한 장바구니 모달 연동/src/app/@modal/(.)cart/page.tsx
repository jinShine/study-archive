\'use client\';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/components/CartProvider';

export default function CartModal() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => router.back()}>
      <div className="bg-white p-10 rounded-3xl shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-light mb-6">Mini Modal Cart</h2>
        <p className="text-4xl font-thin text-indigo-600 mb-8">{items}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-zinc-900 text-white rounded-full">Close View</button>
      </div>
    </div>
  );
}