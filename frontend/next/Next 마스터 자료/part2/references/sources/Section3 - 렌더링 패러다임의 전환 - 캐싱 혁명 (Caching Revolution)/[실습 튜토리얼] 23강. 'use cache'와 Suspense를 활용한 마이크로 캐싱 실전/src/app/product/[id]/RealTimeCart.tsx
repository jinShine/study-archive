// src/app/product/[id]/RealTimeCart.tsx

export default async function RealTimeCart({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  // Suspense 내부의 안전한 격리 공간이므로, 동적 데이터를 마음껏 비동기로 풀어냅니다.
  const resolvedParams = await paramsPromise;

  // 캐시 지시어가 없으므로 접속할 때마다 서버의 최신 시간을 가져옵니다.
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-xl">
      <p className="font-bold text-blue-700 text-lg flex items-center gap-2">
        <span>🛒</span> 실시간 접속 현황 ({resolvedParams.id}번 상품)
      </p>
      <p className="text-blue-900 mt-2 font-mono text-xl">
        현재 접속 시간: <span className="font-black bg-white px-2 py-1 rounded shadow-sm">{currentTime}</span>
      </p>
    </div>
  );
}