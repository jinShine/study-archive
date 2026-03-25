'use client';
import { useCart } from '@/hooks/useCart';
import { useUpdateQuantity } from '@/hooks/useUpdateQuantity';
import { useRemoveFromCart } from '@/hooks/useRemoveFromCart';

export default function CartList() {
  const { data: cart, isPending } = useCart();
  const { mutate: updateQuantity, isError, error } = useUpdateQuantity();
  const { mutate: removeFromCart } = useRemoveFromCart();

  if (isPending) return <div className="space-y-3">{[1,2,3].map(n => <div key={n} className="h-16 bg-gray-200 animate-pulse rounded-xl"></div>)}</div>;
  
  return (
    <ul className="space-y-3">
      {cart?.map(item => (
        <li key={item.id} className="p-4 bg-white border rounded-xl flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
          <span className="text-gray-800 font-bold">{item.name}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
              <button 
                onClick={() => updateQuantity({...item, quantity: item.quantity - 1})} 
                disabled={item.quantity <= 1}
                className="px-3 py-1 text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
              >-</button>
              <span className="px-4 py-1 font-medium bg-white border-x min-w-[3rem] text-center">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity({...item, quantity: item.quantity + 1})} 
                className="px-3 py-1 text-gray-600 hover:bg-gray-200 font-bold"
              >+</button>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm">삭제</button>
          </div>
        </li>
      ))}
      {isError && <p className="text-red-500 text-sm font-bold mt-2">🚨 {error.message}</p>}
    </ul>
  );
}