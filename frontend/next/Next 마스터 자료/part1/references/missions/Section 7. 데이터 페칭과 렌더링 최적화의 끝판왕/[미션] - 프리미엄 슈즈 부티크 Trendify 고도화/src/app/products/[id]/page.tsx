export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await fetch('https://jsonplaceholder.typicode.com/posts').then(res => res.json());
  return posts.slice(0, 10).map((p: any) => ({ id: String(p.id) }));
}

export default async function Page({ params }: any) {
  const { id } = await params;
  const product = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(res => res.json());
  
  return (
    <div className="p-20 font-sans">
      <h1 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">Product #{id}</h1>
      <p className="text-2xl font-bold text-slate-800">{product.title}</p>
      <p className="mt-4 text-slate-500">{product.body}</p>
      <div className="mt-20 p-4 bg-slate-100 text-[10px] font-mono">Status: STATIC_PAGE_GENERATED</div>
    </div>
  );
}
