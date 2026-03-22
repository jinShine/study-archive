import { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(res => res.json());
  
  return {
    title: `${product.title} | Lux-Jewel`,
    description: product.body.slice(0, 100),
    openGraph: {
      title: product.title,
      images: [`https://picsum.photos/seed/${id}/1200/630`],
    }
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(res => res.json());
  
  return (
    <div className="p-20">
      <h1 className="text-4xl font-black mb-6 text-amber-600 uppercase tracking-tighter italic border-b-2 pb-4">{product.title}</h1>
      <p className="text-xl text-slate-700 leading-loose">{product.body}</p>
    </div>
  );
}
