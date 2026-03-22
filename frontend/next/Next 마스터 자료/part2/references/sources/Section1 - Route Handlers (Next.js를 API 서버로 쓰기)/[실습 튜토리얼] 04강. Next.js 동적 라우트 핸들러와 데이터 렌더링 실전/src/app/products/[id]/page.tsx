interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await fetch(`http://localhost:3000/api/products/${id}`, {
    cache: "no-store",
  });

  const product: Product = await response.json();

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", marginTop: "20px" }}>
      <h1>상품 상세 제어소</h1>
      <hr />
      <p><strong>상품 식별자:</strong> {product.name}</p>
      <p><strong>측정 가치:</strong> {product.price.toLocaleString()}원</p>
      <p><strong>시스템 로그:</strong> {product.description}</p>
      <p><small style={{ color: "gray" }}>요청된 타겟 ID: {id}</small></p>
    </div>
  );
}