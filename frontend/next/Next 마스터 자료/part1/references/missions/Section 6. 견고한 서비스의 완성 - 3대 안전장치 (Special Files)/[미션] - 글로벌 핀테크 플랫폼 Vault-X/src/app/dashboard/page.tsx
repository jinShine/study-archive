/**
 * DashboardPage: 서버 컴포넌트 (비동기 데이터 fetch 시뮬레이션)
 */
export default async function DashboardPage() {
  // 1. 사용자 체감을 위한 인위적인 지연 (loading.tsx가 있다면 여기서 작동함)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 2. 카오스 엔지니어링: 50% 확률로 에러를 던져 복구 메커니즘을 테스트합니다.
  if (Math.random() < 0.5) {
    throw new Error("금융 데이터베이스 접속 시간 초과 (Timeout)");
  }

  // 3. 성공 시 출력되는 대시보드 UI
  return (
    <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in duration-700">
      <h1 className="text-3xl font-black text-slate-900 mb-8">My Assets</h1>
      <div className="grid grid-cols-2 gap-6">
        {/* 자산 현황 섹션 */}
        <div className="p-8 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
          <p className="text-emerald-600 font-bold mb-2">Total Balance</p>
          <p className="text-4xl font-black text-slate-900">$1,245,000</p>
        </div>
        {/* 수익 현황 섹션 */}
        <div className="p-8 bg-blue-50 rounded-2xl border-2 border-blue-100">
          <p className="text-blue-600 font-bold mb-2">Monthly Profit</p>
          <p className="text-4xl font-black text-slate-900">+$12,400</p>
        </div>
      </div>
    </div>
  );
}