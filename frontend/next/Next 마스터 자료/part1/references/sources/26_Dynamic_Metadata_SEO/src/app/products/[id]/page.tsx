import { Metadata } from 'next';
import React from 'react';

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * [강의 포인트 1] 동적 메타데이터 생성
 * - 상품명에 따라 브라우저 탭 제목과 검색 결과 설명을 변경합니다.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // Next.js는 이 fetch 요청을 아래 컴포넌트의 fetch와 합쳐서 단 '한 번'만 수행합니다.
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  const product = await res.json();

  return {
    title: `${product.title} | Nyan-Match Market`,
    description: product.body.slice(0, 100) + "...",
    
    // [강의 포인트 2] Open Graph (카톡, 페이스북 공유용)
    openGraph: {
      title: product.title,
      description: '지금 Nyan-Match Market에서 이 상품을 확인해보세요!',
      url: `https://my-shop.com/products/${id}`,
      siteName: 'Nyan-Match Market',
      images: [
        {
          url: 'https://nextjs.org/og.png', // 실제 서비스에선 상품 이미지 URL 사용
          width: 1200,
          height: 630,
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  const product = await res.json();

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-8">
      <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="flex items-center gap-2 mb-8 text-xs font-black text-indigo-500 uppercase tracking-widest">
           <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
           SEO Optimized Page
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-6 capitalize leading-tight">
          {product.title}
        </h1>
        
        <div className="prose prose-slate lg:prose-xl">
          <p className="text-slate-600 leading-relaxed">
            {product.body}
          </p>
        </div>
        
        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-sm text-blue-800">
           <strong>💡 SEO 확인 방법:</strong> <br/>
           브라우저 탭의 제목이 상품명으로 바뀌었는지 확인하고, <br/>
           '페이지 소스 보기(Ctrl+U)'를 눌러 <code>&lt;title&gt;</code>과 <code>&lt;meta&gt;</code> 태그를 확인하세요.
        </div>
      </div>
    </div>
  );
}
