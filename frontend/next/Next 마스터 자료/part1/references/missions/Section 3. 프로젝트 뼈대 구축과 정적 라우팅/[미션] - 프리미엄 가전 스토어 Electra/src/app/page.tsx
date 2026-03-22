import Link from "next/link";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6">
      <h1 className="text-6xl font-black italic tracking-tighter">SMART LIFE</h1>
      <Link href="/products" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-full shadow-xl">SHOPPING START</Link>
    </div>
  );
}
