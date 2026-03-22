import React from 'react';
import LikeButton from './like-button';
import ClientCard from '@/components/ClientCard';

export default function ProductsPage() {
  const products = [
    { id: 1, name: 'Premium Headphone', price: '$299', category: 'Electronics' },
    { id: 2, name: 'Office Chair', price: '$150', category: 'Furniture' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Composition Pattern Lab</h1>
          <p className="text-slate-500 mt-2 font-medium">서버와 클라이언트의 완벽한 조립법</p>
        </header>

        {/* 실습 1: 나뭇잎 패턴 (Leaf Component) */}
        <section className="space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">1. Leaf Component Pattern</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-blue-600 font-bold text-xs mb-1">{p.category}</p>
                  <h3 className="text-xl font-black text-slate-800">{p.name}</h3>
                </div>
                <LikeButton />
              </div>
            ))}
          </div>
        </section>

        {/* 실습 2: 합성 패턴 (Composition Pattern) */}
        <section className="space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">2. Composition (Children) Pattern</h2>
          <ClientCard>
            {/* [강의 포인트] 클라이언트 컴포넌트 내부에 서버 컴포넌트 로직을 안전하게 주입 */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">이 영역은 서버에서 렌더링되었습니다.</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                데이터베이스 조회나 무거운 서버 로직이 들어가는 부분입니다. <br/>
                클라이언트 컴포넌트의 'children'으로 전달되어 <strong>잉크(Client)에 물들지 않은 깨끗한 상태</strong>를 유지합니다.
              </p>
              <ul className="text-xs font-mono text-indigo-500 space-y-1">
                <li>✅ No 'use client' in this content</li>
                <li>✅ Zero JS bundle for this list</li>
              </ul>
            </div>
          </ClientCard>
        </section>
      </div>
    </div>
  );
}
