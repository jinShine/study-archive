'use client';
import { useQuery } from '@tanstack/react-query';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
}

export default function ProductDetail({ productId }: { productId: number }) {
  const { data: product, isPending, isError, error } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
      if (!response.ok) throw new Error('상품 서버 통신 오류');
      return response.json();
    },
    staleTime: 1000 * 30,
  });

  if (isPending) return <div className="p-10">데이터를 요리하는 중...</div>;
  if (isError) return <div className="p-10 text-red-500 text-center">에러: {error.message}</div>;

  return (
    <article className="p-8 border rounded-xl shadow-md bg-white max-w-lg mx-auto mt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h1>
      <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
      <div className="text-2xl font-semibold text-blue-600">${product.price}</div>
    </article>
  );
}