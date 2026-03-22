import React from 'react';

export default async function ProductsPage() {
  // 의도적인 지연
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // [강의 포인트] 50% 확률로 에러 발생 시뮬레이션
  if (Math.random() < 0.5) {
    throw new Error('데이터베이스 연결에 실패했습니다! (의도된 런타임 에러)');
  }

  const products = [
    { id: 1, name: 'Premium Wireless Headphone', price: '$299', category: 'Electronics' },
    { id: 2, name: 'Ergonomic Office Chair', price: '$150', category: 'Furniture' },
  ];

  return (
    <div className="p-10">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">Best Sellers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
            <p className="text-blue-600 font-black mt-2">{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
