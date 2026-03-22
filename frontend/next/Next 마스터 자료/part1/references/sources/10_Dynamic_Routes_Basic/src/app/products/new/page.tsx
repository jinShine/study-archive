export default function NewProductPage() {
  return (
    <div className="p-10 bg-orange-500 text-white rounded-3xl m-10 shadow-2xl shadow-orange-200 text-center">
      <h1 className="text-4xl font-black mb-4">✨ 신상품 등록 페이지</h1>
      <p className="font-bold">이 페이지는 [slug] 와일드카드보다 우선순위가 높습니다.</p>
      <p className="opacity-80 mt-2 text-sm">(/products/new 로 접속 시 이 화면이 보입니다)</p>
    </div>
  );
}
