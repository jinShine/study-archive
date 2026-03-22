import React from 'react';

interface Post { id: number; title: string; body: string; }

export default async function NewsPage() {
  // 실제 API 통신 (Server Component Fetching)
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  
  if (!res.ok) throw new Error('API 통신 장애 발생');
  
  const posts: Post[] = await res.json();

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <h1 className="text-5xl font-black mb-12 italic tracking-tighter">LATEST NEWS</h1>
      <div className="grid grid-cols-3 gap-8">
        {posts.slice(0, 9).map(post => (
          <div key={post.id} className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold mb-4 line-clamp-2">{post.title}</h3>
            <p className="text-slate-400 text-sm line-clamp-3">{post.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
