import Link from 'next/link';
export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-black text-zinc-900 mb-8 tracking-tighter">THE STORE</h1>
      <Link href="/cart" className="px-10 py-4 bg-indigo-600 text-white rounded-full hover:scale-105 transition-transform shadow-xl shadow-indigo-200">
        View Cart
      </Link>
    </main>
  );
}