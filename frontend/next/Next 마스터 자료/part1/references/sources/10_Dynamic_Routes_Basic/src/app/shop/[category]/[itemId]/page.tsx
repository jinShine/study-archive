/**
 * ShopItemPage: 카테고리와 아이디를 모두 동적으로 받는 중첩 라우트
 */
export default async function ShopItemPage({
  params,
}: {
  params: Promise<{ category: string; itemId: string }>;
}) {
  // 두 개의 동적 변수를 동시에 추출합니다.
  const { category, itemId } = await params;

  return (
    <div className="m-10 p-10 border-4 border-emerald-500 rounded-3xl bg-emerald-50">
      <h2 className="text-2xl font-black text-emerald-800 mb-6">🏬 중첩 라우팅 테스트 존</h2>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Category</span>
          <p className="text-xl font-bold text-slate-700">{category}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Item ID</span>
          <p className="text-xl font-bold text-slate-700">{itemId}</p>
        </div>
      </div>

      <p className="mt-8 text-emerald-600 text-sm font-medium">
        ✅ 주소창 예시: <code className="bg-emerald-200 px-1 rounded">/shop/electronics/macbook-pro</code>
      </p>
    </div>
  );
}
