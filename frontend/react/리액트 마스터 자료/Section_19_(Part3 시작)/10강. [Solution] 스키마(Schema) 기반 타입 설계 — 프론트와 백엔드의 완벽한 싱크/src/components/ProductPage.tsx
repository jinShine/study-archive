/* [Copyright]: © nhcodingstudio 소유 */
import React, { useState, useEffect } from 'react';

interface ProductDetail {
  id: number;
  title: string;
  price: number;
}

function validateProduct(data: any): data is ProductDetail {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.title === 'string' &&
    typeof data.price === 'number'
  );
}

export function ProductPage({ productId }: { productId: number }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mockFetch = async () => {
      // 서버가 약속을 어긴 상황 시뮬레이션 (price가 문자열)
      const data = {
        id: productId,
        title: "방어막이 작동하는 키보드",
        price: "89,000원" // number여야 하므로 검증에서 탈락함
      };

      if (validateProduct(data)) {
        setProduct(data);
        setError(null);
      } else {
        setError("데이터 규격 불일치: 가격 정보가 숫자가 아닙니다.");
      }
    };
    mockFetch();
  }, [productId]);

  if (error) return <div style={{color: 'red', border: '1px solid red', padding: '10px'}}>{error}</div>;
  if (!product) return <div>상품 정보를 검사 중...</div>;

  return (
    <div>
      <h1>{product.title}</h1>
      <p>가격: {product.price.toLocaleString()}원</p>
    </div>
  );
}