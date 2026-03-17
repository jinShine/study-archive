import { useParams } from 'react-router';
export default function ProductDetail() {
  const { productId } = useParams();
  return (
    <div style={{ padding: '20px' }}>
      <h2>Product ID: {productId}</h2>
      <p>이곳은 {productId}번 상품의 상세 페이지입니다.</p>
    </div>
  );
}