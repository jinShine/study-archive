export default function DashboardPage() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg h-[2000px]">
      <h2 className="text-3xl font-bold mb-4">👋 환영합니다!</h2>
      <p className="text-gray-600 mb-8">
        이곳은 대시보드 메인 화면입니다. <br/>
        오른쪽 스크롤을 쭉 내려보세요. <br/>
        하지만 왼쪽 사이드바는 그 자리에 고정되어 있을 겁니다.
      </p>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-700">총 방문자</h3>
            <p className="text-2xl mt-2">1,234명</p>
        </div>
      </div>
    </div>
  );
}
