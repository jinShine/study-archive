import { notFound } from 'next/navigation';

export default function ProductsPage() {
  // [강의 포인트] 2026년 실무 시나리오: DB에서 데이터를 가져왔으나 빈 배열인 경우
  const products: any[] = []; 

  // 데이터가 없으면 즉시 렌더링을 중단하고 가장 가까운 not-found.tsx를 호출합니다.
  if (products.length === 0) {
    notFound();
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">상품 목록</h1>
      {/* 데이터가 있다면 여기에 렌더링 로직이 올 것입니다. */}
    </div>
  );
}
