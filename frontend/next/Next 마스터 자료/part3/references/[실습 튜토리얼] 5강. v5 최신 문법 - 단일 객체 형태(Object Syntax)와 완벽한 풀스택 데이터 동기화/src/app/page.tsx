import ProductDetail from '@/components/ProductDetail';

export default function HomePage() {
  return (
    <main>
      <h1 className="text-center text-4xl font-black mb-10 text-gray-900">v5 문법 실습장</h1>
      <ProductDetail productId={1} />
    </main>
  );
}