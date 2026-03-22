import React from 'react';

export default async function ProductsPage() {
  // [강의 포인트] 실제 DB 조회가 느린 상황을 시뮬레이션 (3초 지연)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const products = [
    { id: 1, name: 'Premium Wireless Headphone', price: '$299', category: 'Electronics' },
    { id: 2, name: 'Ergonomic Office Chair', price: '$150', category: 'Furniture' },
    { id: 3, name: 'Mechanical Keyboard', price: '$120', category: 'Electronics' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tight">Best Sellers</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <span className="text-blue-600 font-black text-xs uppercase tracking-widest">{p.category}</span>
              <h3 className="text-xl font-bold mt-2 mb-1 text-slate-800">{p.name}</h3>
              <p className="text-slate-500 font-bold mb-6">{p.price}</p>
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
