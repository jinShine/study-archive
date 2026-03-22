export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 border-l-8 border-l-emerald-500">
        <h2 className="text-3xl font-black mb-4 tracking-tight">⚙️ System Settings</h2>
        <p className="text-slate-500 mb-10">
          레이아웃은 유지된 채, 오직 콘텐츠 영역만 교체되었습니다.
        </p>

        <div className="space-y-4 max-w-md">
          <label className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
             <span className="font-bold text-slate-700">Email Notifications</span>
             <input type="checkbox" className="w-6 h-6 accent-emerald-500" defaultChecked />
          </label>
          <label className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
             <span className="font-bold text-slate-700">Dark Mode</span>
             <input type="checkbox" className="w-6 h-6 accent-emerald-500" />
          </label>
        </div>
      </div>
    </div>
  );
}
