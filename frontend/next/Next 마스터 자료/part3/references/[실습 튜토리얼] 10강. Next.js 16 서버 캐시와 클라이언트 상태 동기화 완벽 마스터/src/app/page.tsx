import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Next.js 캐시 완벽 실습</h1>
      <Link href="/posts" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition">
        🚀 실습 페이지로 이동
      </Link>
    </main>
  );
}
