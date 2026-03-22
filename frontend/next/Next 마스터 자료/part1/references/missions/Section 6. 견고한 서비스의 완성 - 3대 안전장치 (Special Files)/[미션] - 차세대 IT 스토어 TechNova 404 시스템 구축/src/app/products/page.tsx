import { notFound } from 'next/navigation';
export default function Page() {
  const products = []; 
  if (products.length === 0) notFound();
  return <div className="p-10 text-2xl font-bold">이 글자는 보이지 않습니다.</div>;
}
