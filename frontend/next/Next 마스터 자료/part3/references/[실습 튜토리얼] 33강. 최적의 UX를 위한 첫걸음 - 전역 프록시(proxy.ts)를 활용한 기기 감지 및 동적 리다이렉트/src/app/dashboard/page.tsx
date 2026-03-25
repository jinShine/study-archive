import { getUserFromDb } from '@/app/lib/db';

export default async function PcDashboardPage() {
  const user = await getUserFromDb('1');
  return (
    <main className="p-10 w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow-2xl">
      <h1 className="text-4xl font-extrabold mb-6 text-indigo-700 border-b pb-4">💻 PC 전용 빅데이터 대시보드</h1>
      <div className="p-6 bg-slate-50 rounded-lg text-lg space-y-4">
        <p>환영합니다, <strong>{user?.name}</strong> 님!</p>
        <p className="text-slate-600">이 페이지는 수많은 분석 그래프와 무거운 자바스크립트를 포함하고 있습니다.</p>
        <div className="w-full h-64 bg-slate-200 border-dashed border-4 border-slate-400 flex items-center justify-center rounded-xl text-slate-500 font-bold">
          [무거운 PC용 차트 렌더링 영역]
        </div>
      </div>
    </main>
  );
}
