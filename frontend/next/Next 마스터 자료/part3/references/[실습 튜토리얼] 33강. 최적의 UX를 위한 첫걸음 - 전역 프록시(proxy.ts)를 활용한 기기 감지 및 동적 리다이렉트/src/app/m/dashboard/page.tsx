import { getUserFromDb } from '@/app/lib/db';

export default async function MobileDashboardPage() {
  const user = await getUserFromDb('1');
  return (
    <main className="p-6 w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md">
      <h1 className="text-2xl font-extrabold mb-4 text-blue-600">📱 모바일 요약 대시보드</h1>
      <div className="p-4 bg-blue-50 rounded-xl text-base space-y-2">
        <p className="font-bold text-gray-800">{user?.name} 님, 안녕하세요!</p>
        <p className="text-sm text-blue-800 font-medium">🚀 프록시가 모바일 기기를 감지하여 가벼운 페이지로 0.01초 만에 안내했습니다!</p>
        <div className="w-full h-32 bg-blue-100 flex items-center justify-center rounded-lg text-blue-500 font-semibold text-sm">
          [가벼운 모바일용 요약 카드]
        </div>
      </div>
    </main>
  );
}
