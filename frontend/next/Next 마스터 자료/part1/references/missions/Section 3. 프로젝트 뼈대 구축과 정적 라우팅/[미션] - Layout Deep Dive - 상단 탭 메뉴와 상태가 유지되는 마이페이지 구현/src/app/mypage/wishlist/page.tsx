export default function WishlistPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">나의 위시리스트</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">💻</div>
          <p className="font-medium">최신형 M3 노트북</p>
          <button className="mt-4 text-sm text-red-500 font-semibold border border-red-200 px-4 py-1 rounded hover:bg-red-50">
            삭제
          </button>
        </div>
        <div className="border rounded-lg p-4 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">🎧</div>
          <p className="font-medium">노이즈 캔슬링 헤드폰</p>
          <button className="mt-4 text-sm text-red-500 font-semibold border border-red-200 px-4 py-1 rounded hover:bg-red-50">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
