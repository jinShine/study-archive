/**
 * ProductDetailPage: 단 하나의 파일로 10만 개의 상품 페이지를 처리합니다.
 * @param params - URL에서 추출된 동적 파라미터 (Promise 타입)
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // [강의 포인트] 비동기적으로 params를 기다려(await) 데이터를 추출합니다.
  const { slug } = await params;

  return (
    <div className="p-10 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto mt-20">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">📦</span>
        <h1 className="text-3xl font-black text-slate-800">상품 상세 정보</h1>
      </div>
      
      <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-slate-500 font-medium mb-2">고객님이 요청하신 상품 코드(slug):</p>
        <p className="text-5xl font-black text-blue-600 tracking-tight">
          {slug}
        </p>
      </div>

      <div className="mt-8 text-sm text-slate-400 italic">
        💡 URL 주소창의 마지막 부분을 마음대로 바꿔보세요! <br/>
        (예: /products/iphone, /products/macbook, /products/12345)
      </div>
    </div>
  );
}
