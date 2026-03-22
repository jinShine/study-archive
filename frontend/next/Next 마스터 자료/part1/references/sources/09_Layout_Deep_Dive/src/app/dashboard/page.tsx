export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 h-[1500px]">
        <h2 className="text-4xl font-black mb-4">👋 Welcome Back!</h2>
        <p className="text-slate-500 mb-10 text-lg">
          오른쪽 스크롤을 쭉 내려보세요. <br/>
          스크롤을 내려도 <strong>왼쪽 사이드바는 그대로 고정</strong>되어 있습니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-500 p-8 rounded-2xl text-white shadow-blue-200 shadow-lg">
              <h3 className="font-bold opacity-80">Total Visitors</h3>
              <p className="text-3xl font-black mt-2">1,234</p>
          </div>
          <div className="bg-emerald-500 p-8 rounded-2xl text-white shadow-emerald-200 shadow-lg">
              <h3 className="font-bold opacity-80">Revenue</h3>
              <p className="text-3xl font-black mt-2">$ 54,321</p>
          </div>
          <div className="bg-indigo-500 p-8 rounded-2xl text-white shadow-indigo-200 shadow-lg">
              <h3 className="font-bold opacity-80">New Signups</h3>
              <p className="text-3xl font-black mt-2">89</p>
          </div>
        </div>
      </div>
    </div>
  );
}
