import Link from 'next/link';
export default function HomePage() {
  return (
    <main className="p-20">
      <h1 className="text-8xl font-black mb-20 tracking-tighter">GALLERY</h1>
      <div className="grid grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <Link key={id} href={`/photo/${id}`} className="aspect-square bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-200 transition-all text-xs tracking-widest">
            PIECE {id}
          </Link>
        ))}
      </div>
    </main>
  );
}