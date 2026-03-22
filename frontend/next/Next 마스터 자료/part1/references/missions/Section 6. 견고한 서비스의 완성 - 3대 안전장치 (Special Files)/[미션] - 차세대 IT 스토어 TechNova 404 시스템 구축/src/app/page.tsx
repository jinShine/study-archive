import Link from 'next/link';
export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-6xl font-black mb-8">Next.js 404 Lab</h1>
      <div className="flex gap-4">
        <Link href="/wrong-url" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold">오타 주소 테스트</Link>
        <Link href="/products" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold">빈 데이터 테스트</Link>
      </div>
    </div>
  );
}
