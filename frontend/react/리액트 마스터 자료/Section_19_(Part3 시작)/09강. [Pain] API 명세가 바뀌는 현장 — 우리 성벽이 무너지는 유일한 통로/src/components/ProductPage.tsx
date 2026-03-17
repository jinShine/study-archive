/* [Copyright]: © nhcodingstudio 소유 */
import React, { useState, useEffect } from 'react';

interface ProductDetail {
  id: number;
  title: string;
  price: number;
}

export function ProductPage({ productId }: { productId: number }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);

  useEffect(() => {
    const simulateFetch = async () => {
      const responseFromServer = {
        id: productId,
        title: "고난의 타입스크립트 키보드",
        amount: 89000 // 'price'가 누락된 오염된 데이터
      };
      setProduct(responseFromServer as any as ProductDetail);
    };
    simulateFetch();
  }, [productId]);

  if (!product) return <div>상품 정보를 불러오는 중입니다...</div>;

  return (
    <div style={{ padding: '20px', border: '2px dashed red' }}>
      <h1>{product.title}</h1>
      <p style={{ color: 'red' }}>가격: {product.price.toLocaleString()}원</p>
    </div>
  );
}