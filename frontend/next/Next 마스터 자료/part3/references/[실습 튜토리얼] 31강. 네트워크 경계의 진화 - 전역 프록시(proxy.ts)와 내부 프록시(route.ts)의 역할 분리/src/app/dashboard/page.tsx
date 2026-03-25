import StudyAnalyzer from '../components/StudyAnalyzer';

export default function DashboardPage() {
  return (
    <main className="flex flex-col items-center p-10 bg-white border border-gray-200 rounded-xl shadow-lg w-full max-w-2xl text-center">
      <h1 className="text-3xl font-extrabold text-blue-600 mb-4">VIP 대시보드</h1>
      <p className="text-gray-600">이곳은 전역 프록시(proxy.ts)를 통과해야만 들어올 수 있습니다.</p>
      <StudyAnalyzer />
    </main>
  );
}
