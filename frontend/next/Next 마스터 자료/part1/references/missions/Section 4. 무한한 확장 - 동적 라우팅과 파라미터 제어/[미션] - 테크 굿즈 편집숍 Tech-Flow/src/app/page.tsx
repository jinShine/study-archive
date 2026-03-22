import Link from "next/link";
export default function RootPage() {
  return (
    <div className="p-20 flex flex-col items-center text-center">
      <h1 className="text-6xl font-black mb-6 italic tracking-tighter uppercase">The Future</h1>
      <Link href="/products/galaxy-s24" className="p-6 bg-blue-600 text-white rounded-full font-black mb-4">동적 상세 페이지</Link>
      <Link href="/shop/tech/ipad" className="p-6 bg-emerald-600 text-white rounded-full font-black">중첩 동적 페이지</Link>
    </div>
  );
}
