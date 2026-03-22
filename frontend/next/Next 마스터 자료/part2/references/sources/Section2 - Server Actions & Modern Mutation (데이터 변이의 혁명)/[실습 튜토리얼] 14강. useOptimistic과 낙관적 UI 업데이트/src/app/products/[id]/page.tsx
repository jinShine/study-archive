import LikeButton from "@/app/components/LikeButton";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialLikedFromDB = false;

  return (
    <div className="p-10 font-sans max-w-xl mx-auto mt-10 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="text-sm text-blue-600 font-bold mb-2">상품 식별자: {id}</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">아키텍트 통제소 에디션 모니터</h1>
      <p className="text-gray-600 mb-8 leading-relaxed">낙관적 업데이트(Optimistic Update) 테스트를 위한 상세 페이지입니다. 버튼을 클릭하여 네트워크 지연이 소멸하는 기적을 확인하십시오.</p>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
        <span className="font-bold text-2xl text-gray-800">450,000원</span>
        <LikeButton productId={id} initialLiked={initialLikedFromDB} />
      </div>
    </div>
  );
}