import Link from 'next/link';
// URL: localhost:3000/
export default function Page() {
  return <div className="p-20 text-center">
    <h1 className="text-6xl font-black mb-10">에티오피아 게이샤, 그 찬란한 향기.</h1>
    <Link href="/pos" className="bg-stone-900 text-white px-8 py-3 rounded-full">직원 대시보드 구경하기</Link>
  </div>;
}
