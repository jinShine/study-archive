import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  adminNote: string;
  secretToken: string;
}

type UserViewProduct = Omit<Product, 'adminNote' | 'secretToken'>;

export function ProductDetail({ product }: { product: UserViewProduct }) {
  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', marginTop: '20px' }}>
      <h3>📦 상품 정보</h3>
      <p>상품명: <strong>{product.name}</strong></p>
      <p>판매가: {product.price.toLocaleString()}원</p>
    </div>
  );
}