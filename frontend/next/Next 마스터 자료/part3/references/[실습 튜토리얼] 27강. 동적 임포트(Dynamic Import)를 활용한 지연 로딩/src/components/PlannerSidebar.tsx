export default function PlannerSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-50 border-r border-gray-200 p-6 hidden md:block">
      <h2 className="text-xl font-bold mb-6 text-gray-800">스터디 플래너</h2>
      <ul className="space-y-4">
        <li className="text-blue-600 font-semibold cursor-pointer">대시보드</li>
        <li className="text-gray-600 hover:text-gray-900 cursor-pointer">학습 일지</li>
        <li className="text-gray-600 hover:text-gray-900 cursor-pointer">통계 분석</li>
      </ul>
    </aside>
  );
}
