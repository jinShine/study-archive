import React from 'react';

/**
 * [강의 포인트 1] 정적 파라미터 생성 함수
 * - 빌드 시 실행되어 [{id: '1'}, {id: '2'}] 형태의 명단을 반환합니다.
 */
export async function generateStaticParams() {
  // 실습을 위해 상위 5개의 게시글 ID만 미리 정적으로 생성하도록 명령합니다.
  const posts = await fetch('https://jsonplaceholder.typicode.com/posts').then((res) =>
    res.json()
  );

  // 반드시 문자열 배열 형태의 객체여야 합니다.
  return posts.slice(0, 5).map((post: { id: number }) => ({
    id: String(post.id),
  }));
}

/**
 * [강의 포인트 2] 동적 파라미터 허용 여부
 * - true(기본값): 명단에 없어도 즉석에서 생성 시도
 * - false: 명단에 없는 ID는 즉시 404 처리
 */
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  // 이 fetch는 빌드 시점에 이미 실행되어 결과가 HTML 파일에 박제(Static)됩니다.
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);

  if (!res.ok) return <div className="p-20 text-center">상품 정보를 찾을 수 없습니다.</div>;

  const product = await res.json();

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-8">
      <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100">
        <div className="flex items-center gap-2 mb-8 text-xs font-black text-indigo-500 uppercase tracking-widest">
           <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
           Static Pre-rendered Page (ID: {id})
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-6 capitalize leading-tight">
          {product.title}
        </h1>
        
        <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-600 leading-relaxed text-lg">
            {product.body}
          </p>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center text-sm text-slate-400">
           <p>※ 이 페이지는 빌드 시점에 미리 생성된 HTML 파일입니다.</p>
           <button className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl">구매하기</button>
        </div>
      </div>
    </div>
  );
}
