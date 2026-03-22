interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: DetailPageProps) {
  // [강의 포인트] params 또한 주소창 정보이므로 await가 필수입니다.
  const { id } = await params;

  return (
    <div className="p-20 text-center">
      <h1 className="text-3xl font-black text-slate-800 mb-4">상품 ID: {id}</h1>
      <p className="text-slate-500">상세 페이지에서도 비동기 params 패턴이 적용되었습니다.</p>
    </div>
  );
}
