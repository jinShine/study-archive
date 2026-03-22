import Link from 'next/link';
export default function Home() {
  return (
    <div className="p-20 text-center">
      <h1 className="text-5xl font-black mb-10">Welcome to StreamFlix</h1>
      <Link href="/movies" className="bg-red-600 px-10 py-4 rounded-full font-bold text-white">영화 목록 보기 (3초 로딩 테스트)</Link>
    </div>
  );
}
