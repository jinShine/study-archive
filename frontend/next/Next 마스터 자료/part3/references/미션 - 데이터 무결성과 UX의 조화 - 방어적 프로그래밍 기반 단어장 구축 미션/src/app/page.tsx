import CartForm from '@/components/CartForm';
import CartList from '@/components/CartList';
export default function Page() {
  return (
    <main className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-4xl font-black mb-10 text-center text-gray-900 tracking-tight italic">CART MASTER</h1>
      <CartForm /><CartList />
    </main>
  );
}