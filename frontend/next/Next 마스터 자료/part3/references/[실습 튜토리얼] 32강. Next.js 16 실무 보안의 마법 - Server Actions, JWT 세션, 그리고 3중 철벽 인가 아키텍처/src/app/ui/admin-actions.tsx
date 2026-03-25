import { verifySession } from '@/app/lib/dal';

export async function AdminActions() {
  const session = await verifySession();
  if (session.role !== 'admin') return null;
  return (
    <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded text-center">
      <p className="text-red-700 font-bold mb-2">🚨 관리자 전용 구역 🚨</p>
      <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">사용자 계정 삭제</button>
    </div>
  );
}