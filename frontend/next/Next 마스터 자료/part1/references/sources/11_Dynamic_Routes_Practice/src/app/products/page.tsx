import Link from "next/link";

// [강의 내용] 가상의 Mock Data (추후 DB 연결의 기초가 됩니다)
const products = [
  { id: 1, name: "초경량 노트북", price: "1,200,000원" },
  { id: 2, name: "무소음 기계식 키보드", price: "185,000원" },
  { id: 3, name: "인체공학 버티컬 마우스", price: "89,000원" },
];

export default function ProductListPage() {
  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-black mb-10 text-slate-800">🏪 이달의 추천 상품</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-2xl">🎁</div>
            <h2 className="text-xl font-bold mb-2 text-slate-800">{product.name}</h2>
            <p className="text-blue-600 font-bold mb-6">{product.price}</p>

            {/* 핵심: 백틱을 사용해 /products/[id] 경로로 이동하는 동적 링크 생성 */}
            <Link
              href={`/products/${product.id}`}
              className="block w-full text-center bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
            >
              상세보기 &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
