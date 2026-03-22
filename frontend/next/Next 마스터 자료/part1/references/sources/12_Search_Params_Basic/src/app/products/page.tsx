import Link from "next/link";

// 1. 가상의 상품 데이터
const products = [
  { id: 1, name: "초경량 노트북", price: 1200000 },
  { id: 2, name: "무소음 기계식 키보드", price: 185000 },
  { id: 3, name: "인체공학 버티컬 마우스", price: 89000 },
];

// 2. [Next.js 15 핵심] PageProps 인터페이스 정의
// searchParams는 이제 비동기(Promise) 객체입니다.
interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function ProductListPage({ searchParams }: PageProps) {
  // [강의 포인트] 우체부 아저씨를 기다리듯 await로 데이터를 꺼냅니다.
  const { sort } = await searchParams;
  const sortOrder = sort;

  // 3. 정렬 로직 (불변성을 위해 복사본 [...products] 사용)
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === 'asc') return a.price - b.price;   // 낮은 가격순
    if (sortOrder === 'desc') return b.price - a.price;  // 높은 가격순
    return 0;
  });

  return (
    <div className="p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">🏪 이달의 추천 상품</h1>

          {/* [강의 포인트] Link를 통해 URL의 쿼리 스트링(?sort=...)을 변경합니다. */}
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 gap-1">
            <Link 
              href="/products?sort=asc" 
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${sortOrder === 'asc' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              가격 낮은 순 ⬇️
            </Link>
            <Link 
              href="/products?sort=desc" 
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${sortOrder === 'desc' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              가격 높은 순 ⬆️
            </Link>
            <Link 
              href="/products" 
              className="px-4 py-2 text-slate-400 hover:text-slate-600 rounded-xl text-sm font-bold"
            >
              초기화 🔄
            </Link>
          </div>
        </div>

        {/* 정렬된 상품 목록 출력 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sortedProducts.map((product) => (
            <div key={product.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-inner">📦</div>
              <h2 className="text-xl font-bold mb-2 text-slate-800">{product.name}</h2>
              <p className="text-blue-600 font-black text-2xl mb-6">{product.price.toLocaleString()}원</p>
              
              <Link
                href={`/products/${product.id}`}
                className="block w-full text-center bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
              >
                상세보기 &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
