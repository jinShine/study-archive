export default function DashboardPage() {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-8 bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
        <h3 className="text-2xl font-black mb-2 tracking-tight">App Group Area</h3>
        <p className="opacity-80">이곳은 대시보드입니다. 마케팅 레이아웃과는 완전히 격리되어 있습니다.</p>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 shadow-sm"></div>
        ))}
      </div>
    </div>
  );
}
