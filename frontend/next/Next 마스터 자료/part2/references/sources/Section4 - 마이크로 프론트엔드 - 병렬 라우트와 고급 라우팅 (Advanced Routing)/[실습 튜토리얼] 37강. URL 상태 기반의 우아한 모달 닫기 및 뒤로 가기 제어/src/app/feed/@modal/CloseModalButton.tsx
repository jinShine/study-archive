'use client';
import { useRouter } from 'next/navigation';
export default function CloseModalButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="absolute top-4 right-4 p-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-bold">
      ✕ 닫기
    </button>
  );
}