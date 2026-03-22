import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <div className="relative mb-8">
        <h1 className="text-9xl font-black text-indigo-200">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-[#FF6A3D] text-white px-4 py-1 rounded font-black rotate-12">Page Not Found</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-8">길을 잃으셨나요?</h3>
      <Link href="/" className="bg-slate-900 text-white px-8 py-4 rounded-lg font-bold">홈으로 돌아가기</Link>
    </div>
  );
}
