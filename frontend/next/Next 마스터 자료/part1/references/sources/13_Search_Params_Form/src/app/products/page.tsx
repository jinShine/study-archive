import Link from "next/link";
import Search from "@/components/Search";

// 1. 가상의 상품 데이터 (Mock Data)
const products = [
  { id: 1, name: "초경량 노트북", price: 1200000 },
  { id: 2, name: "무소음 기계식 키보드", price: 185000 },
  { id: 3, name: "인체공학 버티컬 마우스", price: 89000 },
  { id: 4, name: "게이밍 모니터 32인치", price: 450000 },
];

// 2. Next.js 15 표준 PageProps
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductListPage({ searchParams }: PageProps) {
  // ★ 비동기로 URL 파라미터를 가져옵니다.
  const params = await searchParams;

  // 3. 타입 안전성 확보 (배열인 경우 방지)
  const query = typeof params.q === 'string' ? params.q : "";
  const sortOrder = typeof params.sort === 'string' ? params.sort : "";

  // 4. 서버 사이드 필터링 및 정렬
  let filteredProducts = [...products];

  // (1) 검색어 필터링
  if (query) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.includes(query)
    );
  }

  // (2) 가격 정렬
  if (sortOrder === "asc") filteredProducts.sort((a, b) => a.price - b.price);
  else if (sortOrder === "desc") filteredProducts.sort((a, b) => b.price - a.price);

  return (
    <div className="p-10 max-w-5xl mx-auto font-sans bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-black mb-12 text-slate-800 tracking-tight">🏪 Nyan-Match Market</h1>

      {/* 상단 컨트롤 영역 */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center">
        <div className="flex-1 w-full">
          <Search initialQuery={query} />
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 gap-1">
          {/* Link 컴포넌트에 객체 형태의 href를 전달하여 q와 sort를 유지합니다. */}
          <Link
            href={{ query: { q: query, sort: 'asc' } }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${sortOrder === 'asc' ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            가격 낮은 순
          </Link>
          <Link
            href={{ query: { q: query, sort: 'desc' } }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${sortOrder === 'desc' ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            가격 높은 순
          </Link>
        </div>
      </div>

      {/* 결과 리스트 */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all">
              <h2 className="text-xl font-bold mb-2 text-slate-800">{p.name}</h2>
              <p className="text-blue-600 font-black text-2xl mb-8">{p.price.toLocaleString()}원</p>
              <Link
                href={`/products/${p.id}`}
                className="block w-full text-center bg-slate-50 text-slate-900 py-4 rounded-2xl font-bold hover:bg-slate-900 hover:text-white transition-all"
              >
                자세히 보기
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] shadow-inner border border-dashed border-slate-200">
          <p className="text-slate-400 font-bold text-xl mb-4">" {query} " 에 대한 검색 결과가 없어요. 😿</p>
          <Link href="/products" className="text-blue-600 font-bold hover:underline">전체 목록 돌아가기</Link>
        </div>
      )}
    </div>
  );
}
