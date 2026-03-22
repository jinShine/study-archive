// 상세 정보를 포함한 데이터 배열
const products = [
  { id: 1, name: "초경량 노트북", price: "1,200,000원", description: "가방에 넣은 줄도 모르는 가벼움! 대학생 강추 아이템." },
  { id: 2, name: "무소음 기계식 키보드", price: "185,000원", description: "사무실에서도 눈치 보지 않고 타건감을 즐기세요." },
  { id: 3, name: "인체공학 버티컬 마우스", price: "89,000원", description: "손목 터널 증후군 예방을 위한 최고의 선택." },
];

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Next.js 15 규칙: 비동기로 params에서 id를 꺼냅니다.
  const { id } = await params;

  // 2. 탐정 역할의 find 메서드로 URL ID와 일치하는 상품을 찾습니다.
  // URL 파라미터(string)를 숫자(number)로 변환하여 비교합니다.
  const product = products.find((p) => p.id === parseInt(id));

  // 3. 예외 처리: 데이터가 없는 경우
  if (!product) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-4xl font-black text-slate-300 mb-4">404</h1>
        <p className="text-slate-500">존재하지 않는 상품입니다.</p>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-2xl mx-auto mt-10">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-6xl opacity-10">📦</div>
        
        <span className="bg-blue-50 text-blue-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
            Best Item
        </span>
        
        <h1 className="text-4xl font-black mt-6 mb-2 text-slate-800 tracking-tight">{product.name}</h1>
        <p className="text-2xl text-blue-600 font-black mb-8">{product.price}</p>

        <div className="h-px bg-slate-100 w-full mb-8" />

        <p className="text-lg text-slate-600 leading-relaxed mb-10 font-medium">
            {product.description}
        </p>

        <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-600 hover:scale-[1.02] transition-all shadow-xl shadow-blue-100">
            장바구니 담기
        </button>
      </div>
    </div>
  );
}
