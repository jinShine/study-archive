import React from 'react';
import LikeButton from '../_components/LikeButton'; // 이전 강의 컴포넌트 재사용

// [강의 포인트] 외부 API에서 받아올 데이터 구조 정의
interface Post {
  id: number;
  title: string;
  body: string;
}

/**
 * ProductsPage: 서버에서 데이터를 직접 가져오는 비동기 컴포넌트
 */
export default async function ProductsPage() {
  // 1. 서버 사이드 데이터 페칭 (서버 대 서버 통신)
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');

  // 2. 에러 처리 (상태 코드가 200번대가 아닐 경우)
  if (!res.ok) {
    // 여기서 던진 에러는 error.tsx가 낚아챕니다.
    throw new Error('서버로부터 데이터를 불러오지 못했습니다.');
  }

  // 3. JSON 파싱 (비동기)
  const posts: Post[] = await res.json();

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Real-time Products</h1>
          <p className="text-slate-500 font-medium mt-2 italic">이 목록은 서버에서 직접 호출한 실제 API 데이터입니다.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 상위 6개 포스트만 상품처럼 출력 */}
          {posts.slice(0, 6).map((post) => (
            <div key={post.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Hot Item
                </span>
                <LikeButton />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 line-clamp-1 mb-2 capitalize">
                {post.title}
              </h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                {post.body}
              </p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-2xl font-black text-slate-900">
                  ${100 + post.id * 10}
                </span>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200">
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
