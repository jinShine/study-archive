/**
 * AmazonCategoryPage: 진공청소기처럼 모든 하위 경로를 빨아들이는 만능 페이지
 */
export default async function AmazonCategoryPage({
  params
}: {
  params: Promise<{ slug?: string[] }>
}) {
  // [강의 포인트] Optional Catch-all이므로 slug가 없을 때를 대비해 빈 배열([])을 기본값으로 할당합니다.
  const { slug = [] } = await params;

  // 현재 경로의 깊이(Depth) 파악
  const depth = slug.length;
  
  // 현재 카테고리 이름 (배열의 마지막 요소)
  const currentCategoryName = depth > 0 ? slug[depth - 1] : "Amazon Home";

  return (
    <div className="p-10 max-w-5xl mx-auto font-sans bg-white min-h-screen">
      {/* [실습 포인트] 헨젤과 그레텔의 '빵 부스러기(Breadcrumb)' 네비게이션 */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-12 bg-slate-50 p-4 rounded-2xl">
        <span className="font-black text-slate-800 tracking-tighter">AMAZON</span>
        {slug.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-slate-300">/</span>
            <span className="capitalize hover:text-orange-500 cursor-pointer transition-colors font-medium">
              {step}
            </span>
          </div>
        ))}
      </nav>

      <main>
        {depth === 0 ? (
          /* Case 1: /shop (메인 페이지) */
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-16 rounded-[3rem] text-center text-white shadow-2xl shadow-slate-200">
            <h1 className="text-5xl font-black mb-6 tracking-tight">오늘의 핫딜! 🔥</h1>
            <p className="text-slate-400 text-lg mb-8">전 세계의 모든 카테고리를 탐험해보세요.</p>
            <div className="flex justify-center gap-4">
               <div className="px-6 py-3 bg-orange-500 rounded-full font-bold">전체보기</div>
               <div className="px-6 py-3 bg-white/10 rounded-full font-bold border border-white/10">멤버십 가입</div>
            </div>
          </div>
        ) : (
          /* Case 2: /shop/... (하위 카테고리 페이지) */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-baseline gap-4 mb-8">
                <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tight">
                    {currentCategoryName}
                </h1>
                <span className="text-slate-400 font-mono text-sm">Depth: {depth}</span>
            </div>

            {/* [실습 포인트] 조건부 로직 - URL에 'sale'이 포함되면 할인 배너 출력 */}
            {slug.includes("sale") && (
              <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl mb-10 flex items-center gap-4 animate-pulse">
                <span className="text-3xl">📢</span>
                <div>
                    <p className="font-black text-red-600">마감 임박 세일 진행 중!</p>
                    <p className="text-red-500 text-sm opacity-80">이 카테고리의 모든 상품이 최대 70% 할인됩니다.</p>
                </div>
              </div>
            )}

            <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] shadow-inner shadow-blue-100/50">
              <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>📍</span> 현재 시스템이 파악한 경로 배열:
              </h4>
              <div className="flex flex-wrap gap-2">
                {slug.map((s, i) => (
                  <code key={i} className="px-3 py-1 bg-white rounded-lg text-pink-600 font-bold shadow-sm border border-pink-100">
                    "{s}"
                  </code>
                ))}
              </div>
              <p className="mt-6 text-sm text-blue-700/60 leading-relaxed font-medium">
                ※ 실제 서비스에서는 이 배열 데이터를 API 서버로 전송하여<br/> 
                해당하는 계층의 상품 데이터를 조회해오게 됩니다.
              </p>
            </div>
          </div>
        )}
      </main>
      
      {/* 테스트 링크 모음 */}
      <div className="mt-20 pt-10 border-t border-slate-100">
        <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-6">Test URLs</p>
        <div className="flex flex-wrap gap-3 text-xs font-bold">
           <a href="/shop" className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">/shop</a>
           <a href="/shop/electronics" className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">/shop/electronics</a>
           <a href="/shop/electronics/laptops/gaming" className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">/shop/electronics/laptops/gaming</a>
           <a href="/shop/clothing/sale/summer" className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">/shop/clothing/sale/summer</a>
        </div>
      </div>
    </div>
  );
}
