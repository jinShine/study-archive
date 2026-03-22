import Link from "next/link";

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">마이페이지</h1>
        <input 
          type="text" 
          placeholder="내 기록 검색하기..." 
          className="border border-gray-300 p-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </header>

      <nav className="flex space-x-4 border-b border-gray-200 mb-8 pb-4">
        <Link href="/mypage" className="px-4 py-2 font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition">
          👤 프로필
        </Link>
        <Link href="/mypage/orders" className="px-4 py-2 font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition">
          📦 주문 내역
        </Link>
        <Link href="/mypage/wishlist" className="px-4 py-2 font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition">
          ❤️ 위시리스트
        </Link>
      </nav>

      <main className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
        {children}
      </main>
    </div>
  );
}
