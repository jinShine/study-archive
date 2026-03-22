export default async function ProductsPage() {
  const res = await fetch("http://localhost:3000/api/mock-products", { cache: "force-cache" });
  const products = res.ok ? await res.json() : [];

  return (
    <div className="p-10 font-sans max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0070f3] mb-6">전체 상품 통제소</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200 m-0 p-0 list-none">
          {products.length === 0 ? <li className="p-6 text-center text-gray-500">캐시 스냅샷에 멈춰있습니다.</li> : 
            products.map((p: any) => (
              <li key={p.id} className="p-4 hover:bg-gray-50 flex justify-between items-center transition-colors">
                <span className="font-semibold">{p.title}</span><span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-bold">{p.price.toLocaleString()}원</span>
              </li>
          ))}
        </ul>
      </div>
    </div>
  );
}